import { DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Readable } from "stream"
import { CloudStorage } from "../../types/cloud"
import { AwsConfig } from "../../types/config"
import { FileMetadata } from "../../types/metadata"

export class S3Service extends CloudStorage {
    private readonly client: S3Client
    private readonly bucket: string

    constructor(config: AwsConfig) {
        super()

        if (config.bucket == null)
            throw new Error("Bucket must be provided")

        if (config.region == null)
            throw new Error("Region must be provided")

        if (config.credentials == null)
            throw new Error("Credentials must be provided")

        this.bucket = config.bucket
        this.client = new S3Client({
            region: config.region,
            credentials:
                {
                    accessKeyId: config.credentials.accessKeyId,
                    secretAccessKey: config.credentials.secretAccessKey
                }
        })
    }

    async uploadFile(
        key: string,
        file: Buffer | Readable,
        contentType?: string
    ) {
        try {
            await this.client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: file,
                    ContentType: contentType
                })
            )
        } catch (error: any) {
            throw new Error(`Failed to upload file: ${error.message}`)
        }
    }

    async downloadFile(key: string): Promise<GetObjectCommandOutput> {
        try {
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

    async deleteFile(key: string) {
        try {
            await this.client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key
                })
            )
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
                url: "" //TODO: signed url
                // url: this.getSignedUrl(key)
            }

        } catch (error: any) {
            throw new Error(`Failed to get file: ${error.message}`)
        }
    }

    async getFilesList(maxKeys: number = 1000, prefix?: string) {
        try {
            const response = await this.client.send(
                new ListObjectsV2Command({
                    Bucket: this.bucket,
                    Prefix: prefix,
                    MaxKeys: maxKeys
                })
            )

            return []

            //TODO: file metadata

            // return (response.Contents || []).map<FileMetadata>((item) => ({
            //     key: item.Key,
            //     size: item.Size,
            //     lastModified: item.LastModified,
            //     url: this.getSignedUrl(item.Key!)
            // }))
        } catch (error: any) {
            throw new Error(`Failed to list files: ${error.message}`)
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600) {
        try {
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
