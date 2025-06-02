/**
 * Ollama service for integrating with local Ollama models
 */
import axios from 'axios';

// Default Ollama server URL
const OLLAMA_BASE_URL = 'http://localhost:11434';

// Default model for intent classification
const DEFAULT_INTENT_MODEL = 'llama3';

/**
 * Class for interfacing with Ollama API
 */
class OllamaService {
  constructor(baseUrl = OLLAMA_BASE_URL) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get list of available models from Ollama
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      throw new Error('Failed to fetch available models from Ollama');
    }
  }

  /**
   * Check if Ollama server is running
   * @returns {Promise<boolean>} True if server is running
   */
  async isServerRunning() {
    try {
      await this.client.get('/api/tags');
      return true;
    } catch (error) {
      console.error('Ollama server is not running:', error);
      return false;
    }
  }

  /**
   * Classify intent using the default intent classification model
   * @param {string} text - Input text to classify
   * @returns {Promise<string>} Classified intent
   */
  async classifyIntent(text) {
    try {
      const response = await this.client.post('/api/generate', {
        model: DEFAULT_INTENT_MODEL,
        prompt: `You are an intent classifier. Your task is to classify the following text into exactly one of these intents: greeting, farewell, help, information, weather, time, date, joke, question, compliment, other.

Text: "${text}"

You must respond with ONLY the intent label and nothing else. For example, if the text is a greeting, respond with just the word "greeting".

Intent:`,
        stream: false,
      });
      
      // Clean up response to get just the intent
      const intent = response.data.response.trim().toLowerCase();
      // Handle case where model outputs more than just the intent
      if (intent.includes("greeting")) return "greeting";
      if (intent.includes("farewell")) return "farewell";
      if (intent.includes("help")) return "help";
      if (intent.includes("information")) return "information";
      if (intent.includes("weather")) return "weather";
      if (intent.includes("time")) return "time";
      if (intent.includes("date")) return "date";
      if (intent.includes("joke")) return "joke";
      if (intent.includes("question")) return "question";
      if (intent.includes("compliment")) return "compliment";
      return "other";
    } catch (error) {
      console.error('Error classifying intent:', error);
      throw new Error('Failed to classify intent using Ollama');
    }
  }

  /**
   * Generate response using selected model
   * @param {string} text - User input
   * @param {string} modelName - Name of model to use
   * @returns {Promise<string>} Generated response
   */
  async generateResponse(text, modelName) {
    try {
      const systemPrompt = `You are a helpful and friendly AI assistant in a chatbot application. 

Provide a helpful, concise, and conversational response to the user's message. 
Keep your responses natural, friendly, and to the point. If you don't know something, be honest about it.

User's message: `;
      
      const response = await this.client.post('/api/generate', {
        model: modelName,
        prompt: `${systemPrompt}"${text}"

Your response:`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 200
        }
      });
      
      // Clean up the response
      let cleanResponse = response.data.response.trim();
      
      // Remove common prefixes that models sometimes add
      const prefixesToRemove = [
        'I\'ll respond to that:', 
        'Here\'s my response:', 
        'My response:', 
        'Response:', 
        'Assistant:', 
      ];
      
      for (const prefix of prefixesToRemove) {
        if (cleanResponse.startsWith(prefix)) {
          cleanResponse = cleanResponse.substring(prefix.length).trim();
        }
      }
      
      return cleanResponse;
    } catch (error) {
      console.error(`Error generating response with model ${modelName}:`, error);
      throw new Error(`Failed to generate response using ${modelName}`);
    }
  }
}

// Create singleton instance
const ollamaService = new OllamaService();

export default ollamaService;
