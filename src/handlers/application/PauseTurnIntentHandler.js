const { PAUSE_TURN_INTENT } = require('../../constants')
const { canHandleIntentRequest } = require('../../utils')
const { AppStateModel } = require('../../models')

const PauseTurnIntentHandler = {
  canHandle: canHandleIntentRequest(PAUSE_TURN_INTENT),

  handle(handlerInput) {
    const userId = getUserId(handlerInput)
    await AppStateModel.markPauseTurn(userId)

    const speechText = `Paused the current turn`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = PauseTurnIntentHandler;
