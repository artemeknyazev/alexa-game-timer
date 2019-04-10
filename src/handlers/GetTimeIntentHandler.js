const { GET_TIME_INTENT } = require('../constants')
const { canHandleIntentRequest } = require('../utils')

const GetTimeIntentHandler = {
  canHandle: canHandleIntentRequest(GET_TIME_INTENT),

  handle(handlerInput) {
    const color = 'red'
    const totalTurnTime = '50 seconds'
    const speechText = `${color} player total turn time is ${totalTurnTime}`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = GetTimeIntentHandler;
