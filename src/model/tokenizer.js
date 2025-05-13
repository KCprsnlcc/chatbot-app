/**
 * Tokenizer and vectorizer for the chatbot
 * Uses the vocabulary from vocabulary.json
 */

// We'll load the vocabulary dynamically
let vocabulary = [];
let intentLabels = [];

/**
 * Load vocabulary and intent labels from vocabulary.json
 * @returns {Promise<void>}
 */
export const loadVocabulary = async () => {
  try {
    const response = await fetch('/src/model/vocabulary.json');
    if (!response.ok) {
      // Try alternative path
      const altResponse = await fetch('/model/vocabulary.json');
      if (!altResponse.ok) {
        throw new Error(`Failed to load vocabulary: ${altResponse.status}`);
      }
      const data = await altResponse.json();
      vocabulary = data.vocabulary || [];
      intentLabels = data.tags || [];
    } else {
      const data = await response.json();
      vocabulary = data.vocabulary || [];
      intentLabels = data.tags || [];
    }
    
    console.log(`Loaded vocabulary with ${vocabulary.length} words and ${intentLabels.length} intents`);
    return { vocabulary, intentLabels };
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    throw new Error('Failed to load vocabulary data');
  }
};

/**
 * Preprocess text by removing punctuation, converting to lowercase, etc.
 * @param {string} text - The input text to preprocess
 * @returns {string[]} Array of preprocessed tokens
 */
export const preprocessText = (text) => {
  // Convert to lowercase
  const lowercaseText = text.toLowerCase();
  
  // Remove punctuation and special characters
  const cleanText = lowercaseText.replace(/[^\w\s']/gi, '');
  
  // Split into words
  return cleanText.split(/\s+/).filter(token => token.length > 0);
};

/**
 * Convert text to a bag-of-words vector
 * @param {string} text - The input text
 * @param {string[]} [customVocabulary] - Optional custom vocabulary to use
 * @returns {number[]} The bag-of-words vector
 */
export const vectorizeText = (text, customVocabulary = null) => {
  const tokens = preprocessText(text);
  const vocabToUse = customVocabulary || vocabulary;
  
  // Initialize vector with zeros
  const vector = new Array(vocabToUse.length).fill(0);
  
  // Count occurrences of each word in the vocabulary
  for (const token of tokens) {
    const index = vocabToUse.indexOf(token);
    if (index !== -1) {
      vector[index] = 1; // Use binary representation (presence/absence) instead of count
    }
  }
  
  return vector;
};

/**
 * Get the intent label from the predicted probabilities
 * @param {number[]} probabilities - Array of probabilities for each intent
 * @param {string[]} [customLabels] - Optional custom intent labels to use
 * @returns {string} The predicted intent label
 */
export const getIntentLabel = (probabilities, customLabels = null) => {
  const labelsToUse = customLabels || intentLabels;
  
  // Find the index of the highest probability
  const maxIndex = probabilities.indexOf(Math.max(...probabilities));
  
  // Return the corresponding intent label
  return labelsToUse[maxIndex] || "unknown";
}; 