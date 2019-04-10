const { GET_PLAYER_TOTAL_TIME_INTENT } = require('../../constants')
const {
  canHandleIntentRequest,
  msToHuman,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const GetPlayerTotalTimeIntentHandler = {
  canHandle: canHandleIntentRequest(GET_PLAYER_TOTAL_TIME_INTENT),

  handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const { color } = getSlots(handlerInput)
    if (!color) {
      const speechText = 'I do not understand. Please say, player red turn start, or begin green turn'
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }

    const totalTime = await AppStateModel.getPlayerTotalTime(userId, color)

    const speechText = `The ${color} player's total time is ${msToHuman(totalTime)}`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = GetPlayerTotalTimeIntentHandler;
