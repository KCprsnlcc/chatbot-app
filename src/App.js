import React from 'react';
import './App.css';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Chatbot Assistant</h1>
        <p>Powered by TensorFlow.js</p>
      </header>
      <main>
        <Chatbot />
      </main>
      <footer>
        <p>AI Chatbot with Intent Classification - Client-Side ML</p>
      </footer>
    </div>
  );
}

export default App;
