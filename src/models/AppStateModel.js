const AWS = require('aws-sdk')
const {
  APP_STATE_TABLE,
  APP_STATE_PAUSED,
  APP_STATE_PLAYER_TURN,
} = require('../constants')

/**
 * An application state
 *
 * @typedef {Object} AppState
 * @property {number}                 [state]                  Current state of the application; one of APP_STATE_PAUSED, APP_STATE_PLAYER_TURN
 * @property {string}                 [currentPlayer]          Color of a current player
 * @property {number}                 [currentPlayerStartTime] The current sub-turn start time: either a turn start time, or a pause end time
 * @property {number}                 [currentPlayerTotalTime] The sum of all sub-turn times before a current one
 * @property { { [string]: number } } [playerTimes]            The mapping of player color values to their respective total time between all turns
 */

/**
 * A DynamoDB query/update functions callback
 *
 * @callback DynamoDBQueryCallback
 * @param {Error} [err=null] An optional error
 * @param {Object} data      A resulting query data
 */

/**
 * DynamoDB client for querying/updating documents
 */
const client = new AWS.DynamoDB.DocumentClient();

/**
 * Acquire an application state from a DynamoDB table
 *
 * @param {string} userId Alexa user id
 * @param {DynamoDBQueryCallback} cb
 */
function getByUserIdCb(userId, cb) {
  const params = {
    TableName: APP_STATE_TABLE,
    Key: { userId }
  }
  client.get(params, (err, data) =>
    err ? cb(err) : cb(data.appState))
}

/**
 * Update an application state in a DynamoDB table
 *
 * @param {string}                userId Alexa user id
 * @param {AppState}              state  A new application state
 * @param {DynamoDBQueryCallback} cb
 */
function putByUserIdCb(userId, state, cb) {
  const params = {
    TableName: APP_STATE_TABLE,
    Key: { userId },
    UpdateExpression: 'set appState=:s',
    ExpressionAttributeValues: {
      ':s': state,
    },
    ReturnValues: 'UPDATED_NEW',
  }
  client.update(params, cb)
}

/**
 * Acquire an application state
 *
 * @param {string} userId Alexa user id
 * @returns {Promise<AppState>} A promise resolving to an application state
 */
function getByUserId(userId) {
  return new Promise((resolve, reject) =>
    getByUserIdCb(userId, (err, data) =>
      err ? reject(err) : resolve(data)))
}

/**
 * Update an application state
 *
 * @param {string} userId Alexa user id
 * @param {AppState} state New application state
 * @returns {Promise<undefined>}
 */
function putByUserId(userId, state) {
  return new Promise((resolve, reject) =>
    putByUserIdCb(userId, state, (err, data) =>
      err ? reject(err) : resolve(data)))
}

/**
 * Mark new game by clearing all previous recorded times
 *
 * @param {string} userId Alexa user id
 * @returns {void}
 */
async function markNewGame(userId) {
  const state = (await AppStateModel.getByUserId(userId)) || {}

  const newState = {
    ...state,
    state: APP_STATE_PAUSED,
    currentPlayer: '',
    currentPlayerStartTime: 0,
    currentPlayerTotalTime: 0,
    playerTimes: {},
  }

  return AppStateModel.putByUserId(userId, newState)
}

/**
 * Marks a start of a turn for the player
 *
 * Possibilities:
 *   * new player color is the same as previous player color
 *     * (1) either a current turn is ongoing
 *     * (2) or it is paused
 *   * new player color is different
 *     * (3) either a previous player's turn was ongoing
 *     * (4) or it was paused
 *     * (5) or a start of the game (previous player is not specified)
 *
 * @param {string} userId            Alexa user id
 * @param {string} playerColor       New player color
 * @param {number} [time=Date.now()] Turn start time. Defaults to now
 * @returns {void}
 */
