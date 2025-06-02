import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import './Chatbot.css';
import { loadModel, predictIntent } from '../model/loadModel';
import { vectorizeText, getIntentLabel, loadVocabulary } from '../model/tokenizer';
import { getResponse, loadResponses, getResponseForInput } from '../model/responses';
import ChatbotLogo from './ChatbotLogo';
import ModelSelector from './ModelSelector';
import ollamaService from '../services/ollama';

const Chatbot = () => {
  // State for chat messages
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true }
  ]);
  
  // UI state
  const [inputText, setInputText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Model state
  const [model, setModel] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [vocabularyLoaded, setVocabularyLoaded] = useState(false);
  const [responsesLoaded, setResponsesLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [intentsData, setIntentsData] = useState(null);
  
  // Ollama state
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [useOllama, setUseOllama] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Load all required data on component mount
  useEffect(() => {
    const initChatbot = async () => {
      setIsInitializing(true);
      let loadedModel = null;
      let vocabData = null;
      let responseData = null;
      
      try {
        // Load responses first as they're most important
        responseData = await loadResponses().catch(error => {
          console.error('Failed to load responses:', error);
          return null;
        });
        
        if (responseData) {
          setResponsesLoaded(true);
          setIntentsData(responseData.intents);
        }
        
        // Check if Ollama is available
        const isOllamaRunning = await ollamaService.isServerRunning().catch(error => {
          console.error('Error checking Ollama server:', error);
          return false;
        });

        setOllamaAvailable(isOllamaRunning);

        if (isOllamaRunning) {
          console.log('Ollama server is running!');
          
          // Try to get available models
          try {
            const models = await ollamaService.getAvailableModels();
            if (models.length > 0) {
              // Set default model for intent classification
              setSelectedModel(models[0].name);
              setUseOllama(true);
              console.log(`Using Ollama with default model: ${models[0].name}`);
            }
          } catch (error) {
            console.error('Error fetching Ollama models:', error);
          }
        } else {
          console.log('Ollama server is not running, falling back to TensorFlow.js model');
        }
        
        // Then try to load model and vocabulary in parallel (as fallback)
        [loadedModel, vocabData] = await Promise.all([
          loadModel().catch(error => {
            console.error('Failed to load model:', error);
            setModelError('I encountered an issue loading my AI model, but I can still help with pattern matching.');
            return null;
          }),
          loadVocabulary().catch(error => {
            console.error('Failed to load vocabulary:', error);
            return null;
          })
        ]);
        
        if (loadedModel) {
          setModel(loadedModel);
          setModelLoaded(true);
        }
        
        if (vocabData) {
          setVocabularyLoaded(true);
        }
        
        // Check if everything is loaded successfully
        if ((loadedModel && vocabData && responseData) || (isOllamaRunning && responseData)) {
          console.log('Chatbot initialized successfully!');
        } else if (responseData) {
          console.log('Chatbot initialized with pattern matching only!');
        } else {
          console.warn('Chatbot initialization failed');
          setModelError('Sorry, I had trouble initializing. Try refreshing the page.');
        }
      } catch (error) {
        console.error('Failed to initialize chatbot:', error);
        setModelError('Sorry, I had trouble initializing. Try refreshing the page.');
      } finally {
        setIsInitializing(false);
      }
    };
    
    initChatbot();
    
    // Check for dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };
  
  const clearChat = () => {
    setMessages([
      { id: 1, text: "Chat cleared. How can I help you?", isBot: true }
    ]);
  };
  
  // Add fallback responses when the model isn't working
  const fallbackResponses = [
    "I understood that you said: '{input}'. How can I help with that?",
    "You mentioned '{input}'. Could you tell me more?",
    "I'm processing '{input}'. What specifically would you like to know?",
    "I see you're asking about '{input}'. Let me try to assist.",
    "Thanks for saying '{input}'. How else can I help you today?"
  ];

  const getFallbackResponse = (input) => {
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex].replace('{input}', input);
  };

  // Handle model selection from the ModelSelector component
  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
    console.log(`Selected Ollama model: ${modelName}`);
  };

  // Toggle between Ollama and TensorFlow.js
  const toggleModelType = () => {
    const newUseOllama = !useOllama;
    setUseOllama(newUseOllama);
    
    // If switching to Ollama, make sure we have a proper greeting message
    if (newUseOllama && selectedModel) {
      // Update the first bot message to indicate we're using Ollama
      setMessages(msgs => [
        { 
          id: 1, 
          text: `Hello! I'm your AI assistant powered by ${selectedModel}. How can I help you today?`, 
          isBot: true 
        },
        ...msgs.slice(1)
      ]);
      console.log(`Switched to Ollama with model: ${selectedModel}`);
    } else {
      // Update the first bot message to indicate we're using TensorFlow.js
      setMessages(msgs => [
        { 
          id: 1, 
          text: "Hello! I'm your AI assistant. How can I help you today?", 
          isBot: true 
        },
        ...msgs.slice(1)
      ]);
      console.log('Switched to TensorFlow.js model');
    }
  };

  // Function to detect if text is likely code
  const isLikelyCode = (text) => {
    // Check for common code indicators
    const codeIndicators = [
      // Has import/require statements
      /\b(import|require|from)\b.*['"][\w\d\-_\/.@]+['"]/,
      // Has function declarations
      /\b(function|const|let|var|=>|class|if|for|while)\b/,
      // Has brackets, especially with indentation
      /[{[(\]\s*[\s\S]*?[}\])]/,
      // Has semicolons at end of lines
      /;\s*$/m,
      // Multiple lines with consistent indentation
      /^\s+\S+/m
    ];
    
    // Check if text is longer than 3 lines and matches at least 2 code indicators
    const lineCount = (text.match(/\n/g) || []).length + 1;
    let matchCount = 0;
    
    for (const pattern of codeIndicators) {
      if (pattern.test(text)) {
        matchCount++;
      }
    }
    
    return lineCount > 3 && matchCount >= 2;
  };
  
  // Function to analyze code snippet
  const analyzeCodeSnippet = (code) => {
    try {
      // Try to determine the language
      let language = 'unknown';
      if (code.includes('import React') || code.includes('useState') || code.includes('useEffect') || 
          code.includes('<div>') || code.includes('ReactDOM')) {
        language = 'React/JavaScript';
      } else if (code.includes('function') && code.includes('{') && code.includes(';')) {
        language = 'JavaScript';
      } else if (code.includes('def ') && code.includes(':')) {
        language = 'Python';
      } else if (code.includes('class ') && code.includes('extends ')) {
        language = 'Java or TypeScript';
      } else if (code.includes('#include')) {
        language = 'C/C++';
      }
      
      // Count number of functions/methods
      const functionMatches = code.match(/function\s+\w+|\w+\s*=\s*\(.*\)\s*=>|def\s+\w+/g) || [];
      const functionCount = functionMatches.length;
      
      // Look for React components
      const hasReactComponents = code.includes('useState') || code.includes('useEffect') || 
                                code.includes('render()') || code.includes('return (');
      
      // Find imports
      const importMatches = code.match(/import\s+.*?from|require\s*\(.*?\)/g) || [];
      
      // Generate simple analysis
      let analysis = `This appears to be ${language} code. `;
      
      if (functionCount > 0) {
        analysis += `It contains ${functionCount} function${functionCount > 1 ? 's' : ''}. `;
      }
      
      if (importMatches.length > 0) {
        analysis += `The code imports ${importMatches.length} module${importMatches.length > 1 ? 's' : ''}. `;
      }
      
      if (hasReactComponents) {
        analysis += `This code includes React component logic with hooks or JSX. `;
      }
      
      analysis += `\n\nFor a more detailed analysis, I'd need to understand what specific aspects of the code you're interested in. What would you like to know about this code?`;
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing code:', error);
      return "I couldn't analyze this code in detail. What specific questions do you have about it?";  
    }
  };

const findIntentTag = (text, currentIntents) => {
    if (!text || !currentIntents) return null;
    const lowerInput = text.toLowerCase();
    // Ensure currentIntents is an array before iterating
    const intentsArray = Array.isArray(currentIntents) ? currentIntents : (currentIntents?.intents || []);

    for (const intent of intentsArray) {
      if (intent && Array.isArray(intent.patterns) && typeof intent.tag === 'string') {
        for (const pattern of intent.patterns) {
          if (typeof pattern === 'string' && lowerInput.includes(pattern.toLowerCase())) {
            return intent.tag;
          }
        }
      }
    }
    return null;
  };
  const processBotResponse = async (userInput) => {
    // Show typing indicator
    setMessages(prev => [...prev, { id: prev.length + 2, isBot: true, isTyping: true }]);
    
    try {
      // Delay to simulate thinking and for better UX
      await new Promise(resolve => setTimeout(resolve, 700));
      
      let response;
      
      // Log processing path for debugging
      console.log(`Processing message with: ${useOllama ? 'Ollama' : 'TensorFlow.js'}, Model: ${selectedModel || 'none'}, Ollama available: ${ollamaAvailable}`);
      
      // Check if this is a code snippet that we should analyze
      const previousMessages = messages.filter(msg => !msg.isBot);
      const isPreviousMessageCodeRequest = previousMessages.length >= 2 && 
        findIntentTag(previousMessages[previousMessages.length - 2]?.text, intentsData?.intents) === 'code_analysis';
      const isCurrentMessageCode = isLikelyCode(userInput);
      
      // If the previous message was a code request or the current message looks like code
      if (isPreviousMessageCodeRequest || isCurrentMessageCode) {
        console.log('Detected code snippet or code analysis request');
        
        if (isCurrentMessageCode) {
          // If Ollama is available, use it for deep code analysis
          if (ollamaAvailable && useOllama && selectedModel) {
            try {
              // Add a prompt to ask Ollama specifically about the code
              const codePrompt = `Analyze this code snippet and explain what it does:\n\n${userInput}`;
              response = await ollamaService.generateResponse(codePrompt, selectedModel);
              console.log(`Ollama model ${selectedModel} used for code analysis`);
            } catch (ollamaError) {
              console.error('Error using Ollama for code analysis:', ollamaError);
              // Fallback to basic code analysis
              response = analyzeCodeSnippet(userInput);
            }
          } else {
            // Use our built-in code analyzer for basic insights
            response = analyzeCodeSnippet(userInput);
            console.log('Using built-in code analyzer');
          }
        } else {
          // Handle normal code analysis requests
          if (ollamaAvailable && useOllama && selectedModel) {
            try {
              response = await ollamaService.generateResponse(userInput, selectedModel);
            } catch (error) {
              response = getResponseForInput(userInput);
            }
          } else {
            response = getResponseForInput(userInput);
          }
        }
      } else {
        // Standard message processing (not code-related)
        // Check if we should use Ollama - allow full unrestricted knowledge
        if (ollamaAvailable && useOllama && selectedModel) {
          try {
            // When using Ollama, go directly to the LLM for unrestricted knowledge
            response = await ollamaService.generateResponse(userInput, selectedModel);
            console.log(`Ollama model ${selectedModel} used unrestricted knowledge for: "${userInput}"`);
          } catch (ollamaError) {
            console.error('Error using Ollama:', ollamaError);
            // Fall back to pattern matching or TensorFlow only if Ollama fails completely
            if (responsesLoaded) {
              response = getResponseForInput(userInput);
              console.log(`Falling back to pattern matching for: "${userInput}"`);
            } else {
              response = getFallbackResponse(userInput);
            }
          }
        } else if (responsesLoaded) {
          // TensorFlow.js mode: Use pattern matching as the primary method
          response = getResponseForInput(userInput);
          console.log(`TensorFlow.js mode: Pattern matched response for: "${userInput}"`);
        } else if (modelLoaded && model && vocabularyLoaded) {
          // TensorFlow.js mode: ML model with fixed responses
          try {
            const inputVector = vectorizeText(userInput);
            const prediction = await predictIntent(model, inputVector);
            const intent = getIntentLabel(prediction);
            response = getResponse(intent);
            
            console.log(`TensorFlow.js model processed input: "${userInput}" → Intent: "${intent}"`);
          } catch (modelError) {
            console.error('Error in model prediction:', modelError);
            response = getFallbackResponse(userInput);
          }
        } else {
          // Fallback to simple response if nothing is loaded
          if (modelError) {
            response = modelError;
          } else {
            response = "I'm still loading my capabilities. Please try again in a moment.";
          }
        }
      }
      
      // Update the typing message with the actual response
      setMessages(prev => 
        prev.map(msg => 
          (msg.isTyping && msg.isBot) 
            ? { ...msg, text: response, isTyping: false } 
            : msg
        )
      );
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => 
        prev.map(msg => 
          (msg.isTyping && msg.isBot) 
            ? { ...msg, text: "Sorry, I'm having trouble processing your message.", isTyping: false } 
            : msg
        )
      );
    } finally {
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = { id: messages.length + 1, text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    // Process user input and generate response
    processBotResponse(inputText);
    
    // Clear input field
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Check if the chatbot is ready to accept input
  const isChatbotReady = responsesLoaded && !isInitializing;

  return (
    <div className={`chatbot-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="chatbot-header">
        <div className="header-title">
          <ChatbotLogo size={32} animated={true} />
          <h2>AI Assistant</h2>
          {ollamaAvailable && (
            <div className="model-toggle">
              <button 
                onClick={toggleModelType} 
                className={`toggle-button ${useOllama ? 'ollama-active' : 'tf-active'}`}
                title={useOllama ? "Switch to TensorFlow.js" : "Switch to Ollama"}
              >
                <div className="toggle-button-content">
                  <span className="toggle-icon">
                    {useOllama ? (
                      <span role="img" aria-label="Robot">🤖</span>
                    ) : (
                      <span role="img" aria-label="Brain">🧠</span>
                    )}
                  </span>
                  <div className="toggle-text">
                    <span className="toggle-label">Using:</span>
                    <span className="toggle-value">{useOllama ? "Ollama" : "TensorFlow.js"}</span>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button 
            onClick={clearChat} 
            className="icon-button" 
            title="Clear chat"
            aria-label="Clear chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z"/>
            </svg>
          </button>
          <button 
            onClick={toggleDarkMode} 
            className="icon-button" 
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M10 7a7 7 0 0 0 12 4.9v.1c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2h.1A6.979 6.979 0 0 0 10 7zm-6 5a8 8 0 0 0 15.062 3.762A9 9 0 0 1 8.238 4.938 7.999 7.999 0 0 0 4 12z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Show model selector if Ollama is available and active */}
      {ollamaAvailable && useOllama && (
        <div className="model-selector-container">
          <ModelSelector 
            onModelSelect={handleModelSelect} 
            selectedModel={selectedModel} 
            ollamaAvailable={ollamaAvailable} 
          />
        </div>
      )}
      
      <div className="messages-container">
        {messages.map(msg => (
          <ChatMessage 
            key={msg.id} 
            message={msg.text} 
            isBot={msg.isBot} 
            isTyping={msg.isTyping}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="input-area" onSubmit={handleSendMessage}>
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          rows={1}
          disabled={isInitializing && !responsesLoaded}
        />
        <button 
          type="submit" 
          disabled={(isInitializing && !responsesLoaded) || inputText.trim() === ''}
          className="send-button"
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"/>
          </svg>
        </button>
      </form>
      
      {isInitializing && !responsesLoaded && (
        <div className="model-loading">
          <div className="loading-spinner"></div>
          <p>Loading AI model...</p>
        </div>
      )}
      
      {modelError && !isChatbotReady && (
        <div className="model-error">
          <p>{modelError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 