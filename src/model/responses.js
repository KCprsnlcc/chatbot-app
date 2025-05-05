/**
 * Map of intent labels to possible responses
 * Each intent has an array of potential responses, one of which is randomly selected
 */
const responses = {
  "greeting": [
    "Hello! How can I help you today?",
    "Hi there! What can I do for you?",
    "Greetings! How may I assist you?",
    "Hello! It's nice to see you!"
  ],
  
  "goodbye": [
    "Goodbye! Have a great day!",
    "See you later! Take care!",
    "Bye for now! Feel free to chat again anytime.",
    "Farewell! It was nice chatting with you."
  ],
  
  "thanks": [
    "You're welcome! Is there anything else I can help with?",
    "Happy to help! Let me know if you need anything else.",
    "Anytime! Don't hesitate if you have more questions.",
    "Glad I could assist! Anything else you'd like to know?"
  ],
  
  "help": [
    "I'm here to help! What do you need assistance with?",
    "I'd be happy to help. Could you tell me more about what you need?",
    "How can I assist you today? Please provide some details.",
    "I'm at your service! What kind of help are you looking for?"
  ],
  
  "weather": [
    "I don't have access to real-time weather data. You might want to check a weather service for that information.",
    "I can't check the weather for you, but a quick online search should give you that information.",
    "Unfortunately, I don't have weather capabilities at the moment.",
    "I'm not connected to weather services, but I'd be happy to help with something else!"
  ],
  
  "name": [
    "I'm ChatBot, your friendly AI assistant!",
    "My name is ChatBot. What can I call you?",
    "I go by ChatBot. What's your name?",
    "I'm ChatBot, built to make conversations more engaging!"
  ],
  
  "joke": [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "What did one wall say to the other wall? I'll meet you at the corner!",
    "How does a penguin build its house? Igloos it together!"
  ],
  
  "how_are_you": [
    "I'm doing well, thanks for asking! How about you?",
    "I'm great! How are you feeling today?",
    "All systems operational! How's your day going?",
    "I'm good! Thanks for checking in. How are you?"
  ],
  
  "unknown": [
    "I'm not sure I understand. Could you rephrase that?",
    "I didn't quite catch that. Can you try again?",
    "I'm still learning! Could you say that differently?",
    "I'm not sure how to respond to that. Can you try asking something else?"
  ]
};

/**
 * Get a random response for a given intent
 * @param {string} intent - The intent label
 * @returns {string} A randomly selected response for the intent
 */
export const getResponse = (intent) => {
  // Get the array of possible responses for the intent
  const possibleResponses = responses[intent] || responses.unknown;
  
  // Select a random response from the array
  const randomIndex = Math.floor(Math.random() * possibleResponses.length);
  return possibleResponses[randomIndex];
}; 