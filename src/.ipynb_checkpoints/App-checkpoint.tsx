import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import SeasonStats from './pages/SeasonStats';
import NewsPage from './pages/NewsPage';
import TeamMaker from './pages/TeamMaker';
import ThemeToggle from './components/ThemeToggle';
import Profile from './pages/Profile';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Router>
      <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`} data-theme={isDarkMode ? 'dark' : 'light'}>
        <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
        <div className="sidebar">
          <div className="sidebar-header">
            <h1>F1 Stats</h1>
          </div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/season-stats">Season Stats</Link>
              </li>
              <li>
                <Link to="/news">News</Link>
              </li>
              <li>
                <Link to="/predictions">Our Predictions</Link>
              </li>
              <li>
                <Link to="/team-maker">Team Maker</Link>
              </li>
              <li>
                <Link to="/visualisers">Visualisers</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
            </ul>
          </nav>
        </div>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/season-stats" element={<SeasonStats />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/predictions" element={<div className="placeholder-page">Our Predictions Page Coming Soon</div>} />
            <Route path="/team-maker" element={<TeamMaker />} />
            <Route path="/visualisers" element={<div className="placeholder-page">Visualisers Page Coming Soon</div>} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
