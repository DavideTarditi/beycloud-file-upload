/**
 * Supported storage provider types
 * @type {("local"|"aws"|"gcloud"|"azure")}
 * - local: Local filesystem storage
 * - aws: Amazon Web Services S3
 * - gcloud: Google Cloud Storage
 * - azure: Azure Blob Storage
 */
export type ClientProvider = "local" | "aws" | "gcloud" | "azure"

/**
 * AWS S3 configuration
 * @interface AwsConfig
 * @property {string} bucket - The name of the S3 bucket
 * @property {string} region - AWS region where the bucket is located
 * @property {object} credentials - AWS authentication credentials
 * @property {string} credentials.accessKeyId - AWS access key ID
 * @property {string} credentials.secretAccessKey - AWS secret access key
 */
export interface AwsConfig {
    bucket: string;
    region: string;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
    }
}

/**
 * Azure Blob Storage configuration
 * @interface AzureConfig
 * @property {string} connectionString - Azure storage account connection string
 * @property {string} container - Name of the Azure storage container
 */
export interface AzureConfig {
    connectionString: string;
    container: string;
}

/**
 * Google Cloud Storage configuration
 * @interface GCSConfig
 * @property {string} bucket - The name of the GCS bucket
 * @property {string} projectId - Google Cloud project ID
 * @property {string} keyFilePath - Path to the service account key file
 */
export interface GCSConfig {
    bucket: string;
    projectId: string;
    keyFilePath: string;
}
