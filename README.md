# Beycloud

Una libreria uniforme per gestire il caricamento di file su diversi cloud provider in Express.

## Installazione

```bash
npm install beycloud-js
```

## Utilizzo

```typescript
import express from 'express';
import { CloudStorageService, upload } from 'express-cloud-storage';

const app = express();

// Configurazione AWS S3
const config = {
  provider: 'aws',
  credentials: {
    accessKeyId: 'YOUR_AWS_ACCESS_KEY',
    secretAccessKey: 'YOUR_AWS_SECRET_KEY'
  },
  region: 'eu-west-1',
  bucket: 'your-bucket-name'
};

const storageService = new CloudStorageService(config);

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await storageService.uploadFile(
      req.file,
      `uploads/${Date.now()}-${req.file.originalname}`
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Caratteristiche

- Supporto per AWS S3, Google Cloud Storage e Azure Blob Storage
- API unificata per tutti i provider
- Middleware Multer integrato
- Typescript support
- Gestione errori robusta

## Licenza

MIT
