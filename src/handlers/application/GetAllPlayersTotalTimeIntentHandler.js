const { GET_ALL_PLAYERS_TOTAL_TIME_INTENT } = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
  msToHuman,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const GetAllPlayersTotalTimeIntentHandler = {
  canHandle: canHandleIntentRequest(GET_ALL_PLAYERS_TOTAL_TIME_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const times = await AppStateModel.getAllPlayersTotalTime(userId)

    const keys = Object.keys(times)
    if (!keys.length) {
      const speechText = 'No turns we logged yet'
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse()
    }

    const timesStr = keys
      .map(color => `${color} player's - ${msToHuman(times[color])}`)
      .join('. ')
    const speechText = `Total time for all players is: ` + timesStr
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  }
}

module.exports = GetAllPlayersTotalTimeIntentHandler
