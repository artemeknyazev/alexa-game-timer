const {
  CONTINUE_TURN_INTENT,
  APP_STATE_NEW_GAME,
  APP_STATE_TURN_ONGOING,
  APP_STATE_TURN_PAUSED,
} = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
  speakAndReprompt,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const ContinueTurnIntentHandler = {
  canHandle: canHandleIntentRequest(CONTINUE_TURN_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const { state } = await AppStateModel.describeCurrentState(userId)

    let speechText = ''
    if (state === APP_STATE_NEW_GAME) {
      speechText = `This is a new game. No turns have been made yet`
    } else if (state === APP_STATE_TURN_ONGOING) {
      speechText = `This turn is already in progress`
    } else if (state === APP_STATE_TURN_PAUSED) {
      await AppStateModel.markContinueTurn(userId)
      speechText = `Continued the current turn`
    } else {
      throw new Error(`ContinueTurnIntentHandler: unknown state ${state}`)
    }

    return speakAndReprompt(handlerInput, speechText)
  }
}

module.exports = ContinueTurnIntentHandler
