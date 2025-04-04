# Makefile for lampacbot project

# Project name
PROJECT_NAME = lampacbot

# Go compiler
GO = go

# Go build flags
GO_BUILD_FLAGS = -v

# Go test flags
GO_TEST_FLAGS = -v

# Source files
SRC = $(shell find . -name "*.go")

# Start
start:
	$(GO) run $(GO_BUILD_FLAGS) ./main.go

# Build target
build:
	$(GO) build $(GO_BUILD_FLAGS) -o $(PROJECT_NAME) ./main.go

# Test target
test:
	$(GO) test $(GO_TEST_FLAGS) ./app/db ./app/http

# Clean target
clean:
	rm -f $(PROJECT_NAME)
	rm -rf dist/

# Run target
run:
	./$(PROJECT_NAME)

# Release target
release:
	rm -rf dist
	goreleaser release

# Default target
all: build test