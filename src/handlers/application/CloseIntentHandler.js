const {
  CANCEL_INTENT,
  NAVIGATE_HOME_INTENT,
  STOP_INTENT,
} = require('../../constants')
const {
  canHandleIntentRequest,
  speak,
} = require('../../utils')

const PauseTurnIntentHandler = {
  canHandle: canHandleIntentRequest(CANCEL_INTENT, NAVIGATE_HOME_INTENT, STOP_INTENT),

  async handle(handlerInput) {
    const speechText = `Goodbye!`
    return speak(handlerInput, speechText)
  }
}

module.exports = PauseTurnIntentHandler
