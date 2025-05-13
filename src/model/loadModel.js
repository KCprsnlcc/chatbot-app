import * as tf from '@tensorflow/tfjs';

/**
 * Loads the TensorFlow.js model from the public directory
 * @returns {Promise<tf.LayersModel>} The loaded model
 */
export const loadModel = async () => {
  try {
    console.log('Starting model loading process...');
    
    // First load the vocabulary to get the input shape
    let vocabularyData;
    try {
      // Try multiple paths for vocabulary.json
      const vocabPaths = [
        '/model/vocabulary.json',
        '/src/model/vocabulary.json',
        '/public/model/vocabulary.json',
        '/vocabulary.json'
      ];
      
      let vocabResponse = null;
      for (const path of vocabPaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            console.log(`Successfully loaded vocabulary from: ${path}`);
            vocabResponse = response;
            break;
          }
        } catch (pathError) {
          console.warn(`Failed to load vocabulary from ${path}: ${pathError.message}`);
        }
      }
      
      if (!vocabResponse) {
        throw new Error('Failed to load vocabulary from any path');
      }
      
      vocabularyData = await vocabResponse.json();
      console.log('Vocabulary loaded successfully', vocabularyData);
    } catch (vocabError) {
      console.error('Error loading vocabulary:', vocabError);
      throw new Error('Failed to load the chatbot vocabulary');
    }
    
    // Get the input shape from vocabulary
    const inputShape = vocabularyData.input_shape || vocabularyData.vocabulary.length;
    console.log(`Using input shape: ${inputShape}`);
    
    let model;
    
    try {
      // Try multiple paths for model.json
      const modelPaths = [
        '/model/model.json',
        '/public/model/model.json',
        '/src/model/model.json'
      ];
      
      // In development, try to load the test model from localStorage first
      if (process.env.NODE_ENV === 'development') {
        try {
          console.log('Attempting to load test model from localStorage');
          model = await tf.loadLayersModel('localstorage://test-model');
          console.log('Test model loaded from localStorage');
        } catch (localStorageError) {
          console.warn('Could not load from localStorage, falling back to file model', localStorageError);
          
          // Try each path in order
          let modelLoaded = false;
          for (const path of modelPaths) {
            try {
              console.log(`Attempting to load model from ${path}`);
              model = await tf.loadLayersModel(path);
              console.log(`Model loaded successfully from ${path}`);
              modelLoaded = true;
              break;
            } catch (pathError) {
              console.warn(`Failed to load model from ${path}: ${pathError.message}`);
            }
          }
          
          if (!modelLoaded) {
            throw new Error('Failed to load model from any path');
          }
        }
      } else {
        // In production, try each path in order
        let modelLoaded = false;
        for (const path of modelPaths) {
          try {
            console.log(`Attempting to load model from ${path}`);
            model = await tf.loadLayersModel(path);
            console.log(`Model loaded successfully from ${path}`);
            modelLoaded = true;
            break;
          } catch (pathError) {
            console.warn(`Failed to load model from ${path}: ${pathError.message}`);
          }
        }
        
        if (!modelLoaded) {
          throw new Error('Failed to load model from any path');
        }
      }
      
      console.log('Model loaded successfully', model);
    } catch (modelError) {
      console.error('Error loading model, creating a simple model instead:', modelError);
      
      // Create a simple model with the right input/output dimensions
      model = tf.sequential();
      model.add(tf.layers.dense({
        units: 128,
        activation: 'relu',
        inputShape: [inputShape]
      }));
      model.add(tf.layers.dense({
        units: 64,
        activation: 'relu'
      }));
      model.add(tf.layers.dense({
        units: vocabularyData.tags.length,
        activation: 'softmax'
      }));
      
      // Compile the model
      model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });
      
      console.log('Created fallback model', model);
    }
    
    // Test if the model is actually usable
    try {
      const testTensor = tf.zeros([1, inputShape]);
      const testResult = model.predict(testTensor);
      console.log('Model test prediction successful', await testResult.data());
      testTensor.dispose();
      testResult.dispose();
    } catch (testError) {
      console.error('Model test failed:', testError);
      throw new Error('Model loaded but failed test prediction');
    }
    
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error('Failed to load the chatbot model');
  }
};

/**
 * Performs inference with the loaded model
 * @param {tf.LayersModel} model - The loaded TensorFlow.js model
 * @param {number[]} inputVector - The preprocessed input vector
 * @returns {number[]} Array of probabilities for each intent
 */
export const predictIntent = async (model, inputVector) => {
  try {
    console.log('Starting prediction with input vector:', inputVector);
    
    // Create a tensor from the input vector
    const inputTensor = tf.tensor2d([inputVector]);
    console.log('Input tensor created:', inputTensor.shape);
    
    // Run prediction
    console.log('Running model prediction...');
    const prediction = await model.predict(inputTensor);
    console.log('Prediction tensor:', prediction.shape);
    
    // Convert to array and clean up tensors
    const result = await prediction.data();
    console.log('Prediction results:', Array.from(result));
    
    inputTensor.dispose();
    prediction.dispose();
    
    return Array.from(result);
  } catch (error) {
    console.error('Prediction error:', error);
    throw new Error('Failed to process your message');
  }
}; 