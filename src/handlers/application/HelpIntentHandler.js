const { HELP_INTENT } = require('../../constants')
const { canHandleIntentRequest } = require('../../utils')

const HelpIntentHandler = {
  canHandle: canHandleIntentRequest(HELP_INTENT),

  handle(handlerInput) {
    const speechText = 'Just tell me: say red, or say green';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = HelpIntentHandler;
