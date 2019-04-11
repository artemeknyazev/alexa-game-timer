const { START_TURN_INTENT } = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
  getSlots,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const StartTurnIntentHandler = {
  canHandle: canHandleIntentRequest(START_TURN_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const { color } = getSlots(handlerInput)
    if (!color) {
      const speechText = 'I do not understand. Please say, player red turn start, or begin green turn'
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse()
    }

    await AppStateModel.markStartTurn(userId, color)

    const speechText = `Marked the ${color} player's turn start`
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  }
}

module.exports = StartTurnIntentHandler
