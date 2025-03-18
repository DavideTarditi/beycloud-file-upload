# Google Cloud Storage Test Documentation

This document provides a detailed explanation of each test case in the Google Cloud Storage (GCS) testing suite. The tests cover configuration, file operations (upload, download, list, delete), and URL signing functionality.

## Configuration Tests

### 1. Missed Configuration Part

Tests the validation of incomplete GCS configuration:

- Attempts to create a client with an empty bucket name
- Expects to throw error "Bucket must be provided"
- Verifies that the system properly validates required configuration parameters

### 2. Incorrect Configuration

Tests the validation of wrong configuration type:

- Attempts to initialize GCS client with AWS configuration
- Expects to throw error about incorrect Google Cloud credentials
- Ensures the system can detect and reject incompatible configuration types
- Validates proper error handling for mismatched cloud provider configurations

## Upload Tests

### 1. Upload Photo Correctly

Tests the successful upload of an image file:

- Reads a local file named `skyline.jpg` from the `sample` directory
- Uploads the file with the key `skyline`
- Verifies that the returned URL starts with the expected GCS URL pattern
- Confirms basic upload functionality is working as expected

## Download Tests

### 1. Download Photo Correctly

Tests successful file download:

- Attempts to download a file with key `skyline`
- Verifies the download operation completes without errors

### 2. Download Photo Not Correct

Tests error handling for non-existent files:

- Attempts to download a non-existent file `skyline2`
- Expects to receive an error message "Failed to download file: No such object"
- Verifies proper error handling for missing files

## File Information Tests

### 1. Get Single File

Tests retrieval of individual file metadata:

- Retrieves information for file with key `skyline`
- Verifies the file size matches expected value (383,767 bytes)
- Ensures metadata retrieval works correctly
- Confirms the FileMetadata type is properly implemented

### 2. Get Files Array

Tests listing of all files:

- Retrieves list of all files in the bucket
- Verifies the number of files matches expected count (1)
- Confirms bucket listing functionality works

### 3. Get Single File - Uncorrected Key

Tests error handling for invalid file requests:

- Attempts to get information for non-existent file `inexistent_folder/skyline.png`
- Expects error message "Failed to get file: No such object"
- Verifies proper error handling for invalid keys

## Signed URL Tests

### 1. Get URL

Tests generation of signed URLs:

- Generates a signed URL for file `skyline` with 2500ms expiration
- Verifies the URL starts with expected GCS URL pattern
- Confirms signed URL generation works correctly

## Delete Tests

### 1. Delete Photo Correctly

Tests successful file deletion:

- Attempts to delete file with key `skyline`
- Expects operation to return true
- Verifies successful deletion functionality

### 2. Delete Photo - Uncorrected Key

Tests error handling for deleting non-existent files:

- Attempts to delete non-existent file `skyline2`
- Expects error "Failed to delete file: The specified key does not exist"
- Verifies proper error handling for invalid deletion requests

## Test Environment Requirements

To run these tests successfully, the following environment variables must be configured:

**Amazon Web Services:**

```env
AWS_BUCKET=your-bucket-name
AWS_REGION=your-region
AWS_CREDENTIALS_ACCESSKEYID=your-access-key-id
AWS_CREDENTIALS_SECRETACCESSKEY=your-secret-access-key
AWS_EXPECTED_URL=your-expected-url
```

**Google Cloud:**

```env
GCS_BUCKET=your-bucket-name
GCS_PROJECTID=your-projectid
GCS_EXPECTED_URL=your-expected-url
```

For Google Cloud, remember to add `service-account` json file and call it `account.json`

## Additional Notes

- The test suite assumes the existence of a test image file `skyline.jpg` in the `sample` directory
- Tests are designed to run sequentially, with the upload test creating the file used by subsequent tests
- The final delete test cleans up the test file from the bucket
- All file operations use `skyline` as the primary test key
- The GCS implementation uses a service account key file for authentication, unlike AWS which uses access key/secret pairs
