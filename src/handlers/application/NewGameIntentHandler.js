const { NEW_GAME_INTENT } = require('../../constants')
const { canHandleIntentRequest } = require('../../utils')
const { AppStateModel } = require('../../models')

const NewGameIntentHandler = {
  canHandle: canHandleIntentRequest(NEW_GAME_INTENT),

  handle(handlerInput) {
    const userId = getUserId(handlerInput)
    await AppStateModel.markNewGame(userId)

    const speechText = `Ready for a new game`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = NewGameIntentHandler;
