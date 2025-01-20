# Test Suite Documentation

This document provides an overview of the test suites in the `test` folder. It explains how to set up the environment and how to run the tests.

## Setup

1. **Environment Variables**: Ensure that the following environment variables are set in your `.env` file:

    ```env
    AWS_BUCKET=your-bucket-name
    AWS_REGION=your-region
    AWS_CREDENTIALS_ACCESSKEYID=your-access-key-id
    AWS_CREDENTIALS_SECRETACCESSKEY=your-secret-access-key
    AWS_EXPECTED_URL=your-expected-url
    ```
   
    ```env
    GCS_BUCKET=your-gcs-bucket-name
    GCS_PROJECTID=your-projectid
    GCS_EXPECTED_URL=your-expected-url
    ```

2. **Dependencies**: Install the necessary dependencies by running:

    ```sh
    npm install
    ```

## Running the Tests

To run test suite, execute the following command:

```sh
npm test
```
