const {
  LAUNCH_REQUEST,
  APP_STATE_TURN_ONGOING,
  APP_STATE_TURN_PAUSED,
} = require('../../constants')
const {
  canHandleRequest,
  getUserId,
  emph,
  listToSpeech,
  speakAndReprompt,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const WELCOME_MESSAGE = 'Welcome to the Game Timer'
const HELP_MESSAGE = 'Say Help to get more information'
const PREVIOUS_GAME_MESSAGE = `You've began a game previously. Say ${emph('whose turn')} to get more information`

const LaunchRequestHandler = {
  canHandle: canHandleRequest(LAUNCH_REQUEST),

  async handle(handlerInput) {
    const speechTexts = [ WELCOME_MESSAGE, HELP_MESSAGE ]
    const userId = getUserId(handlerInput)
    const { state } = await AppStateModel.describeCurrentState(userId)
    if (state === APP_STATE_TURN_ONGOING || state === APP_STATE_TURN_PAUSED)
      speechTexts.push(PREVIOUS_GAME_MESSAGE)

    const speechText = listToSpeech(speechTexts)
    return speakAndReprompt(handlerInput, speechText)
  }
}

module.exports = LaunchRequestHandler
