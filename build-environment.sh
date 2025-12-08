#!/usr/bin/env bash

# Set default values for environment variables
PROJECT_NAME="ns-tools-integration"
FRAMEWORK_REPOSITORY="https://github.com/NS-Tools/Framework.git"
FRAMEWORK_BRANCH="production"
INCLUDE_ACCOUNT_CONFIGURATION=true
INCLUDE_FILES=true
INCLUDE_OBJECTS=true
INCLUDE_TRANSLATIONS=true
INCLUDE_TEMPLATES=true
INCLUDE_WEB_SITE_HOSTING_FILES=true
KEEP_SRC_FILES=false

OPTIONAL_THIRD_PARTY_BRANCH="production"
CURRENT_DIR=$(pwd)

# Load environment variables from .env file
if [ -f .env ]; then
    source .env
fi

if [ -z "$INCLUDE_OPTIONAL_THIRD_PARTY_REPOSITORY" ]; then
    OPTIONAL_THIRD_PARTY_REPOSITORY="https://github.com/NS-Tools/ThirdParty.git"
fi

if [ -z "$OPTIONAL_THIRD_PARTY_BRANCH" ]; then
    OPTIONAL_THIRD_PARTY_BRANCH="production"
fi

# Convert project name to lowercase, and replace spaces with hyphens
MANIFEST_PROJECT_NAME="$(echo "${PROJECT_NAME}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"

echo "Building environment with the following settings:"
echo "PROJECT_NAME: $PROJECT_NAME"
echo "MANIFEST_PROJECT_NAME: $MANIFEST_PROJECT_NAME"
echo "FRAMEWORK_BRANCH: $FRAMEWORK_BRANCH"
echo "INCLUDE_ACCOUNT_CONFIGURATION: $INCLUDE_ACCOUNT_CONFIGURATION"
echo "INCLUDE_FILES: $INCLUDE_FILES"
echo "INCLUDE_OBJECTS: $INCLUDE_OBJECTS"
echo "INCLUDE_TRANSLATIONS: $INCLUDE_TRANSLATIONS"
echo "INCLUDE_TEMPLATES: $INCLUDE_TEMPLATES"
echo "INCLUDE_WEB_SITE_HOSTING_FILES: $INCLUDE_WEB_SITE_HOSTING_FILES"
echo "INCLUDE_OPTIONAL_THIRD_PARTY: $INCLUDE_OPTIONAL_THIRD_PARTY"

# Update Typescript out directory

# Clearing dist folder
if [ ! $KEEP_SRC_FILES ]; then
    if [ -d dist ]; then
        echo "Clearing dist folder"
        rm -rf dist/* dist/.* 2> /dev/null || true
    else
        echo "Creating dist folder."
        mkdir dist
    fi
fi

echo "Updating TypeScript output directory..."
jq ".compilerOptions.outDir = \"dist/FileCabinet/SuiteScripts/${PROJECT_NAME}\"" tsconfig.json > tsconfig.tmp.json \
    && mv tsconfig.tmp.json tsconfig.json
echo "Successfully updated TypeScript output directory completed."

echo "Updating package.json"
jq ".name = \"${MANIFEST_PROJECT_NAME}\"" package.json > package.tmp.json \
    && mv package.tmp.json package.json
jq ".version = \"1.0.0\"" package.json > package.tmp.json \
    && mv package.tmp.json package.json
echo "successfully updated package.json"

if [ $INCLUDE_ACCOUNT_CONFIGURATION ]; then
    echo "Including account configuration"
    mkdir -p dist/AccountConfiguration
    touch dist/AccountConfiguration/.gitkeep
fi

if [ $INCLUDE_OBJECTS ]; then
    echo "Including objects"
    mkdir -p dist/Objects
    touch dist/Objects/.gitkeep
fi

if [ $INCLUDE_TRANSLATIONS ]; then
    echo "Including translations"
    mkdir -p dist/Translations
    touch dist/Translations/.gitkeep
fi

if [ $INCLUDE_TEMPLATES ]; then
    mkdir -p "dist/Templates/Marketing Templates"
    touch "dist/Templates/Marketing Templates/.gitkeep"

    mkdir -p "dist/Templates/E-mail Templates"
    touch "dist/Templates/E-mail Templates/.gitkeep"
fi

if [ $INCLUDE_WEB_SITE_HOSTING_FILES ]; then
    echo "Including web site hosting files"
    mkdir -p "dist/Web Site Hosting Files/Live Hosting Files"
    touch "dist/Web Site Hosting Files/Live Hosting Files/.gitkeep"

    mkdir -p "dist/Web Site Hosting Files/Staging Hosting Files"
    touch "dist/Web Site Hosting Files/Staging Hosting Files/.gitkeep"
fi

echo "Building manifest.xml"

echo "<manifest projecttype=\"ACCOUNTCUSTOMIZATION\">
  <projectname>${MANIFEST_PROJECT_NAME}</projectname>
  <frameworkversion>1.0</frameworkversion>
  <dependencies>
    <features>
      <feature required="true">SERVERSIDESCRIPTING</feature>
    </features>
  </dependencies>
</manifest>" > dist/manifest.xml
echo "Successfully built manifest.xml"

echo "Building deploy.xml"
echo "<deploy>" >> dist/deploy.xml
if [ $INCLUDE_ACCOUNT_CONFIGURATION ]; then
    echo "    <configuration>
        <path>~/AccountConfiguration/*</path>
    </configuration>" >> dist/deploy.xml
fi

echo "    <files>
        <path>~/FileCabinet/*</path>
    </files>" > dist/deploy.xml

if [ $INCLUDE_OBJECTS ]; then
    echo "    <objects>
        <path>~/Objects/*</path>
    </objects>" >> dist/deploy.xml
fi

if [ $INCLUDE_TRANSLATIONS ]; then
    echo "    <translationimports>
        <path>~/Translations/*</path>
    </translationimports>" >> dist/deploy.xml
fi

echo "</deploy>" >> dist/deploy.xml
echo "Successfully built deploy.xml"

# Build src directory
echo "Building src directory"

if [ $KEEP_SRC_FILES ]; then
    echo "Keeping existing src files."
else
    echo "Removing existing src files."

    rm -rf src/Client \ 
        src/Records \
        src/UserEvent \
        src/Scheduled \
        src/MapReduce \
        src/Suitelet \
        src/Restlet

    # Make directories
    echo "Making base directories in src"
    mkdir -p src/{Client,UserEvent,Scheduled,MapReduce,Suitelet,Restlet,Records}
    touch src/Client/.gitkeep
    touch src/UserEvent/.gitkeep
    touch src/Scheduled/.gitkeep
    touch src/MapReduce/.gitkeep
    touch src/Suitelet/.gitkeep
    touch src/Restlet/.gitkeep
    touch src/Records/.gitkeep
fi

cd src/Framework
git checkout $FRAMEWORK_BRANCH
cd $CURRENT_DIR
git submodule update --init --recursive

echo "Environment build process completed."
