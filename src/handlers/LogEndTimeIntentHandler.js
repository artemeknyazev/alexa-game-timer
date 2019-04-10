const { LOG_END_TIME_INTENT } = require('../constants')
const { canHandleIntentRequest } = require('../utils')

const LogEndTimeIntentHandler = {
  canHandle: canHandleIntentRequest(LOG_END_TIME_INTENT),

  handle(handlerInput) {
    const color = 'red'
    const speechText = `Logged turn end for ${color} player`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = LogEndTimeIntentHandler;
