# Beycloud File Upload

## Overview

**Beycloud** is an open-source Node.js library that provides a unified interface for uploading and managing files across multiple storage providers, including:

* AWS S3
* Google Cloud Storage (GCS)
* Azure Blob Storage
* DigitalOcean Spaces
* Local filesystem

It abstracts provider-specific SDKs and presents a simple, consistent API.

## Features

* Unified API for multiple cloud providers
* Upload/download/delete/list files
* Generate signed URLs
* Supports file metadata and content type
* Designed for use with Express + Multer
* Written in TypeScript with type support

## Installation

```bash
npm install beycloud
```

## Configuration

Each provider requires its own configuration object:

### AWS S3

```ts
const awsConfig = {
  bucket: process.env.AWS_BUCKET,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
};
```

### Google Cloud Storage (GCS)

```ts
const gcsConfig = {
  bucket: process.env.GCS_BUCKET,
  projectId: process.env.GCS_PROJECT_ID,
  credentials: process.env.GCS_CREDENTIALS_BASE64 // Base64-encoded service account JSON
};
```

### Azure Blob Storage

```ts
const azureConfig = {
  connectionString: process.env.AZURE_CONNECTION_STRING,
  container: process.env.AZURE_CONTAINER
};
```

### DigitalOcean Spaces

```ts
const doConfig = {
  bucket: process.env.DO_BUCKET,
  region: process.env.DO_REGION,
  endpoint: process.env.DO_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.DO_ACCESS_KEY,
    secretAccessKey: process.env.DO_SECRET_KEY
  }
};
```

### Local Filesystem

```ts
const localConfig = {
  basePath: './uploads'
};
```

## Basic Usage with Express

```ts
import express from 'express';
import multer from 'multer';
import { BeyCloud } from 'beycloud';

const app = express();
const upload = multer();
const cloudStorage = new BeyCloud('aws', awsConfig);

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const filename = `${Date.now()}-${file.originalname}`;
    const url = await cloudStorage.uploadFile(filename, file.buffer, file.mimetype);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

## API Methods

### `uploadFile(key, data, contentType?)`

Uploads a file. Returns a signed or direct URL.

### `downloadFile(key)`

Downloads the file. Returns a buffer or stream depending on the provider.

### `deleteFile(key)`

Deletes the file. Returns true if successful.

### `exists(key)`

Checks if the file exists. Returns boolean.

### `getFile(key)`

Returns metadata about the file.

### `getFilesList(maxKeys?, prefix?)`

Returns an array of file metadata under a prefix.

### `getSignedUrl(key, expiresIn)`

Generates a signed URL that expires in `expiresIn` seconds.

## Architecture

* BeyCloud is a wrapper class that internally selects a provider-specific service.
* Each provider service implements a common interface.
* Uses official SDKs under the hood: AWS SDK, Azure SDK, GCS SDK.
* Unified method signatures for all operations.

## Contributing

1. Fork the repo
2. Run `npm install`
3. Set up `.env` with test credentials
4. Run tests with `npm test`
5. Submit a PR with clear description

## To do

Rewrite library for:
- C# dotNET
- Python
- Java
- Go

## License

Copyright (c) 2025 Davide Tarditi

Beycloud-js is released under MIT license. You are free to use, modify and distribute this software, as long as the copyright header is left intact.

See LICENSE.txt for more information.

---
