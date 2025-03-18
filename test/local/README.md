# Local Test Documentation

This document provides a detailed explanation of each test case in the Local cloud storage testing suite. The tests cover configuration, file operations (upload, download, list, delete), and URL signing functionality.

## Configuration Tests

### 1. Missed Configuration Part

Tests the validation of incomplete Local configuration:

- Attempts to create a client with an empty `basePath`.
- Expects to throw an error: "Base path must be provided".
- Verifies that the system properly validates required configuration parameters.

### 2. Incorrect Configuration

Tests the validation of incorrect configuration type:

- Attempts to initialize a Local client with Google Cloud Storage (GCS) configuration.
- Expects to throw an error about incorrect Local credentials: "Local credentials are required. Configuration is incorrect or must be provided".
- Ensures the system can detect and reject incompatible configuration types.

## Upload Tests

### 1. Upload Photo Correctly

Tests the successful upload of an image file:

- Reads a local file named `skyline.jpg` from the `sample` directory.
- Uploads the file with the key `skyline`.
- Verifies that the returned URL starts with the expected Local URL pattern and ends with `skyline.jpg`.
- Confirms basic upload functionality is working as expected.

## Download Tests

### 1. Download Photo Correctly

Tests successful file download:

- Attempts to download a file with the key `skyline.jpg`.
- Verifies the download operation completes without errors.

### 2. Download Photo Not Correct

Tests error handling for non-existent files:

- Attempts to download a non-existent file `skyline2`.
- Expects to receive an error indicating the file doesn't exist: "Failed to download file: The specified key does not exist.".
- Verifies proper error handling for missing files.

## File Information Tests

### 1. Get Single File

Tests retrieval of individual file metadata:

- Retrieves information for the file with the key `skyline.jpg`.
- Verifies the file size matches the expected value (383,767 bytes).
- Ensures metadata retrieval works correctly.

### 2. Get Files Array

Tests listing of all files:

- Retrieves a list of all files in the base path.
- Verifies the number of files matches the expected count (1).
- Confirms bucket listing functionality works.

### 3. Get Single File - Incorrect Key

Tests error handling for invalid file requests:

- Attempts to get information for a non-existent file `inexistent_folder/skyline.png`.
- Expects an error: "Failed to get file: The specified key does not exist.".
- Verifies proper error handling for invalid keys.

## Signed URL Tests

### 1. Get URL

Tests generation of signed URLs:

- Generates a signed URL for the file `skyline.jpg` with a 2500ms expiration.
- Verifies the URL starts with the expected Local URL pattern and ends with `skyline.jpg`.
- Confirms signed URL generation works correctly.

## Delete Tests

### 1. Delete Photo Correctly

Tests successful file deletion:

- Attempts to delete the file with the key `skyline.jpg`.
- Expects the operation to return `true`.
- Verifies successful deletion functionality.

### 2. Delete Photo - Incorrect Key

Tests error handling for deleting non-existent files:

- Attempts to delete a non-existent file `skyline2`.
- Expects an error: "Failed to delete file: The specified key does not exist.".
- Verifies proper error handling for invalid deletion requests.

## Test Environment Requirements

To run these tests successfully, the following environment variables must be configured:

### Local Configuration:

```env
LOCAL_BASE_PATH=/path/to/local/storage
```

### Google Cloud:

```env
GCS_BUCKET=your-bucket-name
GCS_PROJECTID=your-projectid
GCS_EXPECTED_URL=your-expected-url
```

### Notes:

- Ensure the `skyline.jpg` file exists in the `sample` directory for upload tests.
- The tests are designed to run sequentially, with the upload test creating the file used by subsequent tests.
- The final delete test cleans up the test file from the base path.
- All file operations use `skyline` as the primary test key.
