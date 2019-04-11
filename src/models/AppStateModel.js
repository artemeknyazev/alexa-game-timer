const AWS = require('aws-sdk')
const {
  APP_STATE_TABLE,
  APP_STATE_NEW_GAME,
  APP_STATE_TURN_PAUSED,
  APP_STATE_TURN_ONGOING,
} = require('../constants')

/**
 * An application state
 *
 * @typedef {Object} AppState
 * @property {number}                 [state]                  Current state of the application; one of APP_STATE_TURN_PAUSED, APP_STATE_TURN_ONGOING
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
const client = new AWS.DynamoDB.DocumentClient()

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
  // NOTE: we do not expose the whole object, just the `appState` part
  client.get(params, (err, data) =>
    err ? cb(err) : cb(null, (data && data.Item && data.Item.appState) || {}))
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
  const state = await AppStateModel.getByUserId(userId)

  const newState = {
    ...state,
    state: APP_STATE_NEW_GAME,
    currentPlayer: null,
    currentPlayerStartTime: 0,
    currentPlayerTotalTime: 0,
    playerTimes: {},
  }

  return AppStateModel.putByUserId(userId, newState)
}

/**
 * Marks a start of a turn for the player
 *
 * Variants:
 *   * new player color is the same as previous player color
 *     * (1) either a current turn is ongoing
 *     * (2) or it is paused
 *   * new player color is different
 *     * (3) either a previous player's turn was ongoing
 *     * (4) or it was paused
 *   * (5) no previous player (start of the game)
 *   * (6) no data in DB
 *
 * @param {string} userId            Alexa user id
 * @param {string} playerColor       New player color
 * @param {number} [time=Date.now()] Turn start time. Defaults to now
 * @returns {void}
 */
async function markStartTurn(userId, playerColor, time = Date.now()) {
  const state = await AppStateModel.getByUserId(userId)

  const newState = { ...state }

  if (!state || !state.state || state.state === APP_STATE_NEW_GAME) { // (5), (6)
    newState.currentPlayer = playerColor
    newState.currentPlayerStartTime = time
    newState.currentPlayerTotalTime = 0
    newState.playerTimes = {}
    newState.state = APP_STATE_TURN_ONGOING
  } else { // this is not a game start, the previous player exists, cases (1) through (4)
    const previousPlayer = newState.currentPlayer

    if (previousPlayer === playerColor) { // same player as in the previous turn, cases (1) and (2)
      if (newState.state === APP_STATE_TURN_ONGOING) {
        return // (1) no need to restart the turn if it belongs to the same player and is ongoing
      } // else (2)
    } else { // a different player, cases (3) and (4)
      const previousPlayerPreviousTotalTime =
        newState.playerTimes && newState.playerTimes[previousPlayer]
          ? Number(newState.playerTimes[previousPlayer])
          : 0
      const previousPlayerTotalTime = newState.currentPlayerTotalTime
      let previousPlayerNewTotalTime = 0

      if (newState.state === APP_STATE_TURN_ONGOING) {
        // (3) update previous player's total time using current sub-turn time
        // and all previous sub-turns in the previous turn
        const previousPlayerStartTime = newState.currentPlayerStartTime
        previousPlayerNewTotalTime = (time - previousPlayerStartTime) +
          previousPlayerTotalTime + previousPlayerPreviousTotalTime
      } else if (newState.state === APP_STATE_TURN_PAUSED) {
        // (4) update previous player's total time using all previous sub-turns in previous turns
        previousPlayerNewTotalTime = previousPlayerTotalTime + previousPlayerPreviousTotalTime
      } else {
        throw new Error(`markStartTurn: unknown state ${newState.state}`)
      }

      newState.playerTimes = {
        ...newState.playerTimes,
        [previousPlayer]: previousPlayerNewTotalTime,
      }
    }

    // mark turn start for a new player; case (2) is implicitly handled here
    newState.currentPlayer = playerColor
    newState.currentPlayerStartTime = time
    if (previousPlayer !== playerColor) { // not (2)
      newState.currentPlayerTotalTime = 0
    }
    newState.state = APP_STATE_TURN_ONGOING
  }

  await AppStateModel.putByUserId(userId, newState)
}

/**
 * Marks a pause for the current player's turn
 *
 * Variants:
 *   * (1) there were ongoing player turn
 *   * (2) the turn is already paused
 *   * (3) there is no current player (it's a beginning of the game)
 *   * (4) no data in the DB
 *
 * @param {string} userId            Alexa user id
 * @param {number} [time=Date.now()] Turn pause time. Defaults to now
 * @returns {void}
 */
async function markPauseTurn(userId, time = Date.now()) {
  const state = await AppStateModel.getByUserId(userId)

  const newState = { ...state }
  if (!state || !state.state) { // (4)
    newState.currentPlayer = null
    newState.currentPlayerStartTime = 0
    newState.currentPlayerTotalTime = 0
    newState.playerTimes = {}
    newState.state = APP_STATE_NEW_GAME
  } else { // (1), (2), (3)
    if (
      state.state === APP_STATE_TURN_PAUSED ||
      state.state === APP_STATE_NEW_GAME
    ) { // (2), (3)
      return
    } else if (state.state === APP_STATE_TURN_ONGOING) { // (1)
      newState.currentPlayerTotalTime =
        newState.currentPlayerTotalTime +
        (time - newState.currentPlayerStartTime)
      newState.currentPlayerStartTime = 0
      newState.state = APP_STATE_TURN_PAUSED
    } else {
      throw new Error(`markStartTurn: unknown state ${newState.state}`)
    }
  }

  await AppStateModel.putByUserId(userId, newState)
}

