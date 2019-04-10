const freeze = require('deep-freeze')
const { AppStateModel } = require('../')
const {
  APP_STATE_PAUSED,
  APP_STATE_PLAYER_TURN,
} = require('../../constants')

// NOTE: we freeze all objects to prevent subtle bugs in tests
// when previous state is modified to match the desired one
const NEW_GAME_STATE = freeze({
  currentPlayer: '',
  currentPlayerStartTime: 0,
  currentPlayerTotalTime: 0,
  playerTimes: {},
  state: APP_STATE_PAUSED,
})
const USER_ID = 'testuserid'
const PLAYER_COLOR_RED = 'red'
const PLAYER_COLOR_GREEN = 'green'

const originalDateNow = () => Date.now()

describe('`AppStateModel`', () => {
  beforeEach(() => {
    // Guards to prevent accidently calling DB
    AppStateModel.getByUserId = () => Promise.resolve({})
    AppStateModel.putByUserId = () => Promise.resolve()
    // Stub it so timestamp does not change between calls
    const DATE_NOW = Date.now()
    Date.now = () => DATE_NOW
  })

  describe('`markNewGame` call', () => {
    it('produces a valid new game state on an empty state', (done) => {
      const oldState = undefined
      AppStateModel.getByUserId = () => Promise.resolve(oldState)
      AppStateModel.putByUserId = (_userId, state) => {
        expect(_userId).toEqual(USER_ID)
        expect(state).toEqual(NEW_GAME_STATE)
        done()
      }
      AppStateModel.markNewGame(USER_ID)
    })

    it('produces a valid new game state on a non-empty state', (done) => {
      const oldState = freeze({
        currentPlayer: 'red',
        currentPlayerStartTime: Date.now() - 10000,
        currentPlayerTotalTime: 100000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 200000,
          [PLAYER_COLOR_GREEN]: 150000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(oldState)
      AppStateModel.putByUserId = (_userId, state) => {
        expect(_userId).toEqual(USER_ID)
        expect(state).toEqual(NEW_GAME_STATE)
        done()
      }
      AppStateModel.markNewGame(USER_ID)
    })
  })

  describe('`markPlayerColorTurnStart` call', () => {
    it('produces a valid game state on an empty state (5)', (done) => {
      const newState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now(),
        currentPlayerTotalTime: 0,
        playerTimes: {},
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(undefined)
      AppStateModel.putByUserId = (_userId, state) => {
        expect(_userId).toEqual(USER_ID)
        expect(state).toEqual(newState)
        done()
      }
      AppStateModel.markPlayerColorTurnStart(USER_ID, PLAYER_COLOR_RED)
    })

    it('produces a valid game state on a new game state (5)', (done) => {
      const newState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now(),
        currentPlayerTotalTime: 0,
        playerTimes: {},
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(NEW_GAME_STATE)
      AppStateModel.putByUserId = (_userId, state) => {
        expect(_userId).toEqual(USER_ID)
        expect(state).toEqual(newState)
        done()
      }
      AppStateModel.markPlayerColorTurnStart(USER_ID, PLAYER_COLOR_RED)
    })

    it('does nothing if same player color and the current turn is ongoing (1)', (done) => {
      const oldState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now(),
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(oldState)
      const putFn = AppStateModel.putByUserId = jest.fn()
      AppStateModel.markPlayerColorTurnStart(USER_ID, PLAYER_COLOR_RED).then(() => {
        expect(putFn).not.toHaveBeenCalled()
        done()
      })
    })

    it('continues turn if same color and the current turn is paused (2)', (done) => {
      const oldState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: 0,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PAUSED,
      })
      const newState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now(),
        currentPlayerTotalTime: oldState.currentPlayerTotalTime,
        playerTimes: oldState.playerTimes,
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(oldState)
      AppStateModel.putByUserId = (_userId, state) => {
        expect(_userId).toEqual(USER_ID)
        expect(state).toEqual(newState)
        done()
      }
      AppStateModel.markPlayerColorTurnStart(USER_ID, PLAYER_COLOR_RED)
    })

    it('continues turn if a different player color and the current turn is ongoing (3)', (done) => {
      const deltaTime = 10000
      const oldState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now() - deltaTime,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      const newState = freeze({
        currentPlayer: PLAYER_COLOR_GREEN,
        currentPlayerStartTime: Date.now(),
        currentPlayerTotalTime: 0,
        playerTimes: {
          [PLAYER_COLOR_RED]:
            oldState.playerTimes[PLAYER_COLOR_RED] +
            oldState.currentPlayerTotalTime +
            deltaTime,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(oldState)
      AppStateModel.putByUserId = (_userId, state) => {
        expect(_userId).toEqual(USER_ID)
        expect(state).toEqual(newState)
        done()
      }
      AppStateModel.markPlayerColorTurnStart(USER_ID, PLAYER_COLOR_GREEN)
    })

    it('continues turn if a different player color and the current turn is paused (4)', (done) => {
      const oldState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: 0,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PAUSED,
      })
      const newState = freeze({
        currentPlayer: PLAYER_COLOR_GREEN,
        currentPlayerStartTime: Date.now(),
        currentPlayerTotalTime: 0,
        playerTimes: {
          [PLAYER_COLOR_RED]:
            oldState.playerTimes[PLAYER_COLOR_RED] +
            oldState.currentPlayerTotalTime,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(oldState)
      AppStateModel.putByUserId = (_userId, state) => {
        expect(_userId).toEqual(USER_ID)
        expect(state).toEqual(newState)
        done()
      }
      AppStateModel.markPlayerColorTurnStart(USER_ID, PLAYER_COLOR_GREEN)
    })
  })

  describe('`markCurrentPlayerTurnPause` call', () => {
    it('produces a valid new game state on an empty state (3)', (done) => {
      const oldState = undefined
      AppStateModel.getByUserId = () => Promise.resolve(oldState)
      AppStateModel.putByUserId = (_userId, state) => {
        expect(_userId).toEqual(USER_ID)
        expect(state).toEqual(NEW_GAME_STATE)
        done()
      }
      AppStateModel.markCurrentPlayerTurnPause(USER_ID)
    })

    it('does nothing on a new game state (2,3)', (done) => {
      AppStateModel.getByUserId = () => Promise.resolve(NEW_GAME_STATE)
      const putFn = AppStateModel.putByUserId = jest.fn()
      AppStateModel.markCurrentPlayerTurnPause(USER_ID, PLAYER_COLOR_RED).then(() => {
        expect(putFn).not.toHaveBeenCalled()
        done()
      })
    })

    it('does nothing when the current turn is already paused (2)', (done) => {
      const oldState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: 0,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PAUSED,
      })
      AppStateModel.getByUserId = () => Promise.resolve(oldState)
      const putFn = AppStateModel.putByUserId = jest.fn()
      AppStateModel.markCurrentPlayerTurnPause(USER_ID, PLAYER_COLOR_RED).then(() => {
        expect(putFn).not.toHaveBeenCalled()
        done()
      })
    })

    it('pauses current turn when it is ongoing (1)', (done) => {
      const deltaTime = 10000
      const oldState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now() - deltaTime,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      const newState = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: 0,
        currentPlayerTotalTime: oldState.currentPlayerTotalTime + deltaTime,
        playerTimes: oldState.playerTimes,
        state: APP_STATE_PAUSED,
      })
      AppStateModel.getByUserId = () => Promise.resolve(oldState)
      AppStateModel.putByUserId = (_userId, state) => {
        expect(_userId).toEqual(USER_ID)
        expect(state).toEqual(newState)
        done()
      }
      AppStateModel.markCurrentPlayerTurnPause(USER_ID)
    })
  })

  describe('`getPlayerTotalTurnTime` call', () => {
    it('returns `null` on an empty state (4)', (done) => {
      AppStateModel.getByUserId = () => Promise.resolve(undefined)
      AppStateModel.getPlayerTotalTurnTime(USER_ID, PLAYER_COLOR_RED).then((time) => {
        expect(time).toBe(null)
        done()
      })
    })

    it('returns `null` on a new game state (4)', (done) => {
      AppStateModel.getByUserId = () => Promise.resolve(NEW_GAME_STATE)
      AppStateModel.getPlayerTotalTurnTime(USER_ID, PLAYER_COLOR_RED).then((time) => {
        expect(time).toBe(null)
        done()
      })
    })

    it('returns valid time when a current user is not the specified one and the current turn is ongoing (1)', (done) => {
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now() - 10000,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getPlayerTotalTurnTime(USER_ID, PLAYER_COLOR_GREEN).then((time) => {
        expect(time).toBe(state.playerTimes[PLAYER_COLOR_GREEN])
        done()
      })
    })

    it('returns valid time when a current user is not the specified one and the current turn is paused (1)', (done) => {
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: 0,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PAUSED,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getPlayerTotalTurnTime(USER_ID, PLAYER_COLOR_GREEN).then((time) => {
        expect(time).toBe(state.playerTimes[PLAYER_COLOR_GREEN])
        done()
      })
    })

    it('returns valid time when a current user is the specified one and the current turn is ongoing (2)', (done) => {
      const deltaTime = 10000
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now() - deltaTime,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getPlayerTotalTurnTime(USER_ID, PLAYER_COLOR_RED).then((time) => {
        expect(time).toBe(state.playerTimes[PLAYER_COLOR_RED] + state.currentPlayerTotalTime + deltaTime)
        done()
      })
    })

    it('returns valid time when a current user is the specified one and the current turn is paused (3)', (done) => {
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: 0,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PAUSED,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getPlayerTotalTurnTime(USER_ID, PLAYER_COLOR_RED).then((time) => {
        expect(time).toBe(state.playerTimes[PLAYER_COLOR_RED] + state.currentPlayerTotalTime)
        done()
      })
    })
  })

  describe('`getCurrentTurnTime` call', () => {
    it('returns `null` on an empty state (1)', (done) => {
      AppStateModel.getByUserId = () => Promise.resolve(undefined)
      AppStateModel.getCurrentTurnTime(USER_ID).then((time) => {
        expect(time).toBe(null)
        done()
      })
    })

    it('returns `null` on a new game state (1)', (done) => {
      AppStateModel.getByUserId = () => Promise.resolve(NEW_GAME_STATE)
      AppStateModel.getCurrentTurnTime(USER_ID).then((time) => {
        expect(time).toBe(null)
        done()
      })
    })

    it('returns valid time when the current turn is ongoing (3)', (done) => {
      const deltaTime = 10000
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now() - deltaTime,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getCurrentTurnTime(USER_ID).then((time) => {
        expect(time).toBe(state.currentPlayerTotalTime + deltaTime)
        done()
      })
    })

    it('returns valid time when the current turn is paused (2)', (done) => {
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: 0,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PAUSED,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getCurrentTurnTime(USER_ID).then((time) => {
        expect(time).toBe(state.currentPlayerTotalTime)
        done()
      })
    })
  })

  describe('`getAllPlayersTotalTurnTime` call', () => {
    it('returns `null` on an empty state (1)', (done) => {
      AppStateModel.getByUserId = () => Promise.resolve(undefined)
      AppStateModel.getAllPlayersTotalTurnTime(USER_ID).then((times) => {
        expect(times).toBe(null)
        done()
      })
    })

    it('returns `null` on a new game state (1)', (done) => {
      AppStateModel.getByUserId = () => Promise.resolve(NEW_GAME_STATE)
      AppStateModel.getAllPlayersTotalTurnTime(USER_ID).then((times) => {
        expect(times).toBe(null)
        done()
      })
    })

    it('returns valid time when there are no time records and the current turn is paused (2)', (done) => {
      const deltaTime = 10000
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now() - deltaTime,
        currentPlayerTotalTime: 35000,
        playerTimes: {},
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getAllPlayersTotalTurnTime(USER_ID).then((times) => {
        expect(times).toEqual({
          [PLAYER_COLOR_RED]: state.currentPlayerTotalTime + deltaTime,
        })
        done()
      })
    })

    it('returns valid time when there are no time records and the current turn is ongoing (2)', (done) => {
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: 0,
        currentPlayerTotalTime: 35000,
        playerTimes: {},
        state: APP_STATE_PAUSED,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getAllPlayersTotalTurnTime(USER_ID).then((times) => {
        expect(times).toEqual({
          [PLAYER_COLOR_RED]: state.currentPlayerTotalTime,
        })
        done()
      })
    })

    it('returns valid time when the current turn is ongoing (3)', (done) => {
      const deltaTime = 10000
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: Date.now() - deltaTime,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PLAYER_TURN,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getAllPlayersTotalTurnTime(USER_ID).then((times) => {
        expect(times).toEqual({
          [PLAYER_COLOR_RED]: state.playerTimes[PLAYER_COLOR_RED] + state.currentPlayerTotalTime + deltaTime,
          [PLAYER_COLOR_GREEN]: state.playerTimes[PLAYER_COLOR_GREEN],
        })
        done()
      })
    })

    it('returns valid time when the current turn is paused (2)', (done) => {
      const state = freeze({
        currentPlayer: PLAYER_COLOR_RED,
        currentPlayerStartTime: 0,
        currentPlayerTotalTime: 35000,
        playerTimes: {
          [PLAYER_COLOR_RED]: 90000,
          [PLAYER_COLOR_GREEN]: 135000,
        },
        state: APP_STATE_PAUSED,
      })
      AppStateModel.getByUserId = () => Promise.resolve(state)
      AppStateModel.getAllPlayersTotalTurnTime(USER_ID).then((times) => {
        expect(times).toEqual({
          [PLAYER_COLOR_RED]: state.playerTimes[PLAYER_COLOR_RED] + state.currentPlayerTotalTime,
          [PLAYER_COLOR_GREEN]: state.playerTimes[PLAYER_COLOR_GREEN],
        })
        done()
      })
    })
  })
})
