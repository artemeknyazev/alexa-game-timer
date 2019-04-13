const { GET_PLAYER_TOTAL_TIME_INTENT } = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
  getSlots,
  emph,
  msToHuman,
  speakAndReprompt,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const GetPlayerTotalTimeIntentHandler = {
  canHandle: canHandleIntentRequest(GET_PLAYER_TOTAL_TIME_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const { color } = getSlots(handlerInput)
    if (!color) {
      const speechText = `I do not understand. Please say, ${emph('“red player time”')}`
      return speakAndReprompt(handlerInput, speechText)
    }

    const totalTime = await AppStateModel.getPlayerTotalTime(userId, color)

    const speechText = `The ${color} player's total time is ${msToHuman(totalTime)}`
    return speakAndReprompt(handlerInput, speechText)
  }
}

module.exports = GetPlayerTotalTimeIntentHandler