/**
 * Continues current player's turn
 *
 * Variants:
 *   * (1) the turn is ongoing
 *   * (2) the turn is paused
 *   * (3) there is no current player (it's a beginning of the game)
 *   * (4) no data in DB
 *
 * @param {string} userId            Alexa user id
 * @param {number} [time=Date.now()] Turn pause time. Defaults to now
 * @returns {void}
 */
async function markContinueTurn(userId, time = Date.now()) {
  const state = await AppStateModel.getByUserId(userId)
  const newState = { ...state }

  if (!state || !state.state) { // (4)
    newState.currentPlayer = null
    newState.currentPlayerStartTime = 0
    newState.currentPlayerTotalTime = 0
    newState.playerTimes = {}
    newState.state = APP_STATE_NEW_GAME
  } else {
    if (state.state === APP_STATE_TURN_PAUSED) {
      newState.state = APP_STATE_TURN_ONGOING
      newState.currentPlayerStartTime = time
    } else { // (1)
      return
    }
  }

  await AppStateModel.putByUserId(userId, newState)
}

/**
 * Get total turn time for the specified player
 *
 * Variants:
 *   * (1) the current player is not the specified one
 *   * (2) the current player is the specified one and the turn is paused
 *   * (3) the current player is the specified one and the turn is ongoing
 *   * (4) no current player (game start)
 *   * (5) no data in DB
 *
 * @param {string} userId      Alexa user id
 * @param {string} playerColor Player color
 * @returns {number}           Player total time for all turns
 */
async function getPlayerTotalTime(userId, playerColor) {
  const state = await AppStateModel.getByUserId(userId)

  if (!state || !state.state || state.state === APP_STATE_NEW_GAME) { // (4), (5)
    return null
  }

  const playerPreviousTotalTime =
    state.playerTimes && state.playerTimes[playerColor]
      ? Number(state.playerTimes[playerColor])
      : 0
  let totalTime = playerPreviousTotalTime

  if (state.currentPlayer === playerColor) { // (2), (3)
    const time = Date.now()
    if (state.state === APP_STATE_TURN_PAUSED) { // (2)
      totalTime += state.currentPlayerTotalTime
    } else if (state.state === APP_STATE_TURN_ONGOING) { // (3)
      totalTime += (time - state.currentPlayerStartTime) +
        state.currentPlayerTotalTime
    } else {
      throw new Error(`getPlayerTotalTime: unknown state ${state.state}`)
    }
  } // else (1)

  return totalTime
}

/**
 * Get current turn time
 *
 * Variants:
 *   * (1) There is no current player (the game is just started)
 *   * (2) There is a current player and the turn is paused
 *   * (3) There is a current player and the turn is ongoing
 *   * (4) No data in DB
 *
 * @param {string} userId Alexa user id
 * @returns {number}      Current turn total time
 */
async function getCurrentTurnTime(userId) {
  const state = await AppStateModel.getByUserId(userId)

  if (!state || !state.state || state.state == APP_STATE_NEW_GAME) { // (1), (4)
    return null
  } else if (state.state === APP_STATE_TURN_PAUSED) { // (2)
    return state.currentPlayerTotalTime
  } else if (state.state === APP_STATE_TURN_ONGOING) { // (3)
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
 * Variants:
 *   * (1) There is no player time records and no current player
 *   * (2) There is no player time records, there is a current player and the turn is paused
 *   * (3) There is no player time records, there is a current player and the turn is ongoing
 *   * (4) There are player time records, there is a current player and the turn is paused
 *   * (5) There are player time records, there is a current player and the turn is ongoing
 *   * (6) No data in DB
 *
 * @param {string} userId            Alexa user id
 * @returns { { [string]: number } } A mapping of player colors to their total time
 */
async function getAllPlayersTotalTime(userId) {
  const state = await AppStateModel.getByUserId(userId)

  if (!state || !state.state || state.state === APP_STATE_NEW_GAME) { // (1), (6)
    return null
  } else { // (2) through (4)
    const totalTimes = { ...state.playerTimes }
    if (state.state === APP_STATE_TURN_PAUSED) { // (2), (4)
      const currentPlayerTotalTime = state.currentPlayerTotalTime
      totalTimes[state.currentPlayer] = currentPlayerTotalTime +
        (totalTimes[state.currentPlayer] || 0) // could be undefined; undefined + 0 = NaN
    } else if (state.state === APP_STATE_TURN_ONGOING) { // (3), (5)
      const time = Date.now()
      const currentPlayerTotalTime = state.currentPlayerTotalTime
      totalTimes[state.currentPlayer] = currentPlayerTotalTime +
        (time - state.currentPlayerStartTime) +
        (totalTimes[state.currentPlayer] || 0)
    } else {
      throw new Error(`getAllPlayersTotalTime: unknown state ${state.state}`)
    }
    return totalTimes
  }
}

/**
 * Describes what is the current game state
 *
 * Variants:
 *   * (1) no current player, new game
 *   * (2) there is current player, either turn is ongoing, or paused
 *   * (3) no data in DB
 *
 * @param {string} userId                                Alexa user id
 * @returns { { state: string, currentPlayer: string } } Description of a current game state
 */
async function describeCurrentState(userId) {
  const state = await AppStateModel.getByUserId(userId)

  if (state && state.state) { // (1), (2)
    return { state: state.state, currentPlayer: state.currentPlayer }
  } else { // (3)
    return { state: APP_STATE_NEW_GAME, currentPlayer: null }
  }
}

const AppStateModel = {
  // DO NOT USE DIRECTLY: expose this to stub in tests
  getByUserId,
  putByUserId,

  // Business logic methods
  markNewGame,
  markStartTurn,
  markPauseTurn,
  markContinueTurn,
  getPlayerTotalTime,
  getCurrentTurnTime,
  getAllPlayersTotalTime,
  describeCurrentState,
}

module.exports = AppStateModel
