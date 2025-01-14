import { Bucket, File, Storage } from "@google-cloud/storage"
import { Readable } from "stream"
import { CloudStorage } from "../../types/cloud"
import { Configuration, FileMetadata } from "../../types/config"

export class GCSService extends CloudStorage {
    private readonly client: Storage
    private readonly bucket: Bucket

    constructor(config: Configuration) {
        super()

        if (config.bucket == null)
            throw new Error("Bucket must be provided")

        if (config.projectId == null)
            throw new Error("Project must be provided")

        if (config.keyFilePath == null)
            throw new Error("Key File Path must be provided")

        this.client = new Storage({ projectId: config.projectId, keyFile: config.keyFilePath })
        this.bucket = this.client.bucket(config.bucket)
    }

    /**
     * Upload a file to GCS
     * @param key - The file key (path/filename)
     * @param file - The file buffer or stream
     * @param contentType - The file's content type
     */
    async uploadFile(
        key: string,
        file: Buffer | Readable,
        contentType?: string
    ): Promise<void> {
        try {
            const fileHandle = this.bucket.file(key)
            const options: { contentType?: string } = {}
            if (contentType) options.contentType = contentType

            const stream = fileHandle.createWriteStream(options)
            if (file instanceof Buffer) {
                stream.end(file)
            } else {
                file.pipe(stream)
            }

            await new Promise((resolve, reject) => {
                stream.on("finish", resolve)
                stream.on("error", reject)
            })
        } catch (error: any) {
            throw new Error(`Failed to upload file: ${error.message}`)
        }
    }

    /**
     * Download a file from GCS
     * @param key - The file key (path/filename)
     * @returns The file data
     */
    async downloadFile(key: string): Promise<Buffer> {
        try {
            const fileHandle: File = this.bucket.file(key)
            const [data] = await fileHandle.download()
            return data
        } catch (error: any) {
            throw new Error(`Failed to download file: ${error.message}`)
        }
    }

    /**
     * Delete a file from GCS
     * @param key - The file key (path/filename)
     */
    async deleteFile(key: string): Promise<void> {
        try {
            const fileHandle = this.bucket.file(key)
            await fileHandle.delete()
        } catch (error: any) {
            throw new Error(`Failed to delete file: ${error.message}`)
        }
    }

    /**
     * Get a file object from GCS
     * @param key - The file key (path/filename)
     * @returns File metadata and data
     */
    async getFile(key: string): Promise<FileMetadata> {
        try {
            const fileHandle: File = this.bucket.file(key)
            const [metadata] = await fileHandle.getMetadata()
            const data: Buffer = await this.downloadFile(key)

            return {
                key: key,
                size: Number(metadata.size),
                lastModified: new Date(metadata.updated),
                url: "" //TODO: signedUrl
            }
        } catch (error: any) {
            throw new Error(`Failed to get file: ${error.message}`)
        }
    }

    /**
     * Get a list of files from GCS
     * @param prefix - Optional prefix to filter files
     * @param maxKeys - Maximum number of keys to return
     * @returns Array of file information
     */
    async getFilesList(maxKeys: number = 1000, prefix?: string): Promise<FileMetadata[]> {
        try {
            const [files] = await this.bucket.getFiles({
                prefix,
                maxResults: maxKeys
            })

            return []

            // TODO: map file metadata

            // return files.map<FileMetadata>(async (file) => ({
            //     key: file.name,
            //     size: Number(file.metadata.size),
            //     lastModified: new Date(file.metadata.updated),
            //     url: await this.getSignedUrl(file.name)
            // }))
        } catch (error: any) {
            throw new Error(`Failed to list files: ${error.message}`)
        }
    }

    /**
     * Get a pre-signed URL for a file
     * @param key - The file key (path/filename)
     * @param expiresIn - URL expiration time in seconds (default: 3600)
     * @returns Pre-signed URL
     */
    async getSignedUrl(key: string, expiresIn: number = 3600) {
        try {
            const fileHandle = this.bucket.file(key)

            const [url] = await fileHandle.getSignedUrl({
                action: "read",
                expires: Date.now() + expiresIn * 1000
            })

            return url[0]
        } catch (error: any) {
            throw new Error(`Failed to generate signed URL: ${error.message}`)
        }
    }
}
