import React, { useState, useEffect } from 'react';
import './ModelSelector.css';
import ollamaService from '../services/ollama';

// Model categories and recommended use cases
const MODEL_CATEGORIES = {
  'llama3': { category: 'General Purpose', description: 'Good for general conversations and diverse tasks' },
  'llama2': { category: 'General Purpose', description: 'Balanced model for various tasks' },
  'mistral': { category: 'General Purpose', description: 'Efficient with good performance' },
  'gemma': { category: 'General Purpose', description: 'Lightweight yet capable model' },
  'phi': { category: 'Small & Efficient', description: 'Small but powerful model' },
  'mixtral': { category: 'High Performance', description: 'High quality responses for complex tasks' },
  'falcon': { category: 'Balanced', description: 'Good balance of size and performance' },
  'codellama': { category: 'Code Specialist', description: 'Specialized for programming tasks' },
  'codegemma': { category: 'Code Specialist', description: 'Optimized for code generation' },
  'solar': { category: 'High Performance', description: 'Strong reasoning capabilities' },
  'nous-hermes': { category: 'Fine-tuned', description: 'Instruction-tuned for helpfulness' },
  'neural-chat': { category: 'Conversational', description: 'Optimized for natural conversations' },
  'stablelm': { category: 'Efficient', description: 'Stable text generation' },
  'yi': { category: 'High Performance', description: 'Strong multilingual capabilities' },
};

// Get model info from name - handles different model naming patterns
const getModelInfo = (modelName) => {
  const nameLower = modelName.toLowerCase();
  
  // Extract base model name (e.g., "llama3" from "llama3:8b")
  let baseModel = null;
  
  for (const model of Object.keys(MODEL_CATEGORIES)) {
    if (nameLower.includes(model)) {
      baseModel = model;
      break;
    }
  }
  
  // Get size info if available (e.g., "8b" from "llama3:8b")
  let size = '';
  if (nameLower.includes(':')) {
    const parts = nameLower.split(':');
    if (parts.length > 1 && parts[1].includes('b')) {
      size = parts[1].toUpperCase();
    }
  } else if (nameLower.includes('-')) {
    const parts = nameLower.split('-');
    if (parts.length > 1 && parts[parts.length-1].includes('b')) {
      size = parts[parts.length-1].toUpperCase();
    }
  }
  
  return {
    baseModel,
    size,
    ...((baseModel && MODEL_CATEGORIES[baseModel]) || { 
      category: 'Other', 
      description: 'Specialized model' 
    })
  };
};

const ModelSelector = ({ onModelSelect, selectedModel, ollamaAvailable }) => {
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredModel, setHoveredModel] = useState(null);

  useEffect(() => {
    // Only attempt to fetch models if Ollama is available
    if (ollamaAvailable) {
      fetchAvailableModels();
    } else {
      setIsLoading(false);
    }
  }, [ollamaAvailable]);

  const fetchAvailableModels = async () => {
    try {
      setIsLoading(true);
      const models = await ollamaService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (model) => {
    onModelSelect(model);
    setIsExpanded(false);
  };
  
  // Filter models based on search term
  const filteredModels = availableModels.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group models by category
  const groupedModels = filteredModels.reduce((acc, model) => {
    const { category } = getModelInfo(model.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(model);
    return acc;
  }, {});
  
  // Get info about currently selected model
  const selectedModelInfo = selectedModel ? getModelInfo(selectedModel) : null;

  if (!ollamaAvailable) {
    return (
      <div className="model-selector model-unavailable">
        <div className="selected-model">
          <span className="model-icon">⚠️</span>
          <span className="model-name">Ollama unavailable</span>
          <span className="model-status error">✕</span>
        </div>
        <div className="model-unavailable-message">
          Please make sure Ollama is running on your system
        </div>
      </div>
    );
  }

  return (
    <div className={`model-selector ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className="selected-model" 
        onClick={() => setIsExpanded(!isExpanded)}
        title={selectedModelInfo?.description || 'Select a model'}
      >
        <span className="model-icon">{selectedModel ? '🤖' : '📋'}</span>
        <div className="model-info">
          <span className="model-name">
            {isLoading ? 'Loading models...' : (selectedModel || 'Select model')}
          </span>
          {selectedModel && selectedModelInfo && (
            <span className="model-category">{selectedModelInfo.category}{selectedModelInfo.size ? ` (${selectedModelInfo.size})` : ''}</span>
          )}
        </div>
        <span className="model-status">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d={isExpanded ? "M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" : "M12 16l-6-6 1.41-1.41L12 13.17l4.59-4.58L18 10z"}/>
            </svg>
          )}
        </span>
      </div>
      
      {isExpanded && (
        <div className="model-dropdown">
          <div className="model-search">
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm('');
                }}
              >
                ×
              </button>
            )}
          </div>
          
          <div className="models-list">
            {Object.entries(groupedModels).length > 0 ? (
              Object.entries(groupedModels).map(([category, models]) => (
                <div key={category} className="model-category-group">
                  <div className="category-header">{category}</div>
                  {models.map((model) => {
                    const modelInfo = getModelInfo(model.name);
                    return (
                      <div 
                        key={model.name} 
                        className={`model-option ${selectedModel === model.name ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModelSelect(model.name);
                        }}
                        onMouseEnter={() => setHoveredModel(model.name)}
                        onMouseLeave={() => setHoveredModel(null)}
                      >
                        <div className="model-option-main">
                          <span className="model-name">{model.name}</span>
                          <span className="model-size">{(model.size / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
                        </div>
                        {(hoveredModel === model.name || selectedModel === model.name) && modelInfo.description && (
                          <div className="model-description">{modelInfo.description}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              searchTerm ? (
                <div className="model-option disabled">No matching models found</div>
              ) : (
                <div className="model-option disabled">No models available</div>
              )
            )}
          </div>
          
          <div className="model-actions">
            <button className="model-refresh" onClick={(e) => {
              e.stopPropagation();
              fetchAvailableModels();
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M5.463 4.433A9.961 9.961 0 0 1 12 2c5.523 0 10 4.477 10 10 0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228l-.997-1.795zm13.074 15.134A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772l.997 1.795z"/>
              </svg>
              Refresh models
            </button>
            <a 
              className="help-link" 
              href="https://ollama.com/library" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 0 1 1-1 1.5 1.5 0 1 0-1.471-1.794l-1.962-.393A3.501 3.501 0 1 1 13 13.355z"/>
              </svg>
              Get more models
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
