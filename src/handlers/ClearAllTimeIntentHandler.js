const { CLEAR_ALL_TIME_INTENT } = require('../constants')
const { canHandleIntentRequest } = require('../utils')

const ClearAllTimeIntentHandler = {
  canHandle: canHandleIntentRequest(CLEAR_ALL_TIME_INTENT),

  handle(handlerInput) {
    const speechText = `Cleared time for all players`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = ClearAllTimeIntentHandler;
