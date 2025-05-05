import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as tf from '@tensorflow/tfjs';

// Generate test weights if in development mode
if (process.env.NODE_ENV === 'development') {
  try {
    console.log('Generating test weights for development');
    
    // Create a simple model matching our model.json structure
    const model = tf.sequential();
    model.add(tf.layers.dense({ 
      units: 24, 
      activation: 'relu', 
      inputShape: [48] 
    }));
    model.add(tf.layers.dense({ 
      units: 9, 
      activation: 'softmax' 
    }));
    
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    // Save the model to replace the empty weights file
    model.save('localstorage://test-model');
    console.log('Test model saved to localStorage for development');
  } catch (error) {
    console.error('Error generating test weights:', error);
  }
}

// Check for dark mode preference
const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

// Apply dark mode class if needed
if (savedTheme === 'dark' || (prefersDarkMode && savedTheme !== 'light')) {
  document.body.classList.add('dark-mode');
}

// Listen for dark mode changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    if (e.matches) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
