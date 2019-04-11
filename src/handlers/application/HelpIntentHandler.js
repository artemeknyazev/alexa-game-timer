const {
  HELP_INTENT,
  APP_STATE_NEW_GAME,
  APP_STATE_TURN_ONGOING,
  APP_STATE_TURN_PAUSED,
} = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const START_TURN_HELP_MESSAGE = 'Say player color and then start turn to start next player\'s turn.'
const PAUSE_TURN_HELP_MESSAGE = 'Say pause to pause the timer.'
const NEW_GAME_HELP_MESSAGE = 'Say end game, or new game to discard all remembered time'
const GET_ALL_PLAYERS_TOTAL_TIME_HELP_MESSAGE = 'Say how much do we played, or all time to get the total time played per player'
const GET_CURRENT_TURN_TIME_HELP_MESSAGE = 'Say what is happening, or whose turn to get current player and current turn time'
const GET_PLAYER_TOTAL_TIME = 'Say player color and then player time to get the total time played for the player'

const HelpIntentHandler = {
  canHandle: canHandleIntentRequest(HELP_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const { currentPlayer, state } = await AppStateModel.describeCurrentState(userId)
    let speechText = ''
    if (state === APP_STATE_NEW_GAME) {
      speechText += 'It\'s a new game. No turns have been made yet'
      speechText += START_TURN_HELP_MESSAGE
    } else if (state === APP_STATE_TURN_ONGOING) {
      speechText += `It's ${currentPlayer} player's turn. The turn is in progress.`
      speechText += START_TURN_HELP_MESSAGE
      speechText += PAUSE_TURN_HELP_MESSAGE
      speechText += NEW_GAME_HELP_MESSAGE
      speechText += GET_ALL_PLAYERS_TOTAL_TIME_HELP_MESSAGE
      speechText += GET_CURRENT_TURN_TIME_HELP_MESSAGE
      speechText += GET_PLAYER_TOTAL_TIME
    } else if (state === APP_STATE_TURN_PAUSED) {
      speechText += `It's ${currentPlayer} player's turn. The turn is paused`
      speechText += START_TURN_HELP_MESSAGE
      speechText += NEW_GAME_HELP_MESSAGE
      speechText += GET_ALL_PLAYERS_TOTAL_TIME_HELP_MESSAGE
      speechText += GET_CURRENT_TURN_TIME_HELP_MESSAGE
      speechText += GET_PLAYER_TOTAL_TIME
    } else {
      throw new Error(`HelpIntentHandler: unknown state ${state}`)
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  }
}

module.exports = HelpIntentHandler
