import React, { useState, useEffect } from 'react';
import './App.css';
import Chatbot from './components/Chatbot';
import ChatbotLogo from './components/ChatbotLogo';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="App-loading">
        <div className="App-loading-content">
          <ChatbotLogo size={80} animated={true} />
          <h2>AI Chatbot Assistant</h2>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Chatbot Assistant</h1>
        <p>Powered by TensorFlow.js & Ollama</p>
      </header>
      <main>
        <Chatbot />
      </main>
      <footer>
        <p>AI Chatbot with Intent Classification - Client-Side ML</p>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
