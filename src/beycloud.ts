import { Configuration, FileMetadata } from "./types/config"

import { S3Service } from "./providers/aws-s3"
import { AzureBlobService } from "./providers/azure-blob"
import { GCSService } from "./providers/g-cloud"

import { CloudStorage } from "./types/cloud"
import { BlobDownloadResponseModel } from "@azure/storage-blob"
import { GetObjectCommandOutput } from "@aws-sdk/client-s3"

import { Readable } from "stream"

export class BeyCloud extends CloudStorage {
    private readonly provider: string
    private readonly config: Configuration
    private readonly client: CloudStorage

    constructor(config: Configuration) {
        super()

        this.provider = config.provider
        this.config = config
        this.client = this.initializeProvider()
    }

    private initializeProvider(): CloudStorage {
        switch (this.provider) {
            case "aws":
                if (!this.config.credentials) {
                    throw new Error("AWS credentials are required")
                }

                return new S3Service(this.config)

            case "gcloud":
                if (!this.config.projectId || !this.config.keyFilePath) {
                    throw new Error("Google Cloud projectId and keyFilePath are required")
                }

                return new GCSService(this.config)

            case "azure":
                if (!this.config.connectionString) {
                    throw new Error("Azure connection string is required")
                }

                return new AzureBlobService(this.config)

            default:
                throw new Error("Unsupported provider")
        }
    }

    uploadFile(key: string, file: Buffer | Readable, contentType?: string) {
        return this.client.uploadFile(key, file, contentType)
    }

    downloadFile(key: string): Promise<Buffer | BlobDownloadResponseModel | GetObjectCommandOutput> {
        return this.client.downloadFile(key)
    }

    deleteFile(key: string): void {
        return this.client.deleteFile(key)
    }

    getFile(key: string): Promise<FileMetadata> {
        return this.client.getFile(key)
    }

    getFilesList(maxKeys: number, prefix?: string): Promise<FileMetadata[]> {
        return this.client.getFilesList(maxKeys, prefix)
    }

    getSignedUrl(key: string, expiresIn: number): Promise<string> | string {
        return this.client.getSignedUrl(key, expiresIn)
    }
}
