import { BeyCloud, CloudStorage, DigitalOceanConfig, GCSConfig } from '../../src'
import fs from 'fs'
import path = require('node:path')

describe('DigitalOcean', () => {
    const rootTestFolder = path.resolve(__dirname, '..')

    let client: CloudStorage
    let config: DigitalOceanConfig

    beforeEach(() => {
        config = {
            bucket: process.env.DIGITALOCEAN_BUCKET as string,
            region: process.env.DIGITALOCEAN_REGION as string,
            endpoint: process.env.DIGITALOCEAN_ENDPOINT as string,
            forcePathStyle: false,
            credentials: {
                accessKeyId: process.env.DIGITALOCEAN_CREDENTIALS_ACCESSKEYID as string,
                secretAccessKey: process.env.DIGITALOCEAN_CREDENTIALS_SECRETACCESSKEY as string
            }
        }

        try {
            client = new BeyCloud('digitalocean', config)
        } catch (err) {
            process.exit(1)
        }
    })

    describe('Configuration', () => {
        test('Missed configuration part', () => {
            const incorrectConfig: DigitalOceanConfig = {
                bucket: '',
                region: process.env.DIGITALOCEAN_REGION as string,
                endpoint: process.env.DIGITALOCEAN_ENDPOINT as string,
                forcePathStyle: false,
                credentials: {
                    accessKeyId: process.env.DIGITALOCEAN_CREDENTIALS_ACCESSKEYID as string,
                    secretAccessKey: process.env.DIGITALOCEAN_CREDENTIALS_SECRETACCESSKEY as string
                }
            }

            expect(() => {
                const testLocalClient = new BeyCloud('digitalocean', incorrectConfig)
            }).toThrow('Bucket must be provided')
        })

        test('Incorrect configuration', () => {
            /* Providing Google Cloud config instead DigitalOcean */
            const incorrectConfig: GCSConfig = {
                bucket: process.env.GCS_BUCKET as string,
                projectId: process.env.GCS_PROJECTID as string,
                keyFilePath: path.join(rootTestFolder, 'key/account.json')
            }

            expect(() => {
                const testLocalClient = new BeyCloud('digitalocean', incorrectConfig)
            }).toThrow('Digital Ocean credentials are required. Configuration is incorrect or must be provided')
        })
    })

    describe('Upload', () => {
        test('Upload photo correctly', async () => {
            const fileContent = fs.readFileSync(path.join(rootTestFolder, 'sample/skyline.jpg'))

            const url: string = await client.uploadFile('skyline', fileContent)

            const expectedUrl = process.env.DIGITALOCEAN_EXPECTED_URL as string

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
            }).rejects.toThrowError('Failed to download file: The specified key does not exist.')
        })
    })

    describe('Get files', () => {
        test('Get single file', async () => {
            const receivedFile = await client.getFile('skyline')

            expect(receivedFile.size?.toString()).toMatch('383767')
        })

        test('Get files array', async () => {
            const receivedFiles = await client.getFilesList()

            expect(receivedFiles.length.toString()).toMatch('1')
        })

        test('Get single file - uncorrected key', async () => {
            await expect(client.getFile('inexistent_folder/skyline.png')).rejects.toThrowError(
                'Failed to download file: The specified key does not exist.'
            )
        })
    })

    describe('Signed URL', () => {
        test('Get url', async () => {
            const expectedUrl = process.env.DIGITALOCEAN_EXPECTED_URL as string

            const url = await client.getSignedUrl('skyline', 2500)

            expect(url.startsWith(expectedUrl)).toBe(true)
        })
    })

    describe('Delete', () => {
        test('Delete photo correctly', async () => {
            expect(await client.deleteFile('skyline')).toBe(true)
        })

        test('Delete photo - uncorrected key', async () => {
            await expect(client.deleteFile('skyline2')).rejects.toThrowError('Failed to delete file: The specified key does not exist.')
        })
    })
})
