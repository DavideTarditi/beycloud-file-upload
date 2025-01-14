import { BlobDownloadResponseModel, BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob"
import { CloudStorage } from "../../types/cloud"
import { Configuration, FileMetadata } from "../../types/config"

export class AzureBlobService extends CloudStorage {
    private readonly client: BlobServiceClient
    private readonly bucket: ContainerClient

    constructor(config: Configuration) {
        super()

        if (config.connectionString == null)
            throw new Error("Connection string must be provided")

        if (config.container == null)
            throw new Error("Container parameter must be provided")

        this.client = BlobServiceClient.fromConnectionString(config.connectionString)
        this.bucket = this.client.getContainerClient(config.container)
    }

    /**
     * Upload a file to Azure Blob Storage
     * @param key - The file key (path/filename)
     * @param file - The file buffer or stream
     * @param contentType - The file's content type
     */
    async uploadFile(
        key: string,
        file: Buffer,
        contentType?: string
    ) {
        try {
            const blockBlobClient = this.bucket.getBlockBlobClient(key)
            await blockBlobClient.upload(file, file.length, {
                blobHTTPHeaders: {
                    blobContentType: contentType
                }
            })
        } catch (error: any) {
            throw new Error(`Failed to upload file: ${error.message}`)
        }
    }

    /**
     * Download a file from Azure Blob Storage
     * @param key - The file key (path/filename)
     * @returns The file data
     */
    async downloadFile(key: string): Promise<BlobDownloadResponseModel> {
        try {
            const blockBlobClient = this.bucket.getBlockBlobClient(key)
            return await blockBlobClient.download(0)
        } catch (error: any) {
            throw new Error(`Failed to download file: ${error.message}`)
        }
    }

    /**
     * Delete a file from Azure Blob Storage
     * @param key - The file key (path/filename)
     */
    async deleteFile(key: string) {
        try {
            const blockBlobClient = this.bucket.getBlockBlobClient(key)
            await blockBlobClient.delete()
        } catch (error: any) {
            throw new Error(`Failed to delete file: ${error.message}`)
        }
    }

    /**
     * Get a file object from Azure Blob Storage
     * @param key - The file key (path/filename)
     * @returns File metadata and data
     */
    async getFile(key: string): Promise<FileMetadata> {
        try {
            const blockBlobClient = this.bucket.getBlockBlobClient(key)
            const properties = await blockBlobClient.getProperties()
            const data = await this.downloadFile(key)

            return {
                key: key,
                lastModified: properties.lastModified,
                size: properties.contentLength,
                url: "" //TODO: signed url
            }
        } catch (error: any) {
            throw new Error(`Failed to get file: ${error.message}`)
        }
    }

    /**
     * Get a list of files from Azure Blob Storage
     * @param prefix - Optional prefix to filter files
     * @param maxKeys - Maximum number of keys to return
     * @returns Array of file information
     */
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
                    url: ""
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

    /**
     * Get a signed URL for a file (SAS URL in Azure terms)
     * @param key - The file key (path/filename)
     * @param expiresIn - URL expiration time in seconds (default: 3600)
     * @returns SAS URL
     */
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
