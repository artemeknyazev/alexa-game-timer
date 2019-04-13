const { START_TURN_INTENT } = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
  getSlots,
  emph,
  speakAndReprompt,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const StartTurnIntentHandler = {
  canHandle: canHandleIntentRequest(START_TURN_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const { color } = getSlots(handlerInput)
    if (!color) {
      const speechText = `I do not understand. Please say, ${emph('“start red turn”')}`
      return speakAndReprompt(handlerInput, speechText)
    }

    await AppStateModel.markStartTurn(userId, color)

    const speechText = `Marked the ${color} player's turn start`
    return speakAndReprompt(handlerInput, speechText)
  }
}

module.exports = StartTurnIntentHandler
