import React, { useState, useEffect } from 'react';
import './Profile.css';

interface SavedVisualizer {
  id: string;
  title: string;
  imageUrl: string;
  timestamp: string;
}

interface UserPreferences {
  favoriteDriver: string;
  favoriteTeam: string;
}

interface UsageStats {
  lastAccessed: string;
  totalVisualizations: number;
  mostUsedVisualizer: string;
  mostViewedRace: string;
}

interface DriverStats {
  position: string;
  points: string;
  team: string;
  fastestLap: string;
  fastestLapTime: string;
}

interface ConstructorStats {
  totalPoints: number;
  position: number;
  drivers: {
    [key: string]: DriverStats;
  };
}

const Profile: React.FC = () => {
  const [savedVisualizers, setSavedVisualizers] = useState<SavedVisualizer[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      favoriteDriver: '',
      favoriteTeam: ''
    };
  });
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null);
  const [constructorStats, setConstructorStats] = useState<ConstructorStats | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>(() => {
    const saved = localStorage.getItem('usageStats');
    return saved ? JSON.parse(saved) : {
      lastAccessed: new Date().toISOString(),
      totalVisualizations: 0,
      mostUsedVisualizer: 'None',
      mostViewedRace: 'None'
    };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('profileVisualizers');
    if (saved) {
      const visualizers = JSON.parse(saved);
      setSavedVisualizers(visualizers);
      
      // Update usage stats
      setUsageStats(prev => {
        const newStats = {
          ...prev,
          lastAccessed: new Date().toISOString(),
          totalVisualizations: visualizers.length,
          mostUsedVisualizer: visualizers.length > 0 
            ? visualizers.reduce((most: SavedVisualizer, current: SavedVisualizer) => 
                most.timestamp > current.timestamp ? most : current
              ).title
            : 'None',
          mostViewedRace: visualizers.length > 0
            ? visualizers.reduce((most: SavedVisualizer, current: SavedVisualizer) => 
                most.timestamp > current.timestamp ? most : current
              ).title.split(' - ')[0]
            : 'None'
        };
        localStorage.setItem('usageStats', JSON.stringify(newStats));
        return newStats;
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/Formula1_2025Season_RaceResults.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim());
        const results = lines.slice(1).map(line => {
          const cols = line.split(',').map(col => col.trim());
          return {
            Track: cols[0],
            Position: cols[1],
            No: cols[2],
            Driver: cols[3],
            Team: cols[4],
            Points: cols[8],
            FastestLap: cols[9],
            FastestLapTime: cols[10]
          };
        });

        // Get Saudi Arabia results
        const saudiResults = results.filter(r => r.Track === 'Saudi Arabia');

        // Find favorite driver stats
        if (preferences.favoriteDriver) {
          const driverResult = saudiResults.find(r => r.Driver === preferences.favoriteDriver);
          if (driverResult) {
            setDriverStats({
              position: driverResult.Position,
              points: driverResult.Points,
              team: driverResult.Team,
              fastestLap: driverResult.FastestLap,
              fastestLapTime: driverResult.FastestLapTime
            });
          }
        }

        // Calculate constructor stats
        if (preferences.favoriteTeam) {
          const teamResults = saudiResults.filter(r => r.Team === preferences.favoriteTeam);
          const totalPoints = teamResults.reduce((sum, r) => sum + Number(r.Points), 0);
          
          // Calculate constructor position based on total points
          const allTeams = Array.from(new Set(results.map(r => r.Team)));
          const teamPoints = allTeams.map(team => {
            const teamDrivers = saudiResults.filter(r => r.Team === team);
            return {
              team,
              points: teamDrivers.reduce((sum, r) => sum + Number(r.Points), 0)
            };
          });
          
          teamPoints.sort((a, b) => b.points - a.points);
          const position = teamPoints.findIndex(t => t.team === preferences.favoriteTeam) + 1;

          setConstructorStats({
            totalPoints,
            position,
            drivers: teamResults.reduce((acc, r) => ({
              ...acc,
              [r.Driver]: {
                position: r.Position,
                points: r.Points,
                team: r.Team,
                fastestLap: r.FastestLap,
                fastestLapTime: r.FastestLapTime
              }
            }), {})
          });
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load statistics');
        setLoading(false);
      }
    };

    if (preferences.favoriteDriver || preferences.favoriteTeam) {
      fetchStats();
    }
  }, [preferences.favoriteDriver, preferences.favoriteTeam]);

  const handleDeleteVisualizer = (id: string) => {
    setSavedVisualizers(prev => {
      const updated = prev.filter(v => v.id !== id);
      localStorage.setItem('profileVisualizers', JSON.stringify(updated));
      return updated;
    });
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="profile">
      <h1>My Profile</h1>
      
      <div className="profile-grid">
        <div className="profile-section preferences-section">
          <h2>Preferences</h2>
          <div className="preferences-form">
            <div className="preference-item">
              <label htmlFor="favoriteDriver">Favorite Driver:</label>
              <select
                id="favoriteDriver"
                value={preferences.favoriteDriver}
                onChange={(e) => handlePreferenceChange('favoriteDriver', e.target.value)}
              >
                <option value="">Select Driver</option>
                <option value="Max Verstappen">Max Verstappen</option>
                <option value="Lewis Hamilton">Lewis Hamilton</option>
                <option value="Charles Leclerc">Charles Leclerc</option>
                <option value="Lando Norris">Lando Norris</option>
                <option value="George Russell">George Russell</option>
                <option value="Carlos Sainz">Carlos Sainz</option>
                <option value="Fernando Alonso">Fernando Alonso</option>
                <option value="Oscar Piastri">Oscar Piastri</option>
                <option value="Sergio Perez">Sergio Perez</option>
                <option value="Lance Stroll">Lance Stroll</option>
              </select>
            </div>
            
            <div className="preference-item">
              <label htmlFor="favoriteTeam">Favorite Team:</label>
              <select
                id="favoriteTeam"
                value={preferences.favoriteTeam}
                onChange={(e) => handlePreferenceChange('favoriteTeam', e.target.value)}
              >
                <option value="">Select Team</option>
                <option value="Red Bull Racing">Red Bull Racing</option>
                <option value="Mercedes">Mercedes</option>
                <option value="Ferrari">Ferrari</option>
                <option value="McLaren">McLaren</option>
                <option value="Aston Martin">Aston Martin</option>
                <option value="Alpine">Alpine</option>
                <option value="Williams">Williams</option>
                <option value="RB">RB</option>
                <option value="Sauber">Sauber</option>
                <option value="Haas F1 Team">Haas F1 Team</option>
              </select>
            </div>
          </div>
        </div>

        <div className="profile-section stats-section">
          <h2>Statistics</h2>
          {loading ? (
            <p className="loading">Loading statistics...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="stats-grid">
              <div className="stat-card usage-stats">
                <h3>Usage Statistics</h3>
                <div className="stat-content">
                  <div className="stat-row">
                    <span className="stat-label">Last Accessed:</span>
                    <span className="stat-value">{new Date(usageStats.lastAccessed).toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Total Visualizations:</span>
                    <span className="stat-value">{usageStats.totalVisualizations}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Most Used Visualizer:</span>
                    <span className="stat-value">{usageStats.mostUsedVisualizer}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Most Viewed Race:</span>
                    <span className="stat-value">{usageStats.mostViewedRace}</span>
                  </div>
                </div>
              </div>

              {preferences.favoriteDriver && driverStats && (
                <div className="stat-card driver-stats">
                  <h3>Favorite Driver: {preferences.favoriteDriver}</h3>
                  <div className="stat-content">
                    <div className="stat-row">
                      <span className="stat-label">Saudi Arabia Position:</span>
                      <span className="stat-value">{driverStats.position}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Points in Saudi Arabia:</span>
                      <span className="stat-value">{driverStats.points}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Fastest Lap:</span>
                      <span className="stat-value">{driverStats.fastestLap}</span>
                    </div>
                    {driverStats.fastestLapTime && (
                      <div className="stat-row">
                        <span className="stat-label">Fastest Lap Time:</span>
                        <span className="stat-value">{driverStats.fastestLapTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {preferences.favoriteTeam && constructorStats && (
                <div className="stat-card constructor-stats">
                  <h3>Favorite Team: {preferences.favoriteTeam}</h3>
                  <div className="stat-content">
                    <div className="stat-row">
                      <span className="stat-label">Constructor Position:</span>
                      <span className="stat-value">{constructorStats.position}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Total Points in Saudi Arabia:</span>
                      <span className="stat-value">{constructorStats.totalPoints}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Team Drivers:</span>
                      <div className="drivers-list">
                        {Object.entries(constructorStats.drivers).map(([driver, stats]) => (
                          <div key={driver} className="driver-result">
                            <span className="driver-name">{driver}</span>
                            <span className="driver-position">P{stats.position}</span>
                            <span className="driver-points">{stats.points} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2>Saved Visualizations</h2>
        {savedVisualizers.length === 0 ? (
          <p className="no-visualizations">No visualizations saved to profile yet.</p>
        ) : (
          <div className="visualizations-grid">
            {savedVisualizers.map((visualizer) => (
              <div key={visualizer.id} className="visualization-card">
                <div className="visualization-header">
                  <h3>{visualizer.title}</h3>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteVisualizer(visualizer.id)}
                    aria-label="Delete visualization"
                  >
                    ×
                  </button>
                </div>
                <div className="visualization-image">
                  <img src={visualizer.imageUrl} alt={visualizer.title} />
                </div>
                <div className="visualization-footer">
                  <span className="timestamp">{visualizer.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 