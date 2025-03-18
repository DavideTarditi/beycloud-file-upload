import { Readable } from 'stream'
import { BlobDownloadResponseModel } from '@azure/storage-blob'
import { GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { FileMetadata } from './metadata'
import { ContentType } from './contentType'

/**
 * Abstract base class for cloud storage operations
 * @abstract
 * @description Provides a unified interface for interacting with different cloud storage providers
 * including AWS S3, Azure Blob Storage, Google Cloud Storage, Digital Ocean Spaces, and local storage.
 */
export abstract class CloudStorage {
    protected constructor() {}

    /**
     * Checks if a file exists in the bucket.
     * @param key - The key (path) of the file to check
     * @returns Promise<boolean> - True if file exists, false otherwise
     * @throws Error if the operation fails for reasons other than file not found
     */
    abstract exists(key: string): Promise<boolean>

    /**
     * Uploads a file to cloud storage
     * @abstract
     * @param {string} key - Unique identifier/path for the file in storage. Better if it has extensions;
     * if it has no extensions, but contentType is provided, extension will be added to it.
     * @param {Buffer | Readable} file - File content as Buffer or Readable stream
     * @param {string} [contentType] - MIME type of the file (e.g., "image/jpeg", "application/pdf")
     * @returns {string} Signed URL to read the file
     * @throws {Error} If upload fails or storage is unavailable
     */
    abstract uploadFile(key: string, file: Buffer | Readable, contentType?: ContentType | string): Promise<string> | string

    /**
     * Downloads a file from cloud storage
     * @abstract
     * @param {string} key - Unique identifier/path of the file to download
     * @returns {Promise<Buffer | BlobDownloadResponseModel | GetObjectCommandOutput>}
     * Provider-specific response containing file data:
     * - Buffer for generic file content
     * - BlobDownloadResponseModel for Azure
     * - GetObjectCommandOutput for AWS S3
     * @throws {Error} If file not found or download fails
     */
    abstract downloadFile(key: string): Promise<Buffer | BlobDownloadResponseModel | GetObjectCommandOutput>

    /**
     * Deletes a file from cloud storage
     * @abstract
     * @param {string} key - Unique identifier/path of the file to delete
     * @returns {boolean} - True if successfully deleted, false otherwise (in case of no error)
     * @throws {Error} If file not found or deletion fails
     */
    abstract deleteFile(key: string): Promise<boolean>

    /**
     * Retrieves metadata for a specific file
     * @abstract
     * @param {string} key - Unique identifier/path of the file
     * @returns {Promise<FileMetadata>} File metadata including size, last modified date, and URL
     * @throws {Error} If file not found or metadata retrieval fails
     */
    abstract getFile(key: string): Promise<FileMetadata>

    /**
     * Lists files in the storage with optional prefix filtering
     * @abstract
     * @param {number} maxKeys - Optional maximum number of files to list. Default is 1000.
     * @param {string} [prefix] - Optional prefix to filter files (e.g., "folder/")
     * @returns {Promise<FileMetadata[]>} Array of file metadata objects
     * @throws {Error} If listing operation fails
     */
    abstract getFilesList(maxKeys?: number, prefix?: string): Promise<FileMetadata[]>

    /**
     * Generates a signed URL for temporary file access
     * @abstract
     * @param {string} key - Unique identifier/path of the file
     * @param {number} expiresIn - URL expiration time in seconds
     * @returns {Promise<string> | string} Signed URL for file access
     * - Promise<string> for async operations (e.g., cloud providers)
     * - string for sync operations (e.g., local storage)
     * @throws {Error} If URL generation fails or file not found
     */
    abstract getSignedUrl(key: string, expiresIn: number): Promise<string> | string
}
