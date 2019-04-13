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
      const speechText = 'It\'s a new game. No turns have been made yet.'
      return speakAndReprompt(handlerInput, speechText)
    }

    const times = await AppStateModel.getAllPlayersTotalTime(userId)
    const colors = Object.keys(times)
    const totalTimeAllPlayers =
      colors.reduce((totalTime, color) =>
        totalTime + times[color], 0)
    const totalTimePerPlayerTexts =
      colors.map(color =>
        `${color} player's — ${msToHuman(times[color])}`)
    const speechText =
      `You've been playing for ${msToHuman(totalTimeAllPlayers)}. ` +
      'Total times for all players are: ' +
      listToSpeech(totalTimePerPlayerTexts, ',')
    return speakAndReprompt(handlerInput, speechText)
  }
}

module.exports = GetAllPlayersTotalTimeIntentHandler
