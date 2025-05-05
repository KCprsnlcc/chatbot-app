import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message, isBot }) => {
  return (
    <div className={`message ${isBot ? 'bot' : 'user'}`}>
      <div className="message-content">
        <div className="avatar">
          {isBot ? '🤖' : '👤'}
        </div>
        <div className="text">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 