const { INTENT_REQUEST } = require('./constants')

/**
 * Factory for the `canHandle` function of a request handler
 * Produces a check that compares the request type with specified
 * @param {string} requestType
 */
function canHandleRequest(requestType) {
  return function (handlerInput) {
    return handlerInput.requestEnvelope.request.type === requestType;
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
        handlerInput.requestEnvelope.request.intent.name === intentName);
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

module.exports = {
  canHandleRequest,
  canHandleIntentRequest,

  getUserId,
  getSlots,
}
