/**
 * Response handler for the chatbot
 * Loads responses from intents.json
 */

// Initialize responses object
let responses = {};

/**
 * Load responses from intents.json
 * @returns {Promise<Object>} The loaded responses
 */
export const loadResponses = async () => {
  try {
    // Try multiple possible paths for intents.json
    let data = null;
    let response = null;
    
    // Try paths in order of likelihood
    const paths = [
      '/data/intents.json',
      '/src/data/intents.json',
      '/public/data/intents.json',
      '/intents.json'
    ];
    
    for (const path of paths) {
      try {
        response = await fetch(path);
        if (response.ok) {
          console.log(`Successfully loaded intents from: ${path}`);
          data = await response.json();
          break;
        }
      } catch (pathError) {
        console.warn(`Failed to load intents from ${path}: ${pathError.message}`);
      }
    }
    
    if (!data) {
      throw new Error('Failed to load intents from any path');
    }
    
    // Convert the intents array to a map of tag -> responses
    responses = data.intents.reduce((acc, intent) => {
      acc[intent.tag] = intent.responses;
      return acc;
    }, {});
    
    // Add a fallback for unknown intents
    if (!responses.unknown) {
      responses.unknown = [
        "I'm not sure I understand. Could you rephrase that?",
        "I didn't quite catch that. Can you try again?",
        "I'm still learning! Could you say that differently?",
        "I'm not sure how to respond to that. Can you try asking something else?"
      ];
    }
    
    console.log(`Loaded responses for ${Object.keys(responses).length} intents`);
    return responses;
  } catch (error) {
    console.error('Error loading responses:', error);
    
    // Fallback to basic responses if loading fails
    responses = {
      "greeting": [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?"
      ],
      "goodbye": [
        "Goodbye! Have a great day!",
        "See you later! Take care!"
      ],
      "unknown": [
        "I'm not sure I understand. Could you rephrase that?",
        "I didn't quite catch that. Can you try again?"
      ]
    };
    
    return responses;
  }
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