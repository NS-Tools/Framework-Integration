#!/usr/bin/env bash

FRAMEWORK_REPOSITORY=$1
FRAMEWORK_BRANCH=$2
CURRENT_DIR=$(pwd)

echo "Adding PR Repository"
cd src/Framework
echo "Adding remote for PR repository: $FRAMEWORK_REPOSITORY"
git remote add prrepo $FRAMEWORK_REPOSITORY
echo "Fetching PR repository"
git fetch prrepo
echo "Checking out PR branch: prrepo/$FRAMEWORK_BRANCH"
git checkout -b prrepo/$FRAMEWORK_BRANCH

echo "Installing dependencies"
npm install
echo "Running tests"
npm run test

echo "Running linting/formatting checks"
npx @biomejs/biome check

git branch -d prrepo/$FRAMEWORK_BRANCH

# Uncomment these for testing
# git remote remove prrepo
# git reset --hard $HEAD
# git checkout master

cd $CURRENT_DIR
echo "Tests complete!"