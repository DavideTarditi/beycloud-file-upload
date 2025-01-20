# Beycloud

A library to handle file uploads to different cloud providers

## Installation

Install via NPM:
```bash
npm install beycloud-js
```

## Usage

```typescript
import express from "express"
import { AwsConfig, BeyCloud } from "beycloud-js"

const app = express()

// AWS Configuration
const awsConfig: AwsConfig = {
    bucket: process.env.AWS_BUCKET || "your-bucket-name",
    region: process.env.AWS_REGION || "eu-west-1",
    credentials: {
        accessKeyId: process.env.AWS_CREDENTIALS_ACCESSKEYID || "YOUR_AWS_ACCESS_KEY",
        secretAccessKey: process.env.AWS_CREDENTIALS_SECRETACCESSKEY || "YOUR_AWS_SECRET_KEY"
    }
}

// Initialize cloud storage client
const cloudStorageClient = new BeyCloud("aws", awsConfig)

// File upload endpoint
app.post("/upload", async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" })
        }

        // Generate unique filename
        const filename = `${Date.now()}-${req.file.originalname}`

        // Upload file to Aws S3 through Beycloud and return URL
        const url = await cloudStorageClient.uploadFile(filename, req.file.buffer)

        // Return success response
        res.json(url)

    } catch (error) {
        console.error("Upload error:", error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        })
    }
})

export default app

```

## License

Beycloud-js is released under MIT license. You are free to use, modify and distribute this software, as long as the copyright header is left intact.

See LICENSE.txt for more information.
