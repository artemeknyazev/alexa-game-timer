const {
  LOG_START_TIME_INTENT,
  APP_STATE_PLAYER_TURN,
} = require('../constants')
const {
  canHandleIntentRequest,
  getUserId,
  getSlots,
} = require('../utils')
const { AppStateModel } = require('../models')

const LogStartTimeIntentHandler = {
  canHandle: canHandleIntentRequest(LOG_START_TIME_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const { color } = getSlots(handlerInput)
    if (!color) {
      const speechText = 'I do not understand. Please say, player red turn start, or begin green turn'
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }

    const state = (await AppStateModel.getByUserId(userId)) || {}
    state.currentPlayer = color
    state.currentPlayerStartTime = Date.now()
    state.state = APP_STATE_PLAYER_TURN
    await AppStateModel.putByUserId(userId, state)

    const speechText = `Logged turn start for ${color} player`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

module.exports = LogStartTimeIntentHandler;
