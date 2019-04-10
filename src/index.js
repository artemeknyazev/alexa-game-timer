// See also https://alexa.design/cookbook
const Alexa = require('ask-sdk-core');
const {
  CancelAndStopIntentHandler,
  ContinueTurnIntentHandler,
  NewGameIntentHandler,
  DebugHandler,
  ErrorHandler,
  GetAllPlayersTotalTimeIntentHandler,
  GetCurrentTurnTimeIntentHandler,
  GetPlayerTotalTimeIntentHandler,
  HelpIntentHandler,
  LaunchRequestHandler,
  PauseTurnIntentHandler,
  StartTurnIntentHandler,
  SessionEndedRequestHandler,
} = require('./handlers');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    // Startup
    LaunchRequestHandler,
    HelpIntentHandler,

    // Application flow
    GetPlayerTotalTimeIntentHandler,
    GetCurrentTurnTimeIntentHandler,
    GetAllPlayersTotalTimeIntentHandler,
    StartTurnIntentHandler,
    PauseTurnIntentHandler,
    ContinueTurnIntentHandler,
    NewGameIntentHandler,

    // Exit&Debug
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    DebugHandler
  ).addErrorHandlers(
    ErrorHandler
  ).lambda();
