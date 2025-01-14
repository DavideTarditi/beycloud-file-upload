import { Readable } from "stream"
import { BlobDownloadResponseModel } from "@azure/storage-blob"
import { GetObjectCommandOutput } from "@aws-sdk/client-s3"
import { FileMetadata } from "./config"

export abstract class CloudStorage {
    protected constructor() {}

    abstract uploadFile(key: string, file: Buffer | Readable, contentType?: string): void;

    abstract downloadFile(key: string): Promise<Buffer | BlobDownloadResponseModel | GetObjectCommandOutput>;

    abstract deleteFile(key: string): void;

    abstract getFile(key: string): Promise<FileMetadata>;

    abstract getFilesList(maxKeys: number, prefix?: string): Promise<FileMetadata[]>;

    abstract getSignedUrl(key: string, expiresIn: number): Promise<string> | string;
}
