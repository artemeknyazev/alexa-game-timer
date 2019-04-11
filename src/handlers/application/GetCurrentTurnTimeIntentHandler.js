const {
  GET_CURRENT_TURN_TIME_INTENT,
  APP_STATE_NEW_GAME,
  APP_STATE_TURN_ONGOING,
  APP_STATE_TURN_PAUSED,
} = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
  msToHuman,
  speakAndReprompt,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const GetCurrentTurnTimeIntentHandler = {
  canHandle: canHandleIntentRequest(GET_CURRENT_TURN_TIME_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const currentTurnTime = await AppStateModel.getCurrentTurnTime(userId)
    const { currentPlayer, state } = await AppStateModel.describeCurrentState(userId)

    let speechText = ''
    if (state === APP_STATE_NEW_GAME) {
      speechText = 'It\'s a new game. No turns have been made yet'
    } else if (state === APP_STATE_TURN_ONGOING) {
      speechText = `It's ${currentPlayer} player's turn. The turn is in progress. Current turn time is ${msToHuman(currentTurnTime)}`
    } else if (state === APP_STATE_TURN_PAUSED) {
      speechText = `It's ${currentPlayer} player's turn. The turn is paused. Current turn time is ${msToHuman(currentTurnTime)}`
    } else {
      throw new Error(`GetCurrentTurnTimeIntentHandler: unknown state ${state}`)
    }

    return speakAndReprompt(handlerInput, speechText)
  }
}

module.exports = GetCurrentTurnTimeIntentHandler
