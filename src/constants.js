// Requests
const INTENT_REQUEST = 'IntentRequest'
const LAUNCH_REQUEST = 'LaunchRequest'
const SESSION_ENDED_REQUEST = 'SessionEndedRequest'

// Intents
const HELP_INTENT = 'AMAZON.HelpIntent'
const CANCEL_INTENT = 'AMAZON.CancelIntent'
const STOP_INTENT = 'AMAZON.StopIntent'
const LOG_START_TIME_INTENT = 'LogStartTimeIntent'
const LOG_END_TIME_INTENT = 'LogEndTimeIntent'
const GET_TIME_INTENT = 'GetTimeIntent'
const GET_ALL_TIME_INTENT = 'ClearAllTimeIntent'
const CLEAR_ALL_TIME_INTENT = 'ClearAllTimeIntent'

// DB
const APP_STATE_TABLE = 'alexa_game_timer'

// App states
const APP_STATE_PLAYER_TURN = 'player_turn'
const APP_STATE_PAUSED = 'paused'

module.exports = {
  // Requests
  LAUNCH_REQUEST,
  INTENT_REQUEST,
  SESSION_ENDED_REQUEST,

  // Intents
  HELP_INTENT,
  CANCEL_INTENT,
  STOP_INTENT,
  LOG_START_TIME_INTENT,
  LOG_END_TIME_INTENT,
  GET_TIME_INTENT,
  GET_ALL_TIME_INTENT,
  CLEAR_ALL_TIME_INTENT,

  // DB
  APP_STATE_TABLE,

  // App states
  APP_STATE_PLAYER_TURN,
  APP_STATE_PAUSED,
}
