#!/bin/bash

sudo chown -R node:node node_modules \
    && npm install

npm install -g --acceptSuiteCloudSDKLicense @oracle/suitecloud-cli