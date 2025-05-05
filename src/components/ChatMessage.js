import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message, isBot, isTyping = false }) => {
  return (
    <div className={`chat-message ${isBot ? 'bot-message' : 'user-message'}`}>
      <div className="message-avatar">
        {isBot ? (
          <div className="bot-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.38-1 1.72V7h2c1.1 0 2 .9 2 2v2.28c.6.35 1 .98 1 1.72 0 1.1-.9 2-2 2s-2-.9-2-2c0-.74.4-1.38 1-1.72V9H9v2.28c.6.35 1 .98 1 1.72 0 1.1-.9 2-2 2s-2-.9-2-2c0-.74.4-1.38 1-1.72V9c0-1.1.9-2 2-2h2V5.72c-.6-.35-1-.98-1-1.72a2 2 0 012-2z" />
              <path d="M17.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5h-11c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5h11zm-9.8 2.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
        ) : (
          <div className="user-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
        )}
      </div>
      <div className="message-content">
        {isTyping ? (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <div className="message-text">{message}</div>
        )}
        <div className="message-time">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 