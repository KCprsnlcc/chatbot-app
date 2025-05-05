/**
 * Simple bag-of-words vectorizer with a predefined vocabulary
 */

// Vocabulary of known words (this should match your training vocabulary)
const vocabulary = [
  "hello", "hi", "hey", "greetings", "morning", "afternoon", "evening",
  "goodbye", "bye", "see", "later", "talk", "soon",
  "thanks", "thank", "you", "appreciate", "grateful",
  "help", "support", "problem", "issue", "question", "assist",
  "weather", "temperature", "forecast", "rain", "sunny", "cloudy",
  "name", "who", "are", "what", "your", "called",
  "joke", "funny", "laugh", "humor", "tell",
  "how", "going", "doing", "feel", "feeling"
];

/**
 * Preprocess text by removing punctuation, converting to lowercase, etc.
 * @param {string} text - The input text to preprocess
 * @returns {string[]} Array of preprocessed tokens
 */
export const preprocessText = (text) => {
  // Convert to lowercase
  const lowercaseText = text.toLowerCase();
  
  // Remove punctuation and special characters
  const cleanText = lowercaseText.replace(/[^\w\s]/gi, '');
  
  // Split into words
  return cleanText.split(/\s+/).filter(token => token.length > 0);
};

/**
 * Convert text to a bag-of-words vector
 * @param {string} text - The input text
 * @returns {number[]} The bag-of-words vector
 */
export const vectorizeText = (text) => {
  const tokens = preprocessText(text);
  
  // Initialize vector with zeros
  const vector = new Array(vocabulary.length).fill(0);
  
  // Count occurrences of each word in the vocabulary
  for (const token of tokens) {
    const index = vocabulary.indexOf(token);
    if (index !== -1) {
      vector[index] += 1;
    }
  }
  
  return vector;
};

/**
 * Get the intent label from the predicted probabilities
 * @param {number[]} probabilities - Array of probabilities for each intent
 * @returns {string} The predicted intent label
 */
export const getIntentLabel = (probabilities) => {
  // Map of intent indices to labels (must match your training model)
  const intentLabels = [
    "greeting",
    "goodbye",
    "thanks",
    "help",
    "weather",
    "name",
    "joke",
    "how_are_you",
    "unknown"
  ];
  
  // Find the index of the highest probability
  const maxIndex = probabilities.indexOf(Math.max(...probabilities));
  
  // Return the corresponding intent label
  return intentLabels[maxIndex] || "unknown";
}; 