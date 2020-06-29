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
