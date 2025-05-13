# Modern AI Chatbot with Intent Classification

A modern, responsive chatbot application powered by a dual-approach system: TensorFlow.js neural network for intent classification and a pattern matching algorithm for fallback. This project runs entirely in the browser with no server-side dependencies.

## Features

- 🧠 Client-side machine learning with TensorFlow.js
- 🔍 Pattern matching for reliable intent recognition
- 🌙 Dark mode support
- 💬 Modern chat interface with typing indicators
- 🚀 Fast and lightweight
- 🎨 Animated SVG Robot Logo
- 📱 Responsive design with mobile support
- ⚡ Graceful degradation when model fails to load

## Project Structure

```
/public
 • model/ — Contains TensorFlow.js model files (model.json and binary weights)
 • data/ — Contains intents.json with patterns and responses
 • icons/ — SVG and PNG icons for the application
 • favicon.svg — Animated SVG favicon with dark mode support
/src
 • components/
   - Chatbot.js — Modern chatbot UI with ML integration
   - ChatbotLogo.js — Animated robot SVG component
   - ChatMessage.js — Individual message component with typing indicators
 • model/
   - tokenizer.js — Text preprocessing, vectorization, and pattern matching
   - loadModel.js — TensorFlow.js model loader with fallback
   - responses.js — Intent-based response mapping
 • App.js — Application entry point
 • index.js — React DOM mount
```

## Intents Data Structure

The chatbot uses a JSON file (`/public/data/intents.json`) to define intents, patterns, and responses:

```json
{
  "intents": [
    {
      "tag": "greeting",
      "patterns": ["Hi", "Hello", "Hey there", "Good morning", "What's up"],
      "responses": ["Hello! How can I help you today?", "Hi there! What can I do for you?"]
    },
    {
      "tag": "goodbye",
      "patterns": ["Bye", "See you later", "Goodbye", "I'm leaving"],
      "responses": ["Goodbye! Have a great day!", "See you later! Take care!"]
    }
  ]
}
```

Each intent contains:
- `tag`: The intent identifier
- `patterns`: Example utterances that should trigger this intent
- `responses`: Possible responses the chatbot will randomly select from

## How It Works

### Dual Recognition Approach

The chatbot uses a two-tiered approach to understand user messages:

1. **Pattern Matching (Primary)**:
   - User input is compared against patterns in the intents.json file
   - A string similarity algorithm calculates the best match
   - Combines Jaccard similarity and pattern coverage for robust matching
   - Works even if the ML model fails to load

2. **Neural Network Classification (Secondary)**:
   - The app uses a neural network to classify user messages into predefined intents
   - Provides a fallback when pattern matching is ambiguous

### Processing Flow

1. When a user sends a message, it first goes through pattern matching
2. The system finds the intent with the most similar pattern
3. If similarity is above threshold, it selects a response from that intent
4. If no good match is found, it falls back to the ML model (if available)
5. The UI updates with typing indicators and the selected response

### Fallback Mechanisms

The chatbot includes multiple fallback layers:

1. If pattern matching fails → Try ML model
2. If ML model fails → Use default responses
3. If intents.json fails to load → Use built-in default intents
4. If everything fails → Use generic responses

## Model Training

The model training process happens offline using Python:

1. **Data Preparation**: Extract patterns and tags from `intents.json`
2. **Tokenization**: Convert text to lowercase, remove punctuation, split into tokens
3. **Vectorization**: Create bag-of-words vectors for each pattern
4. **Model Definition**:
   ```python
   model = Sequential()
   model.add(Dense(24, input_shape=(input_shape,), activation='relu'))
   model.add(Dense(num_classes, activation='softmax'))
   model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
   ```
5. **Training**: Train the model using the patterns and corresponding tags
6. **Conversion**: Convert the model to TensorFlow.js format
   ```bash
   tensorflowjs_converter --input_format keras model.h5 /public/model/
   ```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone https://github.com/KCprsnlcc/chatbot-app.git
   cd chatbot-app
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Start the development server**:
   ```
   npm start
   ```

4. **Build for production**:
   ```
   npm run build
   ```

## Customizing the Chatbot

### Adding New Intents

To add new intents to the chatbot:

1. Edit the `public/data/intents.json` file
2. Add new intent objects with tags, patterns, and responses
3. No need to retrain the model - pattern matching will work with new intents immediately
4. For optimal performance, retrain the ML model when adding many new intents

### String Similarity Algorithm

The pattern matching uses a custom string similarity algorithm that:

1. Preprocesses text (lowercase, remove punctuation, tokenize)
2. Checks for exact matches first
3. Calculates Jaccard similarity (intersection over union of words)
4. Measures pattern coverage (how many pattern words appear in input)
5. Combines scores with weighted emphasis on pattern coverage

```javascript
// Simplified version of the algorithm
function calculateStringSimilarity(userInput, pattern) {
  // Preprocess both strings
  const tokens1 = preprocessText(userInput);
  const tokens2 = preprocessText(pattern);
  
  // Check for exact match
  if (userInput.toLowerCase() === pattern.toLowerCase()) {
    return 1.0;
  }
  
  // Calculate Jaccard similarity and pattern coverage
  // ...
  
  // Return weighted combination
  return (jaccardSimilarity * 0.4) + (coverageScore * 0.6);
}
```

## License

This project is licensed under the terms outlined in the [License](LICENSE.md).
