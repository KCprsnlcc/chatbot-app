import * as tf from '@tensorflow/tfjs';

/**
 * Loads the TensorFlow.js model from the public directory
 * @returns {Promise<tf.LayersModel>} The loaded model
 */
export const loadModel = async () => {
  try {
    console.log('Starting model loading process...');
    
    let model;
    
    // In development, try to load the test model from localStorage first
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('Attempting to load test model from localStorage');
        model = await tf.loadLayersModel('localstorage://test-model');
        console.log('Test model loaded from localStorage');
      } catch (localStorageError) {
        console.warn('Could not load from localStorage, falling back to file model', localStorageError);
        model = await tf.loadLayersModel('/model/model.json');
      }
    } else {
      // In production, always load from file
      model = await tf.loadLayersModel('/model/model.json');
    }
    
    console.log('Model loaded successfully', model);
    
    // Test if the model is actually usable
    try {
      const testTensor = tf.zeros([1, 48]);
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