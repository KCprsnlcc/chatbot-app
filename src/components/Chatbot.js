import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import './Chatbot.css';
import { loadModel, predictIntent } from '../model/loadModel';
import { vectorizeText, getIntentLabel, loadVocabulary } from '../model/tokenizer';
import { getResponse, loadResponses } from '../model/responses';
import ChatbotLogo from './ChatbotLogo';

const Chatbot = () => {
  // State for chat messages
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true }
  ]);
  
  // UI state
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Model state
  const [model, setModel] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [vocabularyLoaded, setVocabularyLoaded] = useState(false);
  const [responsesLoaded, setResponsesLoaded] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Load all required data on component mount
  useEffect(() => {
    const initChatbot = async () => {
      try {
        // Load model, vocabulary and responses in parallel
        const [loadedModel, vocabData, responseData] = await Promise.all([
          loadModel().catch(error => {
            console.error('Failed to load model:', error);
            setModelError('Sorry, I had trouble loading my brain. Try refreshing the page.');
            return null;
          }),
          loadVocabulary().catch(error => {
            console.error('Failed to load vocabulary:', error);
            return null;
          }),
          loadResponses().catch(error => {
            console.error('Failed to load responses:', error);
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
        
        if (responseData) {
          setResponsesLoaded(true);
        }
        
        // Check if everything is loaded successfully
        if (loadedModel && vocabData && responseData) {
          console.log('Chatbot initialized successfully!');
        } else {
          console.warn('Chatbot initialized with some missing components');
        }
      } catch (error) {
        console.error('Failed to initialize chatbot:', error);
        setModelError('Sorry, I had trouble initializing. Try refreshing the page.');
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

  const processBotResponse = async (userInput) => {
    // Show typing indicator
    setIsTyping(true);
    setMessages(prev => [...prev, { id: prev.length + 2, isBot: true, isTyping: true }]);
    
    try {
      // Delay to simulate thinking and for better UX
      await new Promise(resolve => setTimeout(resolve, 700));
      
      let response;
      
      if (modelLoaded && model && vocabularyLoaded && responsesLoaded) {
        try {
          // Process input with the ML model
          const inputVector = vectorizeText(userInput);
          const prediction = await predictIntent(model, inputVector);
          const intent = getIntentLabel(prediction);
          response = getResponse(intent);
        } catch (modelError) {
          console.error('Error in model prediction:', modelError);
          // Use fallback response based on user input
          response = getFallbackResponse(userInput);
        }
      } else {
        // Fallback to simple response if model isn't loaded
        if (modelError) {
          response = modelError;
        } else {
          response = "I'm still loading my capabilities. Please try again in a moment.";
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
      setIsTyping(false);
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

  // Check if the chatbot is fully ready
  const isChatbotReady = modelLoaded && vocabularyLoaded && responsesLoaded;

  return (
    <div className={`chatbot-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="chatbot-header">
        <div className="header-title">
          <ChatbotLogo size={32} animated={true} />
          <h2>AI Assistant</h2>
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
          disabled={!isChatbotReady && !modelError}
        />
        <button 
          type="submit" 
          disabled={(!isChatbotReady && !modelError) || inputText.trim() === ''}
          className="send-button"
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"/>
          </svg>
        </button>
      </form>
      
      {!isChatbotReady && !modelError && (
        <div className="model-loading">
          <div className="loading-spinner"></div>
          <p>Loading AI model...</p>
        </div>
      )}
      
      {modelError && (
        <div className="model-error">
          <p>{modelError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 