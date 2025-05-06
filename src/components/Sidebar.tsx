import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-content">
        <Link to="/" className="sidebar-button">
          <span className="icon">🏠</span>
          {isExpanded && <span className="text">Home</span>}
        </Link>
        <Link to="/season-stats" className="sidebar-button">
          <span className="icon">📊</span>
          {isExpanded && <span className="text">Season Stats</span>}
        </Link>
        <Link to="/predictions" className="sidebar-button">
          <span className="icon">🔮</span>
          {isExpanded && <span className="text">Our Predictions</span>}
        </Link>
        <Link to="/visualisers" className="sidebar-button">
          <span className="icon">📈</span>
          {isExpanded && <span className="text">Visualisers</span>}
        </Link>
        <Link to="/news" className="sidebar-button">
          <span className="icon">📰</span>
          {isExpanded && <span className="text">News</span>}
        </Link>
        <Link to="/profile" className="sidebar-button">
          <span className="icon">👤</span>
          {isExpanded && <span className="text">Profile</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar; 