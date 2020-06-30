ZIPFILE_NAME := serverless-image-handler.zip
TEMPLATEFILE_NAME := serverless-image-handler.template

# This is where source releases will be uploaded.
DIST_RELEASE_NAME := $(shell git rev-parse --short HEAD)
DIST_S3_BUCKET_REGION := us-east-1
DIST_S3_BUCKET_NAME := serverless-image-handler-releases-us-east-1
DIST_S3_BUCKET_KEY_PREFIX := releases/$(DIST_RELEASE_NAME)

# The local place we will produce the source zip along with a
# cloudformation template referring to it. Since the cloudformation
# template depends on the S3 bucket details, all need to be included in
# output paths.
DIST_BASE_DIR := dist
DIST_BUILD_DIR := "$(DIST_BASE_DIR)/$(DIST_S3_BUCKET_REGION)/$(DIST_S3_BUCKET_NAME)/$(DIST_RELEASE_NAME)"
DIST_ZIP := $(DIST_BUILD_DIR)/$(ZIPFILE_NAME)
DIST_TEMPLATE := $(DIST_BUILD_DIR)/$(TEMPLATEFILE_NAME)

LATEST_RELEASE_URL := "https://serverless-image-handler-releases-us-east-1.s3.us-east-1.amazonaws.com/releases/1a8f862/serverless-image-handler.zip"

.DEFAULT_GOAL := all

builder:
	docker build -t serverless-image-builder .

test: builder
	docker run --rm serverless-image-builder sh -c 'yarn install --dev && yarn test'

$(DIST_BUILD_DIR):
	mkdir -p $@

$(DIST_ZIP): $(DIST_BUILD_DIR) builder
	docker run --rm -v $$(pwd)/$(DIST_BUILD_DIR):/dist serverless-image-builder

$(DIST_TEMPLATE): deployment/serverless-image-handler.template $(DIST_BUILD_DIR) 
	cp $< $@.tmp
	sed -i "" -e "s,%%DIST_S3_BUCKET_NAME%%,$(DIST_S3_BUCKET_NAME),g" $@.tmp
	sed -i "" -e "s,%%DIST_ZIP_FILE_KEY%%,$(DIST_S3_BUCKET_KEY_PREFIX)/$(ZIPFILE_NAME),g" $@.tmp
	mv $@.tmp $@

release: $(DIST_ZIP) $(DIST_TEMPLATE)
	@printf "\nDone!\n\n"
	@printf "\033[1mRelease zipfile:\033[0m  $(DIST_ZIP)\n"
	@printf "\033[1mRelease template:\033[0m $(DIST_TEMPLATE)\n"

upload-release:
	AWS_PAGER="" aws s3api put-object \
		--bucket $(DIST_S3_BUCKET_NAME) \
		--key $(DIST_S3_BUCKET_KEY_PREFIX)/$(TEMPLATEFILE_NAME) \
		--acl public-read \
		--region $(DIST_S3_BUCKET_REGION) \
		--body $(DIST_TEMPLATE)
	AWS_PAGER="" aws s3api put-object \
		--bucket $(DIST_S3_BUCKET_NAME) \
		--key $(DIST_S3_BUCKET_KEY_PREFIX)/$(ZIPFILE_NAME) \
		--acl public-read \
		--region $(DIST_S3_BUCKET_REGION) \
		--body $(DIST_ZIP)
	@printf "\nDone!\n\n"
	@printf "\033[1mRelease URL:\033[0m https://$(DIST_S3_BUCKET_NAME).s3.$(DIST_S3_BUCKET_REGION).amazonaws.com/$(DIST_S3_BUCKET_KEY_PREFIX)/$(TEMPLATEFILE_NAME)\n"

all: release

clean:
	rm -rf $(DIST_BASE_DIR)

.PHONY: builder all release upload-release test
