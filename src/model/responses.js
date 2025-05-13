/**
 * Response handler for the chatbot
 * Loads responses from intents.json
 */

import { findBestMatchingIntent } from './tokenizer';

// Initialize responses object
let responses = {};
// Store the full intents data
let intentsData = [];

// Default responses in case loading fails
const defaultResponses = {
  "greeting": [
    "Hello! How can I help you today?",
    "Hi there! What can I do for you?",
    "Greetings! How may I assist you?"
  ],
  "goodbye": [
    "Goodbye! Have a great day!",
    "See you later! Take care!",
    "Bye! Come back anytime you need help."
  ],
  "thanks": [
    "You're welcome!",
    "Happy to help!",
    "Anytime! That's what I'm here for."
  ],
  "help": [
    "I can help you with various topics. Just ask me a question!",
    "What would you like help with today?",
    "I'm here to assist you. What do you need?"
  ],
  "unknown": [
    "I'm not sure I understand. Could you rephrase that?",
    "I didn't quite catch that. Can you try again?",
    "I'm still learning! Could you say that differently?",
    "I'm not sure how to respond to that. Can you try asking something else?"
  ]
};

// Default patterns for basic intents
const defaultPatterns = {
  "greeting": ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"],
  "goodbye": ["bye", "goodbye", "see you", "talk to you later", "farewell"],
  "thanks": ["thanks", "thank you", "appreciate it", "thank you very much"],
  "help": ["help", "assist", "support", "need help", "can you help"]
};

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
      '/public/data/intents.json',
      'data/intents.json',
      '/src/data/intents.json',
      '/intents.json'
    ];
    
    for (const path of paths) {
      try {
        console.log(`Attempting to load intents from: ${path}`);
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
      console.warn('Failed to load intents from any path, using default responses');
      // Create default intents with patterns
      intentsData = Object.keys(defaultResponses).map(tag => ({
        tag,
        patterns: defaultPatterns[tag] || [],
        responses: defaultResponses[tag]
      }));
      
      // Convert to response map
      responses = defaultResponses;
      return { responses, intents: intentsData };
    }
    
    // Store the full intents data for pattern matching
    intentsData = data.intents || [];
    console.log(`Loaded ${intentsData.length} intents with patterns`);
    
    // Convert the intents array to a map of tag -> responses
    responses = data.intents.reduce((acc, intent) => {
      acc[intent.tag] = intent.responses;
      return acc;
    }, {});
    
    // Add a fallback for unknown intents if not present
    if (!responses.unknown) {
      responses.unknown = defaultResponses.unknown;
    }
    
    console.log(`Loaded responses for ${Object.keys(responses).length} intents`);
    return { responses, intents: intentsData };
  } catch (error) {
    console.error('Error loading responses:', error);
    
    // Fallback to basic responses if loading fails
    intentsData = Object.keys(defaultResponses).map(tag => ({
      tag,
      patterns: defaultPatterns[tag] || [],
      responses: defaultResponses[tag]
    }));
    
    responses = defaultResponses;
    return { responses, intents: intentsData };
  }
};

/**
 * Find the best intent match for user input using pattern matching
 * @param {string} userInput - The user's input text
 * @returns {string} The matched intent tag
 */
export const findIntent = (userInput) => {
  if (!userInput || userInput.trim() === '') {
    return 'unknown';
  }
  
  // Use the pattern matching function to find the best match
  const { tag, similarity } = findBestMatchingIntent(userInput, intentsData);
  
  // If the similarity is too low, return unknown
  if (similarity < 0.2) {
    console.log(`No good match found for "${userInput}". Best match was "${tag}" with similarity ${similarity}`);
    return 'unknown';
  }
  
  console.log(`Matched "${userInput}" to intent "${tag}" with similarity ${similarity}`);
  return tag;
};

/**
 * Get a response for user input
 * @param {string} userInput - The user's input text
 * @returns {string} A response based on the matched intent
 */
export const getResponseForInput = (userInput) => {
  const intent = findIntent(userInput);
  return getResponse(intent);
};

/**
 * Get a random response for a given intent
 * @param {string} intent - The intent label
 * @returns {string} A randomly selected response for the intent
 */
export const getResponse = (intent) => {
  // Get the array of possible responses for the intent
  const possibleResponses = responses[intent] || responses.unknown || defaultResponses.unknown;
  
  // Select a random response from the array
  const randomIndex = Math.floor(Math.random() * possibleResponses.length);
  return possibleResponses[randomIndex];
}; 