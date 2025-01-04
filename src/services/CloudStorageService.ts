import AWS from "aws-sdk"
import { Storage } from "@google-cloud/storage"
import { BlobServiceClient } from "@azure/storage-blob"

import { Configuration } from "../types/config"
import { UploadResult } from "../types/result"

export class CloudStorageService {
    private readonly provider: string
    private config: Configuration
    private readonly client: AWS.S3 | Storage | BlobServiceClient

    constructor(config: Configuration) {
        this.provider = config.provider
        this.config = config
        this.client = this.initializeProvider()
    }

    private initializeProvider() {
        switch (this.provider) {
            case "aws":
                if (!this.config.credentials) {
                    throw new Error("AWS credentials are required")
                }
                AWS.config.update({
                    accessKeyId: this.config.credentials.accessKeyId,
                    secretAccessKey: this.config.credentials.secretAccessKey,
                    region: this.config.region
                })
                return new AWS.S3()

            case "gcloud":
                if (!this.config.projectId || !this.config.keyFilePath) {
                    throw new Error("Google Cloud projectId and keyFilePath are required")
                }
                return new Storage({
                    projectId: this.config.projectId,
                    keyFilename: this.config.keyFilePath
                })

            case "azure":
                if (!this.config.connectionString) {
                    throw new Error("Azure connection string is required")
                }
                return BlobServiceClient.fromConnectionString(this.config.connectionString)

            default:
                throw new Error("Unsupported provider")
        }
    }

    async uploadFile(file: Express.Multer.File, destination: string): Promise<UploadResult> {
        try {
            switch (this.provider) {
                case "aws": {
                    const client = this.client as AWS.S3
                    const result = await client.upload({
                        Bucket: this.config.bucket!,
                        Key: destination,
                        Body: file.buffer,
                        ContentType: file.mimetype
                    }).promise()

                    return {
                        path: destination,
                        url: result.Location,
                        metadata: result
                    }
                }

                case "gcloud": {
                    const client = this.client as Storage
                    const bucket = client.bucket(this.config.bucket!)
                    const blob = bucket.file(destination)

                    await blob.save(file.buffer, {
                        contentType: file.mimetype
                    })

                    return {
                        path: destination,
                        url: `https://storage.googleapis.com/${this.config.bucket}/${destination}`
                    }
                }

                case "azure": {
                    const client = this.client as BlobServiceClient
                    const containerClient = client.getContainerClient(this.config.container!)
                    const blockBlobClient = containerClient.getBlockBlobClient(destination)

                    await blockBlobClient.upload(file.buffer, file.buffer.length)

                    return {
                        path: destination,
                        url: blockBlobClient.url
                    }
                }

                default:
                    throw new Error("Unsupported provider")
            }
        } catch (error) {
            throw new Error(`Upload failed: ${(error as Error).message}`)
        }
    }
}
