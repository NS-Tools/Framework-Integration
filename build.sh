#!/bin/bash

# Cleanup dist folder for builds
rm -rf dist/FileCabinet/SuiteScripts/* \
    dist/FileCabinet/SuiteScripts/.* 2> /dev/null || true

# Build the typescript project
tsc -b

# Source the environment file if available. Otherwise third party paths will not correctly resolve.
if [ -f ${WORKSPACE_PATH}/.env ]; then
    source ${WORKSPACE_PATH}/.env
fi

# Remove ts build file since SDF will error
if [ -f dist/FileCabinet/tsconfig.tsbuildinfo ]; then
    rm dist/FileCabinet/tsconfig.tsbuildinfo
fi

# Remove ts build file since SDF will error
if [ -f dist/FileCabinet/SuiteScripts/tsconfig.tsbuildinfo ]; then
    rm dist/FileCabinet/SuiteScripts/tsconfig.tsbuildinfo
fi

# Copy thirdparty assets
if [ ! -d dist/FileCabinet/SuiteScripts/${PROJECT_NAME}/Framework/thirdparty/core/ ]; then
    mkdir -p dist/FileCabinet/SuiteScripts/${PROJECT_NAME}/Framework/thirdparty/core/
fi

cp -R src/Framework/thirdparty/core/* dist/FileCabinet/SuiteScripts/${PROJECT_NAME}/Framework/thirdparty/core/

if [ -d src/Framework/thirdparty/optional ]; then
    if [ ! -d "dist/FileCabinet/SuiteScripts/${PROJECT_NAME}/Framework/thirdparty/optional" ]; then
        mkdir "dist/FileCabinet/SuiteScripts/${PROJECT_NAME}/Framework/thirdparty/optional"
    fi

    cp -R src/Framework/thirdparty/optional/*.js dist/FileCabinet/SuiteScripts/${PROJECT_NAME}/Framework/thirdparty/optional/
fi
