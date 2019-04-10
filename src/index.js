// See also https://alexa.design/cookbook
const Alexa = require('ask-sdk-core');
const {
  CancelAndStopIntentHandler,
  ClearAllTimeIntentHandler,
  DebugHandler,
  ErrorHandler,
  GetAllTimeIntentHandler,
  GetTimeIntentHandler,
  HelpIntentHandler,
  LaunchRequestHandler,
  LogEndTimeIntentHandler,
  LogStartTimeIntentHandler,
  SessionEndedRequestHandler,
} = require('./handlers');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    // Startup
    LaunchRequestHandler,
    HelpIntentHandler,

    // Application flow
    GetTimeIntentHandler,
    GetAllTimeIntentHandler,
    LogStartTimeIntentHandler,
    LogEndTimeIntentHandler,
    ClearAllTimeIntentHandler,

    // Exit&Debug
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    DebugHandler
  ).addErrorHandlers(
    ErrorHandler
  ).lambda();
