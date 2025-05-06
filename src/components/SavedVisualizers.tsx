import React from 'react';
import './SavedVisualizers.css';

interface SavedVisualizer {
  id: string;
  title: string;
  imageUrl: string;
  timestamp: string;
}

interface SavedVisualizersProps {
  savedVisualizers: SavedVisualizer[];
  onDelete: (id: string) => void;
}

const SavedVisualizers: React.FC<SavedVisualizersProps> = ({ savedVisualizers, onDelete }) => {
  if (savedVisualizers.length === 0) {
    return null;
  }

  return (
    <div className="saved-visualizers">
      <h3>Saved Visualizations</h3>
      <div className="saved-visualizers-grid">
        {savedVisualizers.map((visualizer) => (
          <div key={visualizer.id} className="saved-visualizer-card">
            <div className="saved-visualizer-header">
              <h4>{visualizer.title}</h4>
              <button 
                className="delete-button"
                onClick={() => onDelete(visualizer.id)}
                aria-label="Delete visualization"
              >
                ×
              </button>
            </div>
            <div className="saved-visualizer-image">
              <img src={visualizer.imageUrl} alt={visualizer.title} />
            </div>
            <div className="saved-visualizer-footer">
              <span className="timestamp">{visualizer.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedVisualizers; 