module.exports = {
  ContinueTurnIntentHandler: require('./application/ContinueTurnIntentHandler'),
  NewGameIntentHandler: require('./application/NewGameIntentHandler'),
  DebugHandler: require('./system/DebugHandler'),
  ErrorHandler: require('./system/ErrorHandler'),
  GetAllPlayersTotalTimeIntentHandler: require('./application/GetAllPlayersTotalTimeIntentHandler'),
  GetCurrentTurnTimeIntentHandler: require('./application/GetCurrentTurnTimeIntentHandler'),
  GetPlayerTotalTimeIntentHandler: require('./application/GetPlayerTotalTimeIntentHandler'),
  HelpIntentHandler: require('./application/HelpIntentHandler'),
  LaunchRequestHandler: require('./application/LaunchRequestHandler'),
  PauseTurnIntentHandler: require('./application/PauseTurnIntentHandler'),
  StartTurnIntentHandler: require('./application/StartTurnIntentHandler'),
  SessionEndedRequestHandler: require('./system/SessionEndedRequestHandler'),
}
