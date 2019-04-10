const { GET_ALL_TIME_INTENT } = require('../constants')
const { canHandleIntentRequest } = require('../utils')

const GetAllTimeIntentHandler = {
  canHandle: canHandleIntentRequest(GET_ALL_TIME_INTENT),

  handle(handlerInput) {
    const speechText = `Total time for all players`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = GetAllTimeIntentHandler;
