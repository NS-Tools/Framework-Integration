# NS Tools Integration/Starter Template

NS Tools Integration is the integration project. This repository also doubles as a batteries included starter template for new projects. Take the guess work out of starting new projects!

# Project Usage

To use this repository you must setup your environment for communicating with SuiteCloud as outlined under the account setup steps below.

## SuiteCloud Account Setup

Note: For step five you'll need to know the account id (for Sandbox environments it'll usually be account number_sb1). Auth id is a friendly name given to the authentication, and is not predicated on anything configured within Netsuite.

1. Set the SUITECLOUD_CI_PASSKEY variable in .devcontainer/devcontainer.json, I recommend running `dbus-uuidgen` to create a unique secure string
2. If you did this from inside the devcontainer, you'll need to rebuild the container to pull in the new environment variable.
3. Generate a RSA certificate for your environment. `mkdir cert && openssl req -new -x509 -newkey rsa:4096 -keyout cert/private.pem -sigopt rsa_padding_mode:pss -sha256 -sigopt rsa_pss_saltlen:64 -out cert/public.pem -nodes`
4. Upload the certificate to Netsuite (Setup -> Integration -> Oauth Client Credentials (M2M) Setup), make sure you set the application as SuiteCloud Development Integration
5. Run this command after replacing the variables ```
    npx suitecloud account:setup:ci --account="$ACCOUNT_ID" \
        --authid="$AUTH_ID" \
        --certificateid="$CERTIFICATE_ID" \
        --domain="$NETSUITE_URL" \
        --privatekeypath="cert/private.pem"
    ```

# Integration Testing

## Running Integration Tests
To run the integration tests perform the following
1. Run `build-environment.sh` using the provided .env file
2. Update src/CONSTANTS.ts with your desired ids. Do not commit changes to this file.
3. Run `npm run build:deploy`
4. Run the Suitelet `NS Tools Integration Tests` (you can find the URL on the deployment page)
5. Run the MapReduce script `NS Tools Auto Search Integration`
6. Run the MapReduce script `NS Tools Auto Query Integration`

## Reporting Issues
Please report issues with the integration tests to the Framework repository https://github.com/NS-Tools/Framework

If possible please setup NST_SL_Integration.ts's $DEBUG_FOLDER_ID with the internal id of a file cabinet folder, and upload the log file generated. 

# Template

## Setup
To use this project as your templatedo the following:
1. Fork the project
2. Update .env
3. Run `build-environment.sh`
4. (Optional) Update README.md to match your project

## .env configuration
### Required variables
- PROJECT_NAME: Project name that will be used to set the output to dist/FileCabinet/PROJECT_NAME
- FRAMEWORK_BRANCH: Set this to production unless you are wanting a bleeding edge branch
- INCLUDE_ACCOUNT_CONFIGURATION: Boolean value - When set to true the deploy.xml will include a configuration node, and dist/AccountConfiguration will be created
- INCLUDE_OBJECTS: Boolean value - When set set to true the deploy.xml will include a object node, and a dist/Objects will be created
- INCLUDE_TRANSLATIONS: Boolean value - When set set to true the deploy.xml will include a translations node, and a dist/Translations will be created
- INCLUDE_TEMPLATES: Boolean value - When set set to true a dist/Templates/E-mail Templates and dist/Templates/Marketing Tempaltes will be created
- INCLUDE_WEB_SITE_HOSTING_FILES: Boolean value - When set set to true a dist/Web Site Hosting Files/Live Hosting Files and dist/Web Site Hosting Files/Staging Hosting Files/ will be created
- INCLUDE_OPTIONAL_THIRD_PARTY: Boolean value - When set to true the git submodule with the optional thirdparty libraries will be added in src/Framework/thirdparty/optional
- KEEP_SRC_FILES: When set to true the build script will skip over deleting src files.

### Optional variables
- FRAMEWORK_REPOSITORY: Declare this variable with a git url if you wish to override the repository for Framework
- OPTIONAL_THIRD_PARTY_REPOSITORY: Declare this variable with a git url if you wish to override the repository for the optional third party libraries under src/Framework/thirdparty/optional
- OPTIONAL_THIRD_PARTY_BRANCH: Defaults to production

# Dev Container
Dev containers are a great way to ensure everyone is using the same base configuration. 

See https://code.visualstudio.com/docs/devcontainers/

**Note**: Using the devcontainer requires accepting the Oracle Free Use Terms and Conditions https://www.oracle.com/downloads/licenses/oracle-free-license.html

## Project Structure

The project structure is as follows.

- __tests__: This directory holds your jest tests.
- .devcontainer: devcontainer configuration
- dist: This is the SDF project directory. Everything is kept under git with the exception of dist/FileCabinet
- src
- - Framework: Git Submodule reference to NS Tools/Framework, or your forked copy of framework if you specified $FRAMEWORK_REPOSITORY
- - Client: Place all of your client scripts here
- - UserEvent: Place all of your user event scripts here
- - MapReduce: Place all of your map reduce scripts here
- - Scheduled: Place all of your scheduled scripts here
- - Suitelet: Place all of your suitelets here
- - Restlet: Place all of your restlets here
- .env: Environmental variables for your project. Make sure you update this.
- .gitignore: Update this file with any file that you would like ignored.
- .gitmodules: Git manages this file for track submodules
- build-environment.sh: This file rolls the integration folder into a new project
- build.sh: This file builds the project
- jest.config.js: Jest configuration
- package.json: NodeJS NPM configuration
- README.md: Project readme file
- suitecloud.config.js: SuiteCloud project configuration, runs jest tests before deployment.
- tsconfig.json: TypeScript configuration preconfigured for outputting Netsuite/SuiteScript compatible scripts.
