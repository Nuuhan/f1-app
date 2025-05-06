import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <h1 className="home-title">Formula Fantasy Tools</h1>
      <div className="tools-grid">
        <Link to="/race-results" className="tool-card">
          <h2>Race Results</h2>
          <p>View detailed race results and statistics</p>
        </Link>
        <Link to="/season-stats" className="tool-card">
          <h2>Season Statistics</h2>
          <p>Explore comprehensive season statistics</p>
        </Link>
        <Link to="/race-visualizer" className="tool-card">
          <h2>Race Visualizer</h2>
          <p>Create and analyze race visualizations</p>
        </Link>
        <Link to="/profile" className="tool-card">
          <h2>My Profile</h2>
          <p>Manage your saved visualizations</p>
        </Link>
      </div>
    </div>
  );
};

export default Home; 