async function markPlayerColorTurnStart(userId, playerColor, time = Date.now()) {
  const state = (await AppStateModel.getByUserId(userId)) || {}

  const newState = { ...state }
  const previousPlayer = newState.currentPlayer

  // update state.playerTimes
  if (newState.state && previousPlayer) {
    // this is not a game start, previous player exists, cases (1) through (4)
    if (previousPlayer === playerColor) {
      // same player as in previous turn, cases (1) and (2)
      if (newState.state === APP_STATE_PLAYER_TURN) {
        // (1) no need to restart the current turn if it belongs to the same player and is ongoing
        return
      } else {
        // (2)
      }
    } else {
      // a different player, cases (3) and (4)
      const previousPlayerPreviousTotalTime =
        newState.playerTimes && newState.playerTimes[previousPlayer]
          ? Number(newState.playerTimes[previousPlayer])
          : 0
      const previousPlayerStartTime = newState.currentPlayerStartTime
      const previousPlayerTotalTime = newState.currentPlayerTotalTime
      let previousPlayerNewTotalTime = 0

      if (newState.state === APP_STATE_PLAYER_TURN) {
        // (3) update previous player's total time using current sub-turn time
        // and all previous sub-turns in the previous turn
        previousPlayerNewTotalTime =
          (time - previousPlayerStartTime) +
          previousPlayerTotalTime +
          previousPlayerPreviousTotalTime

        newState.playerTimes = {
          ...newState.playerTimes,
          [previousPlayer]: previousPlayerNewTotalTime,
        }
      } else if (newState.state === APP_STATE_PAUSED) {
        // (4) update previous player's total time using all previous sub-turns
        // in the previous turns
        previousPlayerNewTotalTime =
          previousPlayerTotalTime +
          previousPlayerPreviousTotalTime

        newState.playerTimes = {
          ...newState.playerTimes,
          [previousPlayer]: previousPlayerNewTotalTime,
        }
      } else {
        throw new Error(`markPlayerColorTurnStart: unknown state ${newState.state}`)
      }
    }
  } else {
    // (5) game start, no data
    newState.playerTimes = {}
  }

  // mark turn start for a new player
  // (2) is handled implicitly here by starting a new turn
  newState.currentPlayer = playerColor
  newState.currentPlayerStartTime = time
  if (previousPlayer !== playerColor) { // not (2)
    newState.currentPlayerTotalTime = 0
  }
  newState.state = APP_STATE_PLAYER_TURN

  await AppStateModel.putByUserId(userId, newState)
}

/**
 * Marks a pause for the current player's turn
 *
 * Possibilities:
 *   * (1) there were ongoing player turn
 *   * (2) the turn is already paused
 *   * (3) there is no current player (it's a beginning of the game)
 *
 * @param {string} userId            Alexa user id
 * @param {number} [time=Date.now()] Turn pause time. Defaults to now
 * @returns {void}
 */
async function markCurrentPlayerTurnPause(userId, time = Date.now()) {
  const state = (await AppStateModel.getByUserId(userId)) || {}

  if (state.state) { // not (3)
    if (state.state === APP_STATE_PAUSED) { // (2)
      return
    }
    if (state.state !== APP_STATE_PLAYER_TURN) {
      throw new Error(`markPlayerColorTurnStart: unknown state ${newState.state}`)
    }
  }

  const newState = { ...state }
  if (newState.currentPlayer) { // (1)
    const currentPlayerTotalTime =
      newState.currentPlayerTotalTime +
      (time - newState.currentPlayerStartTime)
    newState.currentPlayerTotalTime = currentPlayerTotalTime
  } else { // (3)
    newState.currentPlayer = ''
    newState.currentPlayerTotalTime = 0
    newState.playerTimes = {}
  }
  newState.currentPlayerStartTime = 0
  newState.state = APP_STATE_PAUSED

  await AppStateModel.putByUserId(userId, newState)
}

/**
 * Get total turn time for the specified player
 *
 * Possibilities:
 *   * (1) current player is not the specified one
 *   * (2) current player is the specified one and turn is paused
 *   * (3) current player is the specified one and turn is ongoing
 *   * (4) not current player (game start)
 *
 * @param {string} userId      Alexa user id
 * @param {string} playerColor Player color
 * @returns {number}           Player total time for all turns
 */
