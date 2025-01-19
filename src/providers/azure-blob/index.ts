import { BlobDownloadResponseModel, BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob"
import { CloudStorage } from "../../types/cloud"
import { AzureConfig } from "../../types/config"
import { FileMetadata } from "../../types/metadata"

export class AzureBlobService extends CloudStorage {
    private readonly client: BlobServiceClient
    private readonly bucket: ContainerClient

    constructor(config: AzureConfig) {
        super()

        if (config.connectionString == null)
            throw new Error("Connection string must be provided")

        if (config.container == null)
            throw new Error("Container parameter must be provided")

        this.client = BlobServiceClient.fromConnectionString(config.connectionString)
        this.bucket = this.client.getContainerClient(config.container)
    }

    async exists(key: string): Promise<boolean> {
        try {
            const blockBlobClient = this.bucket.getBlockBlobClient(key)
            return await blockBlobClient.exists()
        } catch (error: any) {
            throw new Error(`Failed to check if file exists: ${error.message}`)
        }
    }

    async uploadFile(
        key: string,
        file: Buffer,
        contentType?: string
    ): Promise<string> {
        try {
            const blockBlobClient = this.bucket.getBlockBlobClient(key)
            await blockBlobClient.upload(file, file.length, {
                blobHTTPHeaders: {
                    blobContentType: contentType
                }
            })

            return this.getSignedUrl(key)
        } catch (error: any) {
            throw new Error(`Failed to upload file: ${error.message}`)
        }
    }

    async downloadFile(key: string): Promise<BlobDownloadResponseModel> {
        try {
            const blockBlobClient = this.bucket.getBlockBlobClient(key)
            return await blockBlobClient.download(0)
        } catch (error: any) {
            throw new Error(`Failed to download file: ${error.message}`)
        }
    }

    async deleteFile(key: string): Promise<boolean> {
        try {
            const blockBlobClient = this.bucket.getBlockBlobClient(key)
            await blockBlobClient.delete()

            return true
        } catch (error: any) {
            throw new Error(`Failed to delete file: ${error.message}`)
        }
    }

    async getFile(key: string): Promise<FileMetadata> {
        try {
            const blockBlobClient = this.bucket.getBlockBlobClient(key)
            const properties = await blockBlobClient.getProperties()
            const data = await this.downloadFile(key)

            return {
                key: key,
                lastModified: properties.lastModified,
                size: properties.contentLength,
                type: properties.contentType,
                url: await this.getSignedUrl(key)
            }
        } catch (error: any) {
            throw new Error(`Failed to get file: ${error.message}`)
        }
    }

    async getFilesList(maxKeys: number = 1000, prefix?: string) {
        try {
            const results: FileMetadata[] = []

            const iterator = this.bucket.listBlobsFlat({
                prefix
            })

            for await (const blob of iterator) {
                results.push({
                    key: blob.name,
                    size: blob.properties.contentLength || 0,
                    lastModified: blob.properties.lastModified,
                    type: blob.properties.contentType,
                    url: await this.getSignedUrl(blob.name)
                })

                if (results.length >= maxKeys) {
                    break
                }
            }

            return results
        } catch (error: any) {
            throw new Error(`Failed to list files: ${error.message}`)
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600) {
        try {
            const blockBlobClient: BlockBlobClient = this.bucket.getBlockBlobClient(key)

            const startsOn = new Date()
            const expiresOn = new Date(startsOn)

            expiresOn.setSeconds(startsOn.getSeconds() + expiresIn)

            return await blockBlobClient.generateSasUrl({ startsOn, expiresOn })
        } catch (error: any) {
            throw new Error(`Failed to generate signed URL: ${error.message}`)
        }
    }
}
