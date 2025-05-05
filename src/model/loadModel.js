import * as tf from '@tensorflow/tfjs';

/**
 * Loads the TensorFlow.js model from the public directory
 * @returns {Promise<tf.LayersModel>} The loaded model
 */
export const loadModel = async () => {
  try {
    const model = await tf.loadLayersModel('/model/model.json');
    console.log('Model loaded successfully');
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
    // Create a tensor from the input vector
    const inputTensor = tf.tensor2d([inputVector]);
    
    // Run prediction
    const prediction = await model.predict(inputTensor);
    
    // Convert to array and clean up tensors
    const result = await prediction.data();
    inputTensor.dispose();
    prediction.dispose();
    
    return Array.from(result);
  } catch (error) {
    console.error('Prediction error:', error);
    throw new Error('Failed to process your message');
  }
}; 