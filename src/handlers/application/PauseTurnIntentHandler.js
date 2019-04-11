const { PAUSE_TURN_INTENT } = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
  speakAndReprompt,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const PauseTurnIntentHandler = {
  canHandle: canHandleIntentRequest(PAUSE_TURN_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    await AppStateModel.markPauseTurn(userId)

    const speechText = `Paused the current turn`
    return speakAndReprompt(handlerInput, speechText)
  }
}

module.exports = PauseTurnIntentHandler
