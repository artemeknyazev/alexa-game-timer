#!/usr/bin/env bash
set -euf -o pipefail

# This is publishing script for AWS Lambda
# Call it only from inside of a project folder
# (i.e. ../ from current)

readonly FUNCTION_NAME=alexa-game-timer
readonly ZIP_FILE_PATH=$TMPDIR/alexa-game-timer.zip

# Remove devDependencies
npm prune --production

# Prepare a zipped application for publishing
rm $ZIP_FILE_PATH || true
zip -X -r $ZIP_FILE_PATH *

# Publish the zipped application to AWS Lambda
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://$ZIP_FILE_PATH
