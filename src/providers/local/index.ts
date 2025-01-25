import { CloudStorage } from "../../types/cloud"
import { FileMetadata } from "../../types/metadata"
import { extractExtension, isFolder } from "../../utils/extension"
import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises"
import { Readable } from "stream"
import path from "path"
import { LocalConfig } from "../../types/config"
import { ContentType, setDefaultExtensions } from "../../types/contentType"

export class LocalService extends CloudStorage {
    private readonly basePath: string

    constructor(config: LocalConfig) {
        super()

        if (config.basePath == null || config.basePath.trim().length === 0) {
            throw new Error("Base path must be provided")
        }

        this.basePath = config.basePath
    }

    private getFullPath(key: string): string {
        return path.join(this.basePath, key)
    }

    async exists(key: string): Promise<boolean> {
        try {
            await stat(this.getFullPath(key))
            return true
        } catch {
            return false
        }
    }

    async uploadFile(
        key: string,
        file: Buffer | Readable,
        contentType?: ContentType | string
    ): Promise<string> {
        try {
            key = setDefaultExtensions(key, contentType)

            const fullPath = this.getFullPath(key)

            // Create directory if it doesn't exist
            await mkdir(path.dirname(fullPath), { recursive: true })

            if (Buffer.isBuffer(file)) {
                await writeFile(fullPath, file)
            }
            // If file is a Readable stream, convert it to buffer first
            else {
                const chunks: Buffer[] = []
                for await (const chunk of file) {
                    chunks.push(Buffer.from(chunk))
                }
                await writeFile(fullPath, Buffer.concat(chunks))
            }

            if (contentType) {
                await writeFile(`${fullPath}.meta`, JSON.stringify({ contentType }))
            }

            return `file://${fullPath}`
        } catch (error: any) {
            throw new Error(`Failed to upload file: ${error.message}`)
        }
    }

    async downloadFile(key: string): Promise<Buffer> {
        try {
            if (!await this.exists(key)) {
                throw new Error("The specified key does not exist.")
            }

            const fullPath = this.getFullPath(key)

            return await readFile(fullPath)
        } catch (error: any) {
            throw new Error(`Failed to download file: ${error.message}`)
        }
    }

    async deleteFile(key: string): Promise<boolean> {
        try {
            if (!await this.exists(key)) {
                throw new Error("The specified key does not exist.")
            }

            const fullPath = this.getFullPath(key)
            await unlink(fullPath)

            try {
                await unlink(`${fullPath}.meta`)
            } catch {
                // Ignore if metadata file doesn't exist
            }

            return true
        } catch (error: any) {
            throw new Error(`Failed to delete file: ${error.message}`)
        }
    }

    async getFile(key: string): Promise<FileMetadata> {
        try {
            if (!await this.exists(key)) {
                throw new Error("The specified key does not exist.")
            }

            const fullPath = this.getFullPath(key)
            const fileStat = await stat(fullPath)

            let contentType: string | undefined
            try {
                const metaContent = await readFile(`${fullPath}.meta`, "utf-8")
                contentType = JSON.parse(metaContent).contentType
            } catch {
                // Ignore if metadata file doesn't exist
            }

            return {
                key: key,
                lastModified: fileStat.mtime,
                size: fileStat.size,
                type: contentType || isFolder(key) ? "folder" : extractExtension(key),
                url: `file://${fullPath}`
            }
        } catch (error: any) {
            throw new Error(`Failed to get file: ${error.message}`)
        }
    }

    async getFilesList(maxKeys?: number, prefix?: string): Promise<FileMetadata[]> {
        try {
            const { readdir } = require("fs/promises")
            const fullPath = this.getFullPath(prefix || "")

            let files = await readdir(fullPath, { withFileTypes: true })

            files = files.filter((file: any) => !file.name.endsWith('.meta'));

            if (maxKeys) {
                files = files.slice(0, maxKeys)
            }

            return Promise.all(
                files.map(async (file: any) => {
                    const key = prefix ? path.join(prefix, file.name) : file.name
                    return this.getFile(key)
                })
            )
        } catch (error: any) {
            throw new Error(`Failed to list files: ${error.message}`)
        }
    }

    async getSignedUrl(key: string): Promise<string> {
        if (!await this.exists(key)) {
            throw new Error("The specified key does not exist.")
        }

        // For local storage, we just return the file URL
        return `file://${this.getFullPath(key)}`
    }
}
