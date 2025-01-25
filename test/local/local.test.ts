import { BeyCloud, CloudStorage, GCSConfig, LocalConfig } from "../../src"
import * as fs from "fs"
import path = require("node:path")

describe("Local", () => {
    const rootTestFolder = path.resolve(__dirname, "..")

    let client: CloudStorage
    let config: LocalConfig

    beforeEach(() => {
        config = {
            basePath: process.env.LOCAL_BASE_PATH as string
        }

        try {
            client = new BeyCloud("local", config)
        } catch (err) {
            process.exit(1)
        }
    })

    describe("Configuration", () => {
        test("Missed configuration part", () => {
            const incorrectConfig: LocalConfig = {
                basePath: ""
            }

            expect(() => {
                const testLocalClient = new BeyCloud("local", incorrectConfig)
            }).toThrow("Base path must be provided")
        })

        test("Incorrect configuration", () => {
            /* Providing Google Cloud config instead local */
            const incorrectConfig: GCSConfig = {
                bucket: process.env.GCS_BUCKET as string,
                projectId: process.env.GCS_PROJECTID as string,
                keyFilePath: path.join(rootTestFolder, "key/account.json")
            }

            expect(() => {
                const testLocalClient = new BeyCloud("local", incorrectConfig)
            }).toThrow("Local credentials are required. Configuration is incorrect or must be provided")
        })
    })

    describe("Upload", () => {
        test("Upload photo correctly", async () => {
            const fileContent = fs.readFileSync(path.join(rootTestFolder, "sample/skyline.jpg"))

            const url: string = await client.uploadFile("skyline", fileContent, "image/jpeg")

            expect(url.startsWith("file:") && url.endsWith("skyline.jpg")).toBe(true)
        })
    })

    describe("Download", () => {
        test("Download photo correctly", async () => {
            await client.downloadFile("skyline.jpg")
        })

        test("Download photo not correct", async () => {
            await expect(async () => {
                await client.downloadFile("skyline2")
            }).rejects.toThrowError(
                "Failed to download file: The specified key does not exist."
            )
        })
    })

    describe("Get files", () => {
        test("Get single file", async () => {
            const receivedFile = await client.getFile("skyline.jpg")

            expect(receivedFile.size?.toString()).toMatch("383767")
        })

        test("Get files array", async () => {
            const receivedFiles = await client.getFilesList()

            expect(receivedFiles.length.toString()).toMatch("1")
        })

        test("Get single file - uncorrected key", async () => {
            await expect(client.getFile("inexistent_folder/skyline.png")).rejects.toThrowError(
                "Failed to get file: The specified key does not exist."
            )
        })
    })

    describe("Signed URL", () => {
        test("Get url", async () => {
            const url = await client.getSignedUrl("skyline.jpg", 2500)

            expect(url.startsWith("file:") && url.endsWith("skyline.jpg")).toBe(true)
        })
    })

    describe("Delete", () => {
        test("Delete photo correctly", async () => {
            expect(await client.deleteFile("skyline.jpg")).toBe(true)
        })

        test("Delete photo - uncorrected key", async () => {
            await expect(client.deleteFile("skyline2")).rejects.toThrowError(
                "Failed to delete file: The specified key does not exist."
            )
        })

    })
})