async function getPlayerTotalTurnTime(userId, playerColor) {
  const state = (await AppStateModel.getByUserId(userId)) || {}

  if (!(
    (state.playerTimes && state.playerTimes[playerColor]) ||
    state.currentPlayer
  )) {
    return null
  }

  const playerPreviousTotalTime =
    state.playerTimes && state.playerTimes[playerColor]
      ? Number(state.playerTimes[playerColor])
      : 0
  let totalTime = playerPreviousTotalTime

  if (state.currentPlayer === playerColor) { // (2), (3)
    const time = Date.now()
    if (state.state === APP_STATE_PAUSED) { // (2)
      totalTime += state.currentPlayerTotalTime
    } else if (state.state === APP_STATE_PLAYER_TURN) { // (3)
      totalTime += (time - state.currentPlayerStartTime) +
        state.currentPlayerTotalTime
    } else {
      throw new Error(`getPlayerTotalTurnTime: unknown state ${state.state}`)
    }
  } // else (1)

  return totalTime
}

/**
 * Get current turn time
 *
 * Possibilities:
 *   * There is no current player (the game is just started) (1)
 *   * There is a current player and the turn is paused (2)
 *   * There is a current player and the turn is ongoing (3)
 *
 * @param {string} userId Alexa user id
 * @returns {number}      Current turn total time
 */
async function getCurrentTurnTime(userId) {
  const state = (await AppStateModel.getByUserId(userId)) || {}

  if (!state.currentPlayer) { // (1)
    return null
  }

  if (state.state === APP_STATE_PAUSED) { // (2)
    return state.currentPlayerTotalTime
  } else if (state.state === APP_STATE_PLAYER_TURN) { // (3)
    const time = Date.now()
    return state.currentPlayerTotalTime +
      (time - state.currentPlayerStartTime)
  } else {
    throw new Error(`getCurrentTurnTime: unknown state ${state.state}`)
  }
}

/**
 * Get total turn time for all players
 *
 * Possibilities:
 *   * (1) There is no player time records and no current player
 *   * (2) There is no player time records, there is a current player and the turn is paused
 *   * (3) There is no player time records, there is a current player and the turn is ongoing
 *   * (4) There are player time records, there is a current player and the turn is paused
 *   * (5) There are player time records, there is a current player and the turn is ongoing
 *
 * @param {string} userId            Alexa user id
 * @returns { { [string]: number } } A mapping of player colors to their total time
 */
async function getAllPlayersTotalTurnTime(userId) {
  const state = (await AppStateModel.getByUserId(userId)) || {}

  if (state.currentPlayer) { // (2) through (4)
    const totalTimes = { ...state.playerTimes }
    if (state.state === APP_STATE_PAUSED) { // (2), (4)
      const currentPlayerTotalTime = state.currentPlayerTotalTime
      totalTimes[state.currentPlayer] = currentPlayerTotalTime +
        (totalTimes[state.currentPlayer] || 0) // could be undefined; undefined + 0 = NaN
    } else if (state.state === APP_STATE_PLAYER_TURN) { // (3), (5)
      const time = Date.now()
      const currentPlayerTotalTime = state.currentPlayerTotalTime
      totalTimes[state.currentPlayer] = currentPlayerTotalTime +
        (time - state.currentPlayerStartTime) +
        (totalTimes[state.currentPlayer] || 0)
    } else {
      throw new Error(`getAllPlayersTotalTurnTime: unknown state ${state.state}`)
    }
    return totalTimes
  } else { // (1)
    return null
  }
}

const AppStateModel = {
  // DO NOT USE DIRECTLY: expose this to stub in tests
  getByUserId,
  putByUserId,

  // Business logic methods
  markNewGame,
  markPlayerColorTurnStart,
  markCurrentPlayerTurnPause,
  getPlayerTotalTurnTime,
  getCurrentTurnTime,
  getAllPlayersTotalTurnTime,
}

module.exports = AppStateModel
