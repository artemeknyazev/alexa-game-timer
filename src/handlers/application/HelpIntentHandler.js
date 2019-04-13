const {
  HELP_INTENT,
  APP_STATE_NEW_GAME,
  APP_STATE_TURN_ONGOING,
  APP_STATE_TURN_PAUSED,
} = require('../../constants')
const {
  canHandleIntentRequest,
  getUserId,
  emph,
  emphr,
  listToSpeech,
  speakAndReprompt,
} = require('../../utils')
const { AppStateModel } = require('../../models')

const START_TURN_HELP_MESSAGE = `Say player's color and “${emphr('start turn')},” like “${emph('start red turn')}” to start next player's turn.`
const PAUSE_TURN_HELP_MESSAGE = `Say “${emph('pause')},” to pause the timer.`
const CONTINUE_TURN_HELP_MESSAGE = `Say “${emph('continue')},” to continue the current turn.`
const NEW_GAME_HELP_MESSAGE = `Say “${emph('end game')},” or “${emph('new game')},” to discard all remembered time.`
const GET_ALL_PLAYERS_TOTAL_TIME_HELP_MESSAGE = `Say “${emph('total time')},” or “${emph('how much played')},” to get the total time played per player.`
const GET_CURRENT_TURN_TIME_HELP_MESSAGE = `Say “${emph('whose turn')},” to get a current player and a current turn time.`
const GET_PLAYER_TOTAL_TIME_HELP_MESSAGE = `Say player's color and then “${emphr('player time')},” like “${emph('red player time')},” to get the total time played for the player.`
const CLOSE_HELP_MESSAGE = `Say “${emph('cancel')},” “${emph('stop')}” or “${emph('go home')}” to exit the game timer.`

const HelpIntentHandler = {
  canHandle: canHandleIntentRequest(HELP_INTENT),

  async handle(handlerInput) {
    const userId = getUserId(handlerInput)
    const { currentPlayer, state } = await AppStateModel.describeCurrentState(userId)
    let speechTexts = []
    if (state === APP_STATE_NEW_GAME) {
      speechTexts.push('It\'s a new game. No turns have been made yet.')
      speechTexts.push(START_TURN_HELP_MESSAGE)
      speechTexts.push(CLOSE_HELP_MESSAGE)
    } else if (state === APP_STATE_TURN_ONGOING) {
      speechTexts.push(`It's ${currentPlayer} player's turn. The turn is in progress.`)
      speechTexts.push(START_TURN_HELP_MESSAGE)
      speechTexts.push(PAUSE_TURN_HELP_MESSAGE)
      speechTexts.push(NEW_GAME_HELP_MESSAGE)
      speechTexts.push(GET_ALL_PLAYERS_TOTAL_TIME_HELP_MESSAGE)
      speechTexts.push(GET_CURRENT_TURN_TIME_HELP_MESSAGE)
      speechTexts.push(GET_PLAYER_TOTAL_TIME_HELP_MESSAGE)
      speechTexts.push(CLOSE_HELP_MESSAGE)
    } else if (state === APP_STATE_TURN_PAUSED) {
      speechTexts.push(`It's ${currentPlayer} player's turn. The turn is paused.`)
      speechTexts.push(START_TURN_HELP_MESSAGE)
      speechTexts.push(CONTINUE_TURN_HELP_MESSAGE)
      speechTexts.push(NEW_GAME_HELP_MESSAGE)
      speechTexts.push(GET_ALL_PLAYERS_TOTAL_TIME_HELP_MESSAGE)
      speechTexts.push(GET_CURRENT_TURN_TIME_HELP_MESSAGE)
      speechTexts.push(GET_PLAYER_TOTAL_TIME_HELP_MESSAGE)
      speechTexts.push(CLOSE_HELP_MESSAGE)
    } else {
      throw new Error(`HelpIntentHandler: unknown state ${state}`)
    }

    const speechText = listToSpeech(speechTexts)
    return speakAndReprompt(handlerInput, speechText)
  }
}

module.exports = HelpIntentHandler
