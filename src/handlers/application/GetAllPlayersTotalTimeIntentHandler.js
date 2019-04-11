const {
  GET_ALL_PLAYERS_TOTAL_TIME_INTENT,
  APP_STATE_NEW_GAME,
} = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
  msToHuman,
  listToSpeech,
  speakAndReprompt,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const GetAllPlayersTotalTimeIntentHandler = {
  canHandle: canHandleIntentRequest(GET_ALL_PLAYERS_TOTAL_TIME_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const { state } = await AppStateModel.describeCurrentState(userId)
    if (state === APP_STATE_NEW_GAME) {
      const speechText = `This is a new game. No turns have been made yet`
      return speakAndReprompt(handlerInput, speechText)
    }

    const times = await AppStateModel.getAllPlayersTotalTime(userId)
    const colors = Object.keys(times)
    const speechTexts = colors.map(color =>
      `${color} player - ${msToHuman(times[color])}`)
    const speechText = `Total times for all players are: ` + listToSpeech(speechTexts)
    return speakAndReprompt(handlerInput, speechText)
  }
}

module.exports = GetAllPlayersTotalTimeIntentHandler
