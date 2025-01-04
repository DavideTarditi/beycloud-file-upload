export interface Configuration {
    provider: "aws" | "gcloud" | "azure";
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
