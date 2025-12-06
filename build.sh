tsc -b

if [ -f .env ]; then
    source .env
fi

if [ -f dist/FileCabinet/tsconfig.tsbuildinfo ]; then
    rm dist/FileCabinet/tsconfig.tsbuildinfo
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