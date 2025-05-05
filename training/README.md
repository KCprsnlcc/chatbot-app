# Model Training for the Chatbot

This directory contains the scripts needed to train the TensorFlow model used by the chatbot.

## Requirements

Before running the training script, make sure you have the following Python packages installed:

```bash
pip install tensorflow numpy nltk tensorflowjs
```

## Training Process

The `train_model.py` script performs the following steps:

1. Loads intent data from `../src/data/intents.json`
2. Processes and tokenizes all patterns
3. Creates a bag-of-words representation for each pattern
4. Trains a neural network to classify intents
5. Saves the model in both Keras (.h5) and TensorFlow.js formats
6. Saves vocabulary and tags for use in the web application

## How to Run

Navigate to this directory and run:

```bash
python train_model.py
```

## Output Files

After successful training, the script will generate:

- `model.h5`: Keras model file (for reference)
- `../public/model/`: Directory containing the TensorFlow.js model files
- `../src/model/vocabulary.json`: Vocabulary and tags used by the model

## Customization

If you modified the `intents.json` file with new intents or patterns, running this script will retrain the model with your new data.

For advanced customization, you can modify the neural network architecture in the `train_model.py` script by changing the layers or parameters. 