import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm a simple chatbot. How can I help you today?", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Simple predefined responses
  const botResponses = [
    { trigger: ['hi', 'hello', 'hey'], response: "Hello! Nice to chat with you!" },
    { trigger: ['how are you', 'how are u'], response: "I'm just a simple bot, but I'm doing well! How about you?" },
    { trigger: ['help', 'support'], response: "I can chat with you about simple topics. What's on your mind?" },
    { trigger: ['bye', 'goodbye'], response: "Goodbye! Have a great day!" },
    { trigger: ['thanks', 'thank you'], response: "You're welcome! Anything else I can help with?" },
    { trigger: ['weather'], response: "I'm sorry, I don't have access to weather information." },
    { trigger: ['name'], response: "I'm SimpleBot, a basic React chatbot!" },
    { trigger: ['joke'], response: "Why don't scientists trust atoms? Because they make up everything!" },
  ];

  // Scroll to bottom of chat when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userInput) => {
    const lowercaseInput = userInput.toLowerCase();
    
    for (const item of botResponses) {
      if (item.trigger.some(trigger => lowercaseInput.includes(trigger))) {
        return item.response;
      }
    }
    
    return "I'm not sure how to respond to that. Could you try asking something else?";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = { id: messages.length + 1, text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    // Generate bot response
    setTimeout(() => {
      const botMessage = { 
        id: messages.length + 2, 
        text: getBotResponse(inputText), 
        isBot: true 
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
    
    setInputText('');
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Simple Chatbot</h2>
      </div>
      
      <div className="messages-container">
        {messages.map(msg => (
          <ChatMessage 
            key={msg.id} 
            message={msg.text} 
            isBot={msg.isBot} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message here..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot; 