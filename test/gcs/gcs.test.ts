import { AwsConfig, BeyCloud, CloudStorage, FileMetadata, GCSConfig } from '../../src'
import fs from 'fs'
import * as path from 'node:path'

describe('GCS', () => {
    const rootTestFolder = path.resolve(__dirname, '..')

    let client: CloudStorage
    let config: GCSConfig

    beforeEach(() => {
        config = {
            bucket: process.env.GCS_BUCKET as string,
            projectId: process.env.GCS_PROJECTID as string,
            credentials: process.env.GCS_CREDENTIALS as string
        }

        try {
            client = new BeyCloud('gcloud', config)
        } catch (err) {
            process.exit(1)
        }
    })

    describe('Configuration', () => {
        test('Missed configuration part', () => {
            const incorrectConfig: GCSConfig = {
                bucket: '',
                projectId: process.env.GCS_PROJECTID as string,
                credentials: JSON.parse(Buffer.from((process.env.GCS_CREDENTIALS as string) || '', 'base64').toString('utf-8'))
            }

            expect(() => {
                const testLocalClient = new BeyCloud('gcloud', incorrectConfig)
            }).toThrow('Bucket must be provided')
        })

        test('Incorrect configuration', () => {
            /* Providing AWS config instead Google Cloud */
            const incorrectConfig: AwsConfig = {
                bucket: process.env.AWS_BUCKET as string,
                region: process.env.AWS_REGION as string,
                credentials: {
                    accessKeyId: process.env.AWS_CREDENTIALS_ACCESSKEYID as string,
                    secretAccessKey: process.env.AWS_CREDENTIALS_SECRETACCESSKEY as string
                }
            }

            expect(() => {
                const testLocalClient = new BeyCloud('gcloud', incorrectConfig)
            }).toThrow('Google Cloud credentials are required. Configuration is incorrect or must be provided')
        })
    })

    describe('Upload', () => {
        test('Upload photo correctly', async () => {
            const fileContent = fs.readFileSync(path.join(rootTestFolder, 'sample/skyline.jpg'))

            const url: string = await client.uploadFile('skyline', fileContent)

            const expectedUrl = process.env.GCS_EXPECTED_URL as string

            expect(url.startsWith(expectedUrl)).toBe(true)
        })
    })

    describe('Download', () => {
        test('Download photo correctly', async () => {
            await client.downloadFile('skyline')
        })

        test('Download photo not correct', async () => {
            await expect(async () => {
                await client.downloadFile('skyline2')
            }).rejects.toThrowError(/^Failed to download file: No such object/)
        })
    })

    describe('Get files', () => {
        test('Get single file', async () => {
            const receivedFile: FileMetadata = await client.getFile('skyline')

            expect(receivedFile.size?.toString()).toMatch('383767')
        })

        test('Get files array', async () => {
            const receivedFiles = await client.getFilesList()

            expect(receivedFiles.length.toString()).toMatch('1')
        })

        test('Get single file - uncorrected key', async () => {
            await expect(client.getFile('inexistent_folder/skyline.png')).rejects.toThrowError(/^Failed to get file: No such object/)
        })
    })

    describe('Signed URL', () => {
        test('Get url', async () => {
            const expectedUrl = process.env.GCS_EXPECTED_URL as string

            const url = await client.getSignedUrl('skyline', 2500)

            expect(url.startsWith(expectedUrl)).toBe(true)
        })
    })

    describe('Delete', () => {
        test('Delete photo correctly', async () => {
            expect(await client.deleteFile('skyline')).toBe(true)
        })

        test('Delete photo - uncorrected key', async () => {
            await expect(client.deleteFile('skyline2')).rejects.toThrowError(/^Failed to delete file: The specified key does not exist./)
        })
    })
})
