const { CONTINUE_TURN_INTENT } = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const ContinueTurnIntentHandler = {
  canHandle: canHandleIntentRequest(CONTINUE_TURN_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    await AppStateModel.markContinueTurn(userId)

    const speechText = `Continued the current turn`
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  }
}

module.exports = ContinueTurnIntentHandler
