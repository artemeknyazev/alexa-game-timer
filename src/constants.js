// Requests
const INTENT_REQUEST = 'IntentRequest'
const LAUNCH_REQUEST = 'LaunchRequest'
const SESSION_ENDED_REQUEST = 'SessionEndedRequest'

// Intents
const CANCEL_INTENT = 'AMAZON.CancelIntent'
const STOP_INTENT = 'AMAZON.StopIntent'
const CONTINUE_TURN_INTENT = 'ContinueTurnIntent'
const GET_ALL_PLAYERS_TOTAL_TIME_INTENT = 'GetAllPlayersTotalTimeIntent'
const GET_CURRENT_TURN_TIME_INTENT = 'GetCurrentTurnTimeIntent'
const GET_PLAYER_TOTAL_TIME_INTENT = 'GetPlayerTotalTimeIntent'
const HELP_INTENT = 'AMAZON.HelpIntent'
const NEW_GAME_INTENT = 'NewGameIntent'
const PAUSE_TURN_INTENT = 'PauseTurnIntent'
const START_TURN_INTENT = 'StartTurnIntent'

// DB
const APP_STATE_TABLE = 'alexa_game_timer'

// App states
const APP_STATE_NEW_GAME = 'new_game' // only used for describing current state
const APP_STATE_TURN_ONGOING = 'player_turn'
const APP_STATE_TURN_PAUSED = 'paused'

module.exports = {
  // Requests
  LAUNCH_REQUEST,
  INTENT_REQUEST,
  SESSION_ENDED_REQUEST,

  // Intents
  CANCEL_INTENT,
  STOP_INTENT,
  CONTINUE_TURN_INTENT,
  HELP_INTENT,
  GET_ALL_PLAYERS_TOTAL_TIME_INTENT,
  GET_CURRENT_TURN_TIME_INTENT,
  GET_PLAYER_TOTAL_TIME_INTENT,
  NEW_GAME_INTENT,
  PAUSE_TURN_INTENT,
  START_TURN_INTENT,

  // DB
  APP_STATE_TABLE,

  // App states
  APP_STATE_NEW_GAME,
  APP_STATE_TURN_ONGOING,
  APP_STATE_TURN_PAUSED,
}
