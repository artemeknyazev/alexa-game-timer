const { INTENT_REQUEST } = require('../../constants')
const { canHandleRequest } = require('../../utils')

const DebugHandler = {
  canHandle: canHandleRequest(INTENT_REQUEST),

  handle(handlerInput) {
    const intentName = handlerInput.requestEnvelope.request.intent.name
    const speechText = `You just triggered ${intentName}`

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  }
}

module.exports = DebugHandler
