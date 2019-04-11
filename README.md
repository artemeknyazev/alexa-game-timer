# alexa-game-timer

[![Build Status](https://travis-ci.org/artemeknyazev/alexa-game-timer.svg?branch=master)](https://travis-ci.org/artemeknyazev/alexa-game-timer)

A simple “game timer” (like chess timer) skill for Amazon Alexa

## Installation for development

**Requirements:** You need to have accounts both at [Amazon Developer](https://developer.amazon.com) and [AWS](http://aws.amazon.com)

### Set up the AWS Lambda function and DB

1. Log in to your account at [AWS Console](https://console.aws.amazon.com)
2. Set up the database
   1. Add DynamoDB service to yur console
   2. Create a new table with:
      * name `alexa_game_timer`
      * primary key `String` `userId`
      * `[x] Use default settings` checked
3. Set up the AWS Lambda function
   1. Add AWS Lambda to your console
   2. Create a new function:
      * check `[x] Author from scratch`
      * name `alexa-game-timer`
      * runtime `Node.js 8.10`
      * create a new role with access to AWS CloudWatch logs AND access read/write access to the DynamoDB's `alexa_game_timer` table
  3. After creating go to the new function and:
      * add `Alexa Skills Kit` trigger
      * set handler to `index.handler`
      * copy your function's ARN at the top-right (`arn:aws:lambda:us-east-1:...:function:alexa-game-timer`)

### Set up the Alexa Skill

1. Log in to your account at [Amazon Developer](https://developer.amazon.com)
2. Go to “Alexa”, then “Your Alexa Consoles” > “Skills“ at the top left of the window
3. Create a new skill:
   * skill name `alexa-game-timer`
   * default language `English (US)`
   * choose a `Custom` model
   * choose a `Provision your own` hosting method
4. After creating go to the new skill and:
   * open the “Endpoint” page (bottom of the left menu), select “AWS Lambda ARN” and paste here the ARN of an AWS Lambda function from above
   * open the “JSON Editor” page and drag-and-drop schema.json file from the project root
   * click “Save Model”, then “Build Model” and wait a bit

### Test a new Alexa Skill

1. On the skill page at “Alexa developer console” go to “Test”
2. Select skill testing enabled in `Development`
3. Enter `game timer` into the `Type or click` input and press Enter
4. If the app is not responding, check AWS CLoudWatch logs
5. If welcome message is displayed, type or say `help` and proceed further
