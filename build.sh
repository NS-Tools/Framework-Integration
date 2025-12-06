tsc -b

if [ -f dist/FileCabinet/tsconfig.tsbuildinfo ]; then
    rm dist/FileCabinet/tsconfig.tsbuildinfo
fi

# Copy thirdparty assets
if [ ! -d dist/FileCabinet/SuiteScripts/thirdparty/core/ ]; then
    mkdir -p dist/FileCabinet/SuiteScripts/thirdparty/core/
fi

cp -R src/thirdparty/core/* dist/FileCabinet/SuiteScripts/thirdparty/core/

if [ -d src/thirdparty/optional ]; then
    if [ ! -d dist/FileCabinet/SuiteScripts/thirdparty/optional ]; then
        mkdir -p dist/FileCabinet/SuiteScripts/thirdparty/optional/
    fi

    cp -R src/thirdparty/optional/*.js dist/FileCabinet/SuiteScripts/thirdparty/optional/
fi