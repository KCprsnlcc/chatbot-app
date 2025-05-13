import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
import string
import random
import os
import nltk
from nltk.stem import WordNetLemmatizer

# Download NLTK data
nltk.download('punkt')
nltk.download('wordnet')

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Load intents from JSON file
print("Loading intents data...")
with open('../src/data/intents.json', 'r') as f:
    intents = json.load(f)

# Initialize lists for training
all_words = []
tags = []
xy = []

# Process intent patterns
print("Processing intent patterns...")
for intent in intents['intents']:
    tag = intent['tag']
    tags.append(tag)
    
    for pattern in intent['patterns']:
        # Tokenize each word in the pattern
        words = nltk.word_tokenize(pattern.lower())
        all_words.extend(words)
        
        # Add to xy pair
        xy.append((words, tag))

# Lemmatize and filter words
print("Lemmatizing words...")
all_words = [lemmatizer.lemmatize(word.lower()) for word in all_words if word not in string.punctuation]
all_words = sorted(set(all_words))  # Remove duplicates and sort
tags = sorted(set(tags))

print(f"Vocabulary size: {len(all_words)}")
print(f"Number of tags: {len(tags)}")

# Create training data
X_train = []
y_train = []

# Create bag of words for each pattern
print("Creating training data...")
for (pattern_words, tag) in xy:
    # Bag of words
    bag = [1 if lemmatizer.lemmatize(word.lower()) in pattern_words else 0 for word in all_words]
    X_train.append(bag)
    
    # Class label (one-hot encoded)
    label = [1 if tag == t else 0 for t in tags]
    y_train.append(label)

X_train = np.array(X_train)
y_train = np.array(y_train)

print(f"Training data shape: X={X_train.shape}, y={y_train.shape}")

# Define the model
print("Building and training model...")
model = Sequential()
model.add(Dense(128, input_shape=(len(X_train[0]),), activation='relu'))
model.add(Dense(64, activation='relu'))
model.add(Dense(len(tags), activation='softmax'))

# Compile the model
model.compile(loss='categorical_crossentropy', 
              optimizer='adam', 
              metrics=['accuracy'])

# Display model summary
model.summary()

# Train the model
history = model.fit(
    X_train, y_train,
    epochs=200,
    batch_size=8,
    verbose=1
)

# Create output directories if they don't exist
os.makedirs('../public/model', exist_ok=True)
os.makedirs('../src/model', exist_ok=True)

# Save the model in Keras format
print("Saving model...")
model.save("model.h5")

# Save a simple model JSON for reference
model_json = model.to_json()
with open("model.json", "w") as json_file:
    json_file.write(model_json)

# Save vocabulary and tags for future use
print("Saving vocabulary and tags...")
with open("../src/model/vocabulary.json", "w") as f:
    json.dump({"vocabulary": all_words, "tags": tags, "input_shape": len(all_words)}, f)

# Save model config for TensorFlow.js
print("Creating model config for TensorFlow.js...")
try:
    # Create a simple model.json file for TensorFlow.js
    tfjs_model_dir = '../public/model'
    os.makedirs(tfjs_model_dir, exist_ok=True)
    
    # Write a placeholder model.json
    with open(f"{tfjs_model_dir}/model.json", "w") as f:
        f.write(json.dumps({
            "format": "layers-model",
            "generatedBy": "keras v" + tf.__version__,
            "convertedBy": "manual conversion",
            "modelTopology": json.loads(model_json),
            "weightsManifest": [
                {
                    "paths": ["group1-shard1of1.bin"],
                    "weights": []
                }
            ]
        }))
    
    # Create an empty binary file as placeholder
    with open(f"{tfjs_model_dir}/group1-shard1of1.bin", "wb") as f:
        f.write(b"")
        
    print("Created placeholder TensorFlow.js model files")
except Exception as e:
    print(f"Error creating TensorFlow.js model files: {e}")

print("Training completed successfully!")
print("Model saved as model.h5")
print("To properly convert the model to TensorFlow.js format, install tensorflowjs_converter:")
print("pip install tensorflowjs")
print("Then run:")
print("tensorflowjs_converter --input_format=keras model.h5 ../public/model")
print("You can now use the model in your React application.") 