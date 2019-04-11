const { INTENT_REQUEST } = require('./constants')
const humanizeDuration = require('humanize-duration')

/**
 * Factory for the `canHandle` function of a request handler
 * Produces a check that compares the request type with specified
 * @param {string} requestType
 */
function canHandleRequest(requestType) {
  return function (handlerInput) {
    return handlerInput.requestEnvelope.request.type === requestType
  }
}

/**
 * Factory for the `canHandle` function of an intent handler
 * Produces a check that compares the request type with 'IntentRequest'
 * and intent names with a specified array of intent names
 * @param {Array<string>} intentNames
 */
function canHandleIntentRequest(...intentNames) {
  const checkCanHandleRequest = canHandleRequest(INTENT_REQUEST)
  return function (handlerInput) {
    return checkCanHandleRequest(handlerInput)
      && intentNames.some(intentName =>
        handlerInput.requestEnvelope.request.intent.name === intentName)
  }
}

/**
 * Get userId from HandlerInput
 * @param handlerInput
 */
function getUserId(handlerInput) {
  return handlerInput.requestEnvelope.session.user.userId
}

/**
 * Get slot to slot value map from HandlerInput
 * @param handlerInput
 */
function getSlots(handlerInput) {
  const slots = handlerInput.requestEnvelope.request.intent.slots
  if (!slots) return []
  return Object.keys(slots).reduce((acc, key) => {
    acc[key] = slots[key].value
    return acc
  }, {})
}

/**
 * Convert milliseconds to a human-understanable time interval string
 *
 * @param {number} ms The number of milliseconds to convert to an interval
 * @returns {string} A time interval string
 */
function msToHuman(ms) {
  // strip milliseconds
  const interval = Math.round(ms / 1000) * 1000
  return humanizeDuration(
    interval,
    {
      largest: 2,
      delimiter: ' and ',
      units: [ 'h', 'm', 's' ],
      round: true,
      language: 'en',
      fallbacks: [ 'en' ],
    }
  )
}

module.exports = {
  canHandleRequest,
  canHandleIntentRequest,

  getUserId,
  getSlots,
  msToHuman,
}
