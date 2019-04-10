const { SESSION_ENDED_REQUEST } = require('../../constants')
const { canHandleRequest } = require('../../utils')

const SessionEndedRequestHandler = {
  canHandle: canHandleRequest(SESSION_ENDED_REQUEST),

  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  }
};

module.exports = SessionEndedRequestHandler;
