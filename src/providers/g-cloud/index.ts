import { Bucket, File, Storage, StorageOptions } from '@google-cloud/storage'
import { Readable } from 'stream'
import { CloudStorage } from '../../types/cloud'
import { GCSConfig } from '../../types/config'
import { FileMetadata } from '../../types/metadata'
import { ContentType } from '../../types/contentType'

export class GCSService extends CloudStorage {
    private readonly client: Storage
    private readonly bucket: Bucket

    constructor(config: GCSConfig) {
        super()

        if (config.bucket == null || config.bucket.trim().length == 0) throw new Error('Bucket must be provided')

        if (config.projectId == null || config.projectId.trim().length == 0) throw new Error('Project must be provided')

        if (config.credentials == null || config.credentials.trim().length == 0) throw new Error('Key File Path must be provided')

        const credentials = JSON.parse(Buffer.from(config.credentials, 'base64').toString('utf-8'))

        this.client = new Storage({
            projectId: config.projectId,
            credentials: credentials
        })
        this.bucket = this.client.bucket(config.bucket)
    }

    async exists(key: string): Promise<boolean> {
        try {
            const file = this.bucket.file(key)
            const [exists] = await file.exists()
            return exists
        } catch (error: any) {
            throw new Error(`Failed to check if file exists: ${error.message}`)
        }
    }

    async uploadFile(key: string, file: Buffer | Readable, contentType?: ContentType | string): Promise<string> {
        try {
            const fileHandle = this.bucket.file(key)
            const options: { contentType?: string } = {}
            if (contentType) options.contentType = contentType

            await new Promise((resolve, reject) => {
                const stream = fileHandle.createWriteStream(options)
                if (file instanceof Buffer) {
                    stream.end(file)
                } else {
                    if (file instanceof Readable) {
                        file.pipe(stream)
                    } else {
                        throw new Error('File must be a Buffer or Readable stream')
                    }
                }
                stream.on('finish', resolve)
                stream.on('error', reject)
            })

            return this.getSignedUrl(key)
        } catch (error: any) {
            throw new Error(`Failed to upload file: ${error.message}`)
        }
    }

    async downloadFile(key: string): Promise<Buffer> {
        try {
            const fileHandle: File = this.bucket.file(key)
            const [data] = await fileHandle.download()
            return data
        } catch (error: any) {
            throw new Error(`Failed to download file: ${error.message}`)
        }
    }

    async deleteFile(key: string): Promise<boolean> {
        try {
            if (!(await this.exists(key))) throw new Error('The specified key does not exist.')

            const fileHandle = this.bucket.file(key)
            await fileHandle.delete()

            return true
        } catch (error: any) {
            throw new Error(`Failed to delete file: ${error.message}`)
        }
    }

    async getFile(key: string): Promise<FileMetadata> {
        try {
            const fileHandle: File = this.bucket.file(key)
            const [metadata] = await fileHandle.getMetadata()

            return {
                key: key,
                size: Number(metadata.size),
                lastModified: new Date(metadata.updated),
                type: metadata.kind,
                url: await this.getSignedUrl(key)
            }
        } catch (error: any) {
            throw new Error(`Failed to get file: ${error.message}`)
        }
    }

    async getFilesList(maxKeys: number = 1000, prefix?: string): Promise<FileMetadata[]> {
        try {
            const [files] = await this.bucket.getFiles({
                prefix,
                maxResults: maxKeys
            })

            return await Promise.all(
                files.map(async item => ({
                    key: item.name,
                    size: item.metadata.size,
                    lastModified: item.metadata.updated,
                    type: item.metadata.kind,
                    url: await this.getSignedUrl(item.name)
                }))
            )
        } catch (error: any) {
            throw new Error(`Failed to list files: ${error.message}`)
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600) {
        try {
            if (!(await this.exists(key))) throw new Error('The specified key does not exist.')

            const fileHandle = this.bucket.file(key)

            const [url] = await fileHandle.getSignedUrl({
                action: 'read',
                expires: Date.now() + expiresIn * 1000
            })

            return url
        } catch (error: any) {
            throw new Error(`Failed to generate signed URL: ${error.message}`)
        }
    }
}
