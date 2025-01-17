import { S3Service } from "./providers/aws-s3"
import { AzureBlobService } from "./providers/azure-blob"
import { GCSService } from "./providers/g-cloud"

import { CloudStorage } from "./types/cloud"
import { BlobDownloadResponseModel } from "@azure/storage-blob"
import { GetObjectCommandOutput } from "@aws-sdk/client-s3"

import { Readable } from "stream"
import { AwsConfig, AzureConfig, ClientProvider, GCSConfig } from "./types/config"
import { isAwsConfig, isAzureConfig, isGCSConfig } from "./utils/typeChecker"
import { FileMetadata } from "./types/metadata"

/**
 * BeyCloud is an open-source unified cloud storage wrapper that provides a consistent interface
 * for interacting with different cloud storage providers (AWS S3, Azure Blob, Google Cloud Storage
 * and more)
 *
 * It implements the CloudStorage interface and delegates operations to the appropriate
 * provider-specific service based on the configuration provided.
 */
export class BeyCloud extends CloudStorage {
    private readonly provider: ClientProvider = "local"
    private readonly config: AwsConfig | AzureConfig | GCSConfig
    private readonly client: CloudStorage

    /**
     * Creates a new instance of BeyCloud
     * @param provider - The cloud provider to use ("aws", "azure", "gcloud")
     * @param config - Provider-specific configuration object
     */
    constructor(provider: ClientProvider, config: AwsConfig | AzureConfig | GCSConfig) {
        super()
        this.provider = provider
        this.config = config
        this.client = this.initializeProvider()
    }

    /**
     * Initializes the appropriate cloud storage service based on the provider
     * Uses type guards to ensure correct configuration for each provider
     * @returns An instance of the provider-specific cloud storage service
     * @throws Error if the provider is not supported or if the configuration is invalid
     */
    private initializeProvider(): CloudStorage {
        switch (this.provider) {
            case "aws":
                if (!isAwsConfig(this.config))
                    throw new Error("AWS credentials are required")
                return new S3Service(this.config)

            case "gcloud":
                if (!isGCSConfig(this.config))
                    throw new Error("Google Cloud credentials are required")
                return new GCSService(this.config)

            case "azure":
                if (!isAzureConfig(this.config))
                    throw new Error("Azure credentials are required")
                return new AzureBlobService(this.config)

            default:
                throw new Error("Unsupported provider")
        }
    }

    /**
     * Uploads a file to the cloud storage
     * @param key - The unique identifier/path for the file
     * @param file - The file content as Buffer or Readable stream
     * @param contentType - Optional MIME type of the file
     */
    uploadFile(key: string, file: Buffer | Readable, contentType?: string) {
        return this.client.uploadFile(key, file, contentType)
    }

    /**
     * Downloads a file from the cloud storage
     * @param key - The unique identifier/path of the file to download
     * @returns Promise resolving to the file content in provider-specific format
     */
    downloadFile(key: string): Promise<Buffer | BlobDownloadResponseModel | GetObjectCommandOutput> {
        return this.client.downloadFile(key)
    }

    /**
     * Deletes a file from the cloud storage
     * @param key - The unique identifier/path of the file to delete
     */
    deleteFile(key: string): void {
        return this.client.deleteFile(key)
    }

    /**
     * Retrieves metadata for a specific file
     * @param key - The unique identifier/path of the file
     * @returns Promise resolving to file metadata
     */
    getFile(key: string): Promise<FileMetadata> {
        return this.client.getFile(key)
    }

    /**
     * Lists files in the cloud storage
     * @param maxKeys - Maximum number of files to list
     * @param prefix - Optional prefix to filter files by path/name
     * @returns Promise resolving to array of file metadata
     */
    getFilesList(maxKeys: number, prefix?: string): Promise<FileMetadata[]> {
        return this.client.getFilesList(maxKeys, prefix)
    }

    /**
     * Generates a time-limited signed URL for file access
     * @param key - The unique identifier/path of the file
     * @param expiresIn - Time in seconds until the URL expires
     * @returns Promise or string containing the signed URL
     */
    getSignedUrl(key: string, expiresIn: number): Promise<string> | string {
        return this.client.getSignedUrl(key, expiresIn)
    }
}
