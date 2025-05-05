import React from 'react';
import './ChatbotLogo.css';

const ChatbotLogo = ({ size = 40, animated = true }) => {
  return (
    <div className="chatbot-logo" style={{ width: size, height: size }}>
      <svg 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'animated' : ''}
      >
        {/* Robot Head */}
        <rect 
          className="head" 
          x="25" 
          y="20" 
          width="50" 
          height="45" 
          rx="8" 
          ry="8" 
        />
        
        {/* Antennas */}
        <line 
          className="antenna left-antenna" 
          x1="35" 
          y1="20" 
          x2="30" 
          y2="10" 
        />
        <circle 
          className="antenna-dot" 
          cx="30" 
          cy="10" 
          r="3" 
        />
        
        <line 
          className="antenna right-antenna" 
          x1="65" 
          y1="20" 
          x2="70" 
          y2="10" 
        />
        <circle 
          className="antenna-dot" 
          cx="70" 
          cy="10" 
          r="3" 
        />
        
        {/* Eyes */}
        <circle 
          className="eye left-eye" 
          cx="40" 
          cy="35" 
          r="5" 
        />
        <circle 
          className="eye right-eye" 
          cx="60" 
          cy="35" 
          r="5" 
        />
        
        {/* Mouth/Speaker */}
        <rect 
          className="mouth" 
          x="35" 
          y="50" 
          width="30" 
          height="5" 
          rx="2" 
          ry="2" 
        />
        
        {/* Speech Bubbles */}
        <g className="speech-bubbles">
          <path 
            className="bubble bubble-1" 
            d="M80,30 Q90,30 90,40 Q90,50 80,50 Q70,50 70,40 Q70,30 80,30 Z" 
          />
          <path 
            className="bubble bubble-2" 
            d="M85,15 Q92,15 92,22 Q92,29 85,29 Q78,29 78,22 Q78,15 85,15 Z" 
          />
          <path 
            className="bubble bubble-3" 
            d="M20,35 Q12,35 12,42 Q12,49 20,49 Q28,49 28,42 Q28,35 20,35 Z" 
          />
        </g>
        
        {/* Neck */}
        <rect 
          className="neck" 
          x="45" 
          y="65" 
          width="10" 
          height="5" 
        />
        
        {/* Body */}
        <rect 
          className="body" 
          x="30" 
          y="70" 
          width="40" 
          height="20" 
          rx="5" 
          ry="5" 
        />
        
        {/* Body Lights */}
        <circle 
          className="light light-1" 
          cx="40" 
          cy="75" 
          r="2" 
        />
        <circle 
          className="light light-2" 
          cx="50" 
          cy="75" 
          r="2" 
        />
        <circle 
          className="light light-3" 
          cx="60" 
          cy="75" 
          r="2" 
        />
        
        {/* AI Brain Pulses */}
        <g className="brain-waves">
          <path 
            className="wave wave-1" 
            d="M38,25 Q42,20 46,25 Q50,30 54,25 Q58,20 62,25" 
            fill="none"
          />
          <path 
            className="wave wave-2" 
            d="M38,80 Q42,75 46,80 Q50,85 54,80 Q58,75 62,80" 
            fill="none" 
          />
        </g>
      </svg>
    </div>
  );
};

export default ChatbotLogo; 