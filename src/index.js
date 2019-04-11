// See also https://alexa.design/cookbook
const Alexa = require('ask-sdk-core')
const {
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
} = require('./handlers')

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    // Startup
    LaunchRequestHandler,

    // Help
    HelpIntentHandler,

    // Application flow (getters)
    GetPlayerTotalTimeIntentHandler,
    GetCurrentTurnTimeIntentHandler,
    GetAllPlayersTotalTimeIntentHandler,

    // Application flow (modifiers)
    StartTurnIntentHandler,
    PauseTurnIntentHandler,
    ContinueTurnIntentHandler,
    NewGameIntentHandler,

    // Exit&Debug
    SessionEndedRequestHandler,
    DebugHandler
  ).addErrorHandlers(
    ErrorHandler
  ).lambda()
