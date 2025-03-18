import { AwsConfig, AzureConfig, DigitalOceanConfig, GCSConfig, LocalConfig } from '../types/config'

/**
 * Type guard to verify if a configuration object is an AWS configuration
 * @param config - Configuration object that could be AWS, Azure, GCS, DigitalOcean, Local config
 * @returns True if the config is a valid AWS configuration
 *
 * Checks for required AWS-specific properties:
 * - credentials object with accessKeyId and secretAccessKey
 * - bucket name
 * - region
 */
export function isAwsConfig(config: AwsConfig | AzureConfig | GCSConfig | DigitalOceanConfig | LocalConfig): config is AwsConfig {
    return (
        'credentials' in config &&
        'bucket' in config &&
        'region' in config &&
        'accessKeyId' in (config as AwsConfig).credentials &&
        'secretAccessKey' in (config as AwsConfig).credentials
    )
}

/**
 * Type guard to verify if a configuration object is an DigitalOcean configuration
 * @param config - Configuration object that could be AWS, Azure, GCS, DigitalOcean, Local config
 * @returns True if the config is a valid DigitalOcean configuration
 *
 * Checks for required DigitalOcean-specific properties:
 * - credentials object with accessKeyId and secretAccessKey
 * - bucket name
 * - endpoint
 * - region
 */
export function isDigitalOceanConfig(config: AwsConfig | AzureConfig | GCSConfig | DigitalOceanConfig | LocalConfig): config is DigitalOceanConfig {
    return (
        'credentials' in config &&
        'bucket' in config &&
        'region' in config &&
        'endpoint' in config &&
        'forcePathStyle' in config &&
        'accessKeyId' in (config as AwsConfig).credentials &&
        'secretAccessKey' in (config as AwsConfig).credentials
    )
}

/**
 * Type guard to verify if a configuration object is an Azure configuration
 * @param config - Configuration object that could be AWS, Azure, GCS, DigitalOcean, Local config
 * @returns True if the config is a valid Azure configuration
 *
 * Checks for required Azure-specific properties:
 * - connectionString for authentication
 * - container name
 */
export function isAzureConfig(config: AwsConfig | AzureConfig | GCSConfig | DigitalOceanConfig | LocalConfig): config is AzureConfig {
    return 'connectionString' in config && 'container' in config
}

/**
 * Type guard to verify if a configuration object is a Google Cloud Storage configuration
 * @param config - Configuration object that could be AWS, Azure, GCS, DigitalOcean, Local config
 * @returns True if the config is a valid GCS configuration
 *
 * Checks for required GCS-specific properties:
 * - bucket name
 * - projectId for project identification
 * - keyFilePath for service account credentials
 */
export function isGCSConfig(config: AwsConfig | AzureConfig | GCSConfig | DigitalOceanConfig | LocalConfig): config is GCSConfig {
    return 'bucket' in config && 'projectId' in config && 'keyFilePath' in config
}

/**
 * Type guard to verify if a configuration object is a Local Storage configuration
 * @param config - Configuration object that could be AWS, Azure, GCS, DigitalOcean, Local config
 * @returns True if the config is a valid Local configuration
 *
 * Checks for required Local-specific properties:
 * - path
 */
export function isLocalConfig(config: AwsConfig | AzureConfig | GCSConfig | DigitalOceanConfig | LocalConfig): config is LocalConfig {
    return 'basePath' in config
}
