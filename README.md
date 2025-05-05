# Modern AI Chatbot with Intent Classification

A modern, responsive chatbot application powered by a TensorFlow.js neural network for intent classification. This project runs entirely in the browser with no server-side dependencies.

## Features

- 🧠 Client-side machine learning with TensorFlow.js
- 🌙 Dark mode support
- 💬 Modern chat interface with typing indicators
- 🚀 Fast and lightweight
- 🎨 Animated SVG Robot Logo
- 🔍 SEO-optimized with metadata
- 📱 Responsive design with mobile support

## Project Structure

```
/public
 • model/ — Contains TensorFlow.js model files (model.json and binary weights)
 • icons/ — SVG and PNG icons for the application
 • favicon.svg — Animated SVG favicon with dark mode support
/src
 • components/
   - Chatbot.js — Modern chatbot UI with ML integration
   - ChatbotLogo.js — Animated robot SVG component
   - ChatMessage.js — Individual message component with typing indicators
 • model/
   - tokenizer.js — Text preprocessing and vectorization
   - loadModel.js — TensorFlow.js model loader
   - responses.js — Intent-based response mapping
 • data/
   - intents.json — Training data with intents, patterns, and responses
 • App.js — Application entry point
 • index.js — React DOM mount
```

## Intents Data Structure

The chatbot uses a JSON file (`/src/data/intents.json`) to define intents, patterns, and responses:

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

1. **Intent Recognition**: The app uses a neural network to classify user messages into predefined intents.
2. **Training Process**:
   - The model is trained on the patterns in `intents.json`
   - Text is preprocessed using bag-of-words vectorization
   - A simple feed-forward neural network classifies the vectors into intents
   - The trained model is converted to TensorFlow.js format
3. **Client-Side Processing**:
   - When a user sends a message, it's vectorized using the same approach
   - The TensorFlow.js model predicts the intent
   - A response is selected from the matching intent's response array
   - The UI updates with typing indicators and the response

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

1. Edit the `src/data/intents.json` file
2. Add new intent objects with tags, patterns, and responses
3. Update `src/model/tokenizer.js` to include any new vocabulary
4. Retrain the model using the Python training script (see below)
5. Replace the model files in `/public/model/`

### Training Script

A Python script for training can be found in the `/training` directory:

```python
# training/train_model.py

import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
import tensorflowjs as tfjs

# Load intents
with open('../src/data/intents.json', 'r') as f:
    intents = json.load(f)

# Generate vocabulary, patterns, and tags
# ... (see the training script for the full implementation)

# Train model
model = Sequential()
model.add(Dense(24, input_shape=(len(vocabulary),), activation='relu'))
model.add(Dense(len(intent_tags), activation='softmax'))
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
model.fit(X_train, y_train, epochs=200, batch_size=8, verbose=1)

# Convert model to TensorFlow.js format
tfjs.converters.save_keras_model(model, '../public/model')
```

## License

This project is licensed under the terms outlined in the [License](LICENSE.md).
