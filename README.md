# NS Tools Integration/Starter Template

NS Tools Integration is the integration project. This repository also doubles as a batteries included starter template for new projects. Take the guess work out of starting new projects!

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
