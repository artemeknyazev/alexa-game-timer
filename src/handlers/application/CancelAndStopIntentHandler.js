const { CANCEL_INTENT, STOP_INTENT } = require('../../constants')
const { canHandleIntentRequest } = require('../../utils')

const CancelAndStopIntentHandler = {
  canHandle: canHandleIntentRequest(CANCEL_INTENT, STOP_INTENT),

  handle(handlerInput) {
    const speechText = 'Goodbye!';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = CancelAndStopIntentHandler;
