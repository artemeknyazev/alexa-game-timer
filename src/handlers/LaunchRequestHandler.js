const { LAUNCH_REQUEST } = require('../constants')
const { canHandleRequest } = require('../utils')

const LaunchRequestHandler = {
  canHandle: canHandleRequest(LAUNCH_REQUEST),

  handle(handlerInput) {
    const speechText = 'Welcome to the Game Timer. Say Help to get more information, or say player color and then say turn start';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = LaunchRequestHandler;
