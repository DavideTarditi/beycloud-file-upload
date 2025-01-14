export interface Configuration {
    provider: "local" | "aws" | "gcloud" | "azure";
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    region?: string;
    bucket?: string;
    container?: string;
    projectId?: string;
    keyFilePath?: string;
    connectionString?: string;
}

export interface FileMetadata {
    key: string | undefined;
    size: number | undefined;
    lastModified: Date | undefined;
    url: string
}
