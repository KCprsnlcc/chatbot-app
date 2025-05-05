import React from 'react';
import './App.css';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Chatbot</h1>
      </header>
      <main>
        <Chatbot />
      </main>
      <footer>
        <p>Simple React Chatbot - Frontend Only</p>
      </footer>
    </div>
  );
}

export default App;
