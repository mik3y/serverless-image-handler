ROOT_DIR := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
DIST_DIR := $(ROOT_DIR)/dist
DIST_ZIP := $(DIST_DIR)/serverless-image-handler.zip
.DEFAULT_GOAL := $(DIST_ZIP)

builder:
	docker build -t serverless-image-builder .

$(DIST_DIR):
	mkdir -p $@

$(DIST_ZIP): $(DIST_DIR) builder
	docker run --rm -v $(DIST_DIR):/dist serverless-image-builder

clean:
	rm -rf $(DIST_DIR)

.PHONY: builder
