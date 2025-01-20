import { _Object, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Readable } from "stream"
import { CloudStorage } from "../../types/cloud"
import { AwsConfig, DigitalOceanConfig } from "../../types/config"
import { FileMetadata } from "../../types/metadata"
import { extractExtension, isFolder } from "../../utils/extension"

export class S3Service extends CloudStorage {
  private readonly client: S3Client
  private readonly bucket: string

  constructor(config: AwsConfig | DigitalOceanConfig) {
    super()

    if (config.bucket == null || config.bucket.trim().length == 0)
      throw new Error("Bucket must be provided")

    if (config.region == null || config.region.trim().length == 0)
      throw new Error("Region must be provided")

    if (config.credentials == null)
      throw new Error("Credentials must be provided")

    this.bucket = config.bucket
    this.client = new S3Client(config)
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key
        })
      )
      return true
    } catch (error: any) {
      if (error.name === "NotFound") {
        return false
      }
      throw new Error(`Failed to check if file exists: ${error.message}`)
    }
  }

  async uploadFile(
    key: string,
    file: Buffer | Readable,
    contentType?: string
  ): Promise<string> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file,
          ContentType: contentType
        })
      )

      return this.getSignedUrl(key)
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }
  }

  async downloadFile(key: string): Promise<GetObjectCommandOutput> {
    try {
      if (!await this.exists(key))
        throw new Error("The specified key does not exist.")

      return await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key
        })
      )
    } catch (error: any) {
      throw new Error(`Failed to download file: ${error.message}`)
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      if (!await this.exists(key))
        throw new Error("The specified key does not exist.")

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key
        })
      )

      return true
    } catch (error: any) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }

  async getFile(key: string): Promise<FileMetadata> {
    try {
      const data = await this.downloadFile(key)
      return {
        key: key,
        lastModified: data.LastModified,
        size: data.ContentLength,
        type: data.ContentType || isFolder(key) ? "folder" : "",
        url: await this.getSignedUrl(key)
      }

    } catch (error: any) {
      throw new Error(`Failed to get file: ${error.message}`)
    }
  }

  async getFilesList(maxKeys?: number, prefix?: string): Promise<FileMetadata[]> {
    try {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          MaxKeys: maxKeys ?? 1000
        })
      )

      return await Promise.all(
        (response.Contents || []).map(async (item: _Object) => ({
          key: item.Key,
          size: item.Size,
          lastModified: item.LastModified,
          type: extractExtension(item.Key) || (isFolder(item.Key) ? "folder" : ""),
          url: await this.getSignedUrl(item.Key ?? "")
        }))
      )
    } catch (error: any) {
      throw new Error(`Failed to list files: ${error.message}`)
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (!await this.exists(key))
        throw new Error("The specified key does not exist.")

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      return await getSignedUrl(this.client, command, { expiresIn })
    } catch (error: any) {
      throw new Error(`Failed to generate signed URL: ${error.message}`)
    }
  }
}
