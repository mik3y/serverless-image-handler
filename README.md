# serverless-image-handler

Serverless image processing using AWS Lambda and [Sharp.js](https://sharp.pixelplumbing.com/).

## About this fork

This is a fork of [awslabs/serverless-image-handler](https://github.com/awslabs/serverless-image-handler).

The primary goal of this fork is to make the upstream project simpler to maintain and manage

Major changes:

* Removed the demo UI.
* Removed usage metrics reporting.
* Removed the additional `custom-resource` lambda.
* Hermetic build of source code zip file using Docker.

## Building

Build and test commands leverage Docker to ensure both run in an environment that as similar as possible to the AWS Lambda Node runtime.

To build:
```
make builder
```

To test:
```
make test
```

## Releasing

The CloudFormation template, and the code it refers to, must be released to an S3 bucket.

To deploy, you'll refer to the public URL of the template in this bucket.

Here's how to build and upload a release:

```
# Create and upload a release.
make release upload-release \
  DIST_S3_BUCKET_NAME=some-bucket-name \
  DIST_S3_BUCKET_REGION=us-east-1
```

The following values are passed to `make`:

* `DIST_S3_BUCKET_NAME`: An S3 bucket you maintain only for holding the source code and CloudFormation template. _It is not part of image processing_ and should be a different bucket.
* `DIST_S3_BUCKET_REGION`: The region this bucket was created in.

The command above will execute `aws s3api put-object` and whatever credentials are available for it in your environment.
