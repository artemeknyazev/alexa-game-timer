const ErrorHandler = {
  canHandle() {
    return true
  },

  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.message}`) // eslint-disable-line no-console
    const speechText = `Sorry, I couldn't understand what you said. Please try again.`

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  }
}

module.exports = ErrorHandler
