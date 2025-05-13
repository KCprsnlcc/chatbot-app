/**
 * Tokenizer and vectorizer for the chatbot
 * Uses the vocabulary from vocabulary.json
 */

// We'll load the vocabulary dynamically
let vocabulary = [];
let intentLabels = [];

// Fallback vocabulary and intents in case loading fails
const fallbackVocabulary = ["hello", "hi", "hey", "goodbye", "bye", "thanks", "thank", "you", "help", "question", "what", "how", "when", "where", "why", "who", "is", "are", "can", "do", "name", "your", "my", "me", "i", "am", "need", "want", "please", "sorry"];
const fallbackIntentLabels = ["greeting", "goodbye", "thanks", "help", "unknown"];

/**
 * Load vocabulary and intent labels from vocabulary.json
 * @returns {Promise<Object>}
 */
export const loadVocabulary = async () => {
  try {
    // Try multiple paths for vocabulary.json
    const vocabPaths = [
      '/src/model/vocabulary.json',
      '/model/vocabulary.json',
      '/public/model/vocabulary.json',
      '/vocabulary.json'
    ];
    
    let data = null;
    
    for (const path of vocabPaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          console.log(`Successfully loaded vocabulary from: ${path}`);
          data = await response.json();
          break;
        }
      } catch (pathError) {
        console.warn(`Failed to load vocabulary from ${path}: ${pathError.message}`);
      }
    }
    
    if (!data) {
      console.warn('Using fallback vocabulary');
      vocabulary = fallbackVocabulary;
      intentLabels = fallbackIntentLabels;
      return { vocabulary: fallbackVocabulary, tags: fallbackIntentLabels, input_shape: fallbackVocabulary.length };
    }
    
    vocabulary = data.vocabulary || [];
    intentLabels = data.tags || [];
    
    console.log(`Loaded vocabulary with ${vocabulary.length} words and ${intentLabels.length} intents`);
    return data;
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    console.warn('Using fallback vocabulary');
    vocabulary = fallbackVocabulary;
    intentLabels = fallbackIntentLabels;
    return { vocabulary: fallbackVocabulary, tags: fallbackIntentLabels, input_shape: fallbackVocabulary.length };
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
 * Calculate similarity between two strings
 * @param {string} str1 - First string to compare
 * @param {string} str2 - Second string to compare
 * @returns {number} Similarity score between 0 and 1
 */
export const calculateStringSimilarity = (str1, str2) => {
  // Preprocess both strings
  const tokens1 = preprocessText(str1);
  const tokens2 = preprocessText(str2);
  
  // If either string is empty, return 0
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  // Check for exact match first
  if (str1.toLowerCase().trim() === str2.toLowerCase().trim()) {
    return 1.0;
  }
  
  // Count matching words
  let matchCount = 0;
  for (const token of tokens1) {
    if (tokens2.includes(token)) {
      matchCount++;
    }
  }
  
  // Calculate Jaccard similarity (intersection over union)
  const uniqueWords = new Set([...tokens1, ...tokens2]);
  const jaccardSimilarity = matchCount / uniqueWords.size;
  
  // Calculate word coverage (how many words from the pattern are in the input)
  // This helps with matching when the user input is longer than the pattern
  let patternCoverage = 0;
  for (const token of tokens2) { // tokens2 is the pattern
    if (tokens1.includes(token)) {
      patternCoverage++;
    }
  }
  const coverageScore = tokens2.length > 0 ? patternCoverage / tokens2.length : 0;
  
  // Combine scores with more weight on pattern coverage
  return (jaccardSimilarity * 0.4) + (coverageScore * 0.6);
};

/**
 * Find the best matching pattern for a given input
 * @param {string} input - User input text
 * @param {Array<{tag: string, patterns: string[]}>} intents - Array of intent objects
 * @returns {{tag: string, similarity: number}} The best matching intent tag and similarity score
 */
export const findBestMatchingIntent = (input, intents) => {
  if (!input || !intents || intents.length === 0) {
    return { tag: 'unknown', similarity: 0 };
  }
  
  let bestMatch = { tag: 'unknown', similarity: 0 };
  
  for (const intent of intents) {
    for (const pattern of intent.patterns || []) {
      const similarity = calculateStringSimilarity(input, pattern);
      
      // If this pattern is a better match, update bestMatch
      if (similarity > bestMatch.similarity) {
        bestMatch = { tag: intent.tag, similarity: similarity };
      }
    }
  }
  
  return bestMatch;
};

/**
 * Vectorize input text into a bag-of-words representation
 * @param {string} text - The input text to vectorize
 * @returns {number[]} A vector representation of the input text
 */
export const vectorizeText = (text) => {
  // If vocabulary is not loaded yet, return empty vector
  if (!vocabulary || vocabulary.length === 0) {
    console.error('Vocabulary not loaded, returning zero vector');
    return new Array(30).fill(0); // Return a zero vector of reasonable size
  }
  
  // Preprocess the text
  const tokens = preprocessText(text);
  
  // Create a zero vector with the size of our vocabulary
  const vector = new Array(vocabulary.length).fill(0);
  
  // For each token in the input text, set the corresponding index to 1
  tokens.forEach(token => {
    const index = vocabulary.indexOf(token);
    if (index !== -1) {
      vector[index] = 1;
    }
  });
  
  return vector;
};

/**
 * Get the intent label from the predicted probabilities
 * @param {number[]} probabilities - Array of probabilities for each intent
 * @param {string[]} [customLabels] - Optional custom intent labels to use
 * @returns {string} The predicted intent label
 */
export const getIntentLabel = (probabilities, customLabels = null) => {
  const labelsToUse = customLabels || intentLabels || fallbackIntentLabels;
  
  // If no probabilities or labels, return unknown
  if (!probabilities || !labelsToUse || probabilities.length === 0 || labelsToUse.length === 0) {
    return "unknown";
  }
  
  // Find the index of the highest probability
  const maxIndex = probabilities.indexOf(Math.max(...probabilities));
  
  // Return the corresponding intent label, or unknown if index is invalid
  return (maxIndex >= 0 && maxIndex < labelsToUse.length) 
    ? labelsToUse[maxIndex] 
    : "unknown";
}; 