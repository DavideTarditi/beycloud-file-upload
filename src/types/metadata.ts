/**
 * Metadata interface for stored files
 * @interface FileMetadata
 * @description Contains metadata information about files stored in the cloud storage
 */
export interface FileMetadata {
    /**
     * Unique identifier/path of the file in storage
     * @property {string|undefined} key
     */
    key: string | undefined

    /**
     * Size of the file in bytes
     * @property {number|undefined} size
     */
    size: number | undefined

    /**
     * Last modification timestamp of the file
     * @property {Date|undefined} lastModified
     */
    lastModified: Date | undefined

    /**
     * Content type of the file
     * @property {string} type
     */
    type: string | null | undefined

    /**
     * URL to access the file
     * @property {string} url
     * Can be a presigned URL for cloud storage or a local file path
     */
    url: string
}
