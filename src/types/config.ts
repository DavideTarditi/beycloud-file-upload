/**
 * Supported storage provider types
 * @type {("local"|"aws"|"gcloud"|"azure")}
 * - local: Local filesystem storage
 * - aws: Amazon Web Services S3
 * - gcloud: Google Cloud Storage
 * - azure: Azure Blob Storage
 */
export type ClientProvider = 'local' | 'aws' | 'gcloud' | 'azure' | 'digitalocean'

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
    bucket: string
    region: string
    credentials: {
        accessKeyId: string
        secretAccessKey: string
    }
}

/**
 * DigitalOcean configuration
 * @interface DigitalOceanConfig
 * @property {string} bucket - The name of the DigitalOcean bucket
 * @property {string} region - DigitalOcean region where the bucket is located
 * @property {object} endpoint - DigitalOcean endpoint URL
 * @property {object} forcePathStyle - Force path style - set to false for DigitalOcean
 * @property {object} credentials - DigitalOcean authentication credentials
 * @property {string} credentials.accessKeyId - DigitalOcean access key ID
 * @property {string} credentials.secretAccessKey - DigitalOcean secret access key
 */
export interface DigitalOceanConfig extends AwsConfig {
    endpoint: string
    forcePathStyle: boolean
}

/**
 * Azure Blob Storage configuration
 * @interface AzureConfig
 * @property {string} connectionString - Azure storage account connection string
 * @property {string} container - Name of the Azure storage container
 */
export interface AzureConfig {
    connectionString: string
    container: string
}

/**
 * Google Cloud Storage configuration
 * @interface GCSConfig
 * @property {string} bucket - The name of the GCS bucket
 * @property {string} projectId - Google Cloud project ID
 * @property {string} credentials - Credentials service account key file in Base64
 */
export interface GCSConfig {
    bucket: string
    projectId: string
    credentials: string
}

/**
 * Local Storage configuration
 * @interface GCSConfig
 * @property {string} bucket - The name of the GCS bucket
 */
export interface LocalConfig {
    basePath: string
}
