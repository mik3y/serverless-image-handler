# Changelog

## Current version (in development)

* Forked from [awslabs/serverless-image-handler@19cbc3ce](https://github.com/awslabs/serverless-image-handler/tree/19cbc3ce759d7c8d8ddc35081972d7ac1daf0c71).
* Removed the demo UI.
* Removed usage metrics reporting.
* Removed the additional `custom-resource` lambda.
* Use `yarn`.
* Use `eslint` and `prettier`.
* Add hermetic build using Docker (`make release`)
* Bugfix: Fixed handling of `AUTO_WEBP` env flag.
