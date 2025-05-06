import React from 'react';
import RaceResultsTable from '../components/RaceResultsTable';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h1>F1 Race Results</h1>
      <RaceResultsTable />
    </div>
  );
};

export default HomePage; 