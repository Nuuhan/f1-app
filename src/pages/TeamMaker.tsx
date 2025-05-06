import React, { useState, useEffect } from 'react';
import './TeamMaker.css';

interface Driver {
  id: string;
  name: string;
  team: string;
  cost: number;
}

interface Constructor {
  id: string;
  name: string;
}

interface Team {
  id: number;
  name: string;
  drivers: Driver[];
  constructors: Constructor[];
  budget: number;
}

const mockDrivers: Driver[] = [
  { id: 'VER', name: 'Max Verstappen', team: 'Red Bull', cost: 30.5 },
  { id: 'PER', name: 'Sergio Perez', team: 'Red Bull', cost: 20.0 },
  { id: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', cost: 28.0 },
  { id: 'RUS', name: 'George Russell', team: 'Mercedes', cost: 22.0 },
  { id: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', cost: 25.0 },
  { id: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', cost: 18.5 },
  { id: 'NOR', name: 'Lando Norris', team: 'McLaren', cost: 24.0 },
  { id: 'PIA', name: 'Oscar Piastri', team: 'McLaren', cost: 15.0 },
  { id: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', cost: 19.0 },
  { id: 'STR', name: 'Lance Stroll', team: 'Aston Martin', cost: 12.0 },
  { id: 'GAS', name: 'Pierre Gasly', team: 'Alpine', cost: 14.0 },
  { id: 'OCO', name: 'Esteban Ocon', team: 'Alpine', cost: 13.5 },
  { id: 'TSU', name: 'Yuki Tsunoda', team: 'RB', cost: 10.0 },
  { id: 'RIC', name: 'Daniel Ricciardo', team: 'RB', cost: 11.0 },
  { id: 'BOT', name: 'Valtteri Bottas', team: 'Sauber', cost: 9.0 },
  { id: 'ZHO', name: 'Zhou Guanyu', team: 'Sauber', cost: 8.0 },
  { id: 'MAG', name: 'Kevin Magnussen', team: 'Haas', cost: 7.5 },
  { id: 'HUL', name: 'Nico Hulkenberg', team: 'Haas', cost: 7.0 },
  { id: 'ALB', name: 'Alexander Albon', team: 'Williams', cost: 8.5 },
  { id: 'SAR', name: 'Logan Sargeant', team: 'Williams', cost: 6.5 },
];

const mockConstructors: Constructor[] = [
  { id: 'RB', name: 'Red Bull' },
  { id: 'MER', name: 'Mercedes' },
  { id: 'FER', name: 'Ferrari' },
  { id: 'MCL', name: 'McLaren' },
  { id: 'AM', name: 'Aston Martin' },
  { id: 'ALP', name: 'Alpine' },
  { id: 'VCARB', name: 'RB' },
  { id: 'SAU', name: 'Sauber' },
  { id: 'HAS', name: 'Haas' },
  { id: 'WIL', name: 'Williams' },
];

const TeamMaker: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Team 1', drivers: [], constructors: [], budget: 100 },
    { id: 2, name: 'Team 2', drivers: [], constructors: [], budget: 100 },
    { id: 3, name: 'Team 3', drivers: [], constructors: [], budget: 100 },
  ]);
  const [activeTeam, setActiveTeam] = useState<number>(1);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Load teams from localStorage when component mounts
  useEffect(() => {
    const savedTeams = localStorage.getItem('f1-fantasy-teams');
    if (savedTeams) {
      try {
        const parsedTeams = JSON.parse(savedTeams);
        setTeams(parsedTeams);
      } catch (error) {
        console.error('Error loading saved teams:', error);
      }
    }
  }, []);

  const handleSaveTeams = () => {
    try {
      localStorage.setItem('f1-fantasy-teams', JSON.stringify(teams));
      setSaveStatus('Teams saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error('Error saving teams:', error);
      setSaveStatus('Error saving teams. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleResetTeams = () => {
    if (window.confirm('Are you sure you want to reset all teams? This cannot be undone.')) {
      const resetTeams = [
        { id: 1, name: 'Team 1', drivers: [], constructors: [], budget: 100 },
        { id: 2, name: 'Team 2', drivers: [], constructors: [], budget: 100 },
        { id: 3, name: 'Team 3', drivers: [], constructors: [], budget: 100 },
      ];
      setTeams(resetTeams);
      localStorage.setItem('f1-fantasy-teams', JSON.stringify(resetTeams));
      setSaveStatus('Teams reset successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleDriverSelect = (teamId: number, driverId: string, position: number) => {
    setTeams(prevTeams => {
      const selectedDriver = mockDrivers.find(d => d.id === driverId);
      if (!selectedDriver) return prevTeams;

      return prevTeams.map(team => {
        if (team.id === teamId) {
          const newDrivers = [...team.drivers];
          newDrivers[position] = selectedDriver;
          
          // Calculate new budget
          const totalCost = newDrivers.reduce((sum, driver) => sum + (driver?.cost || 0), 0);
          
          return {
            ...team,
            drivers: newDrivers,
            budget: 100 - totalCost
          };
        }
        return team;
      });
    });
  };

  const handleConstructorSelect = (teamId: number, constructorId: string, position: number) => {
    setTeams(prevTeams => {
      const selectedConstructor = mockConstructors.find(c => c.id === constructorId);
      if (!selectedConstructor) return prevTeams;

      return prevTeams.map(team => {
        if (team.id === teamId) {
          const newConstructors = [...team.constructors];
          newConstructors[position] = selectedConstructor;
          return { ...team, constructors: newConstructors };
        }
        return team;
      });
    });
  };

  const getAvailableDrivers = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    const selectedDriverIds = team?.drivers.map(d => d?.id).filter(Boolean) || [];
    return mockDrivers.filter(driver => !selectedDriverIds.includes(driver.id));
  };

  const getAvailableConstructors = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    const selectedConstructorIds = team?.constructors.map(c => c?.id).filter(Boolean) || [];
    return mockConstructors.filter(constructor => !selectedConstructorIds.includes(constructor.id));
  };

  const getSelectedDriver = (teamId: number, position: number) => {
    const team = teams.find(t => t.id === teamId);
    return team?.drivers[position] || null;
  };

  const getSelectedConstructor = (teamId: number, position: number) => {
    const team = teams.find(t => t.id === teamId);
    return team?.constructors[position] || null;
  };

  return (
    <div className="team-maker">
      <div className="team-actions">
        <div className="action-buttons">
          <button onClick={handleSaveTeams} className="save-button">
            Save Teams
          </button>
          <button onClick={handleResetTeams} className="reset-button">
            Reset All Teams
          </button>
          <button 
            onClick={() => window.open('https://datadr1ven.github.io/teamtool/', '_blank')}
            className="evaluator-button"
          >
            Open Team Evaluator
          </button>
        </div>
        {saveStatus && <div className="save-status">{saveStatus}</div>}
      </div>

      <div className="team-selector">
        {teams.map(team => (
          <button
            key={team.id}
            className={`team-tab ${activeTeam === team.id ? 'active' : ''}`}
            onClick={() => setActiveTeam(team.id)}
          >
            {team.name}
          </button>
        ))}
      </div>

      {teams.map(team => (
        <div key={team.id} className={`team-content ${activeTeam === team.id ? 'active' : ''}`}>
          <div className="team-header">
            <h2>{team.name}</h2>
            <div className="budget-display">
              Remaining Budget: <span className="budget-amount">${team.budget.toFixed(1)}M</span>
            </div>
          </div>

          <div className="team-selection">
            <div className="drivers-section">
              <h3>Drivers</h3>
              {[...Array(5)].map((_, index) => {
                const selectedDriver = getSelectedDriver(team.id, index);
                const availableDrivers = getAvailableDrivers(team.id);
                // Add the selected driver back to the options if it exists
                if (selectedDriver && !availableDrivers.find(d => d.id === selectedDriver.id)) {
                  availableDrivers.push(selectedDriver);
                }
                return (
                  <div key={index} className="selection-row">
                    <label>Driver {index + 1}:</label>
                    <select
                      value={selectedDriver?.id || ''}
                      onChange={(e) => handleDriverSelect(team.id, e.target.value, index)}
                      className={selectedDriver ? 'has-value' : ''}
                    >
                      <option value="">Select a driver</option>
                      {availableDrivers
                        .sort((a, b) => a.cost - b.cost)
                        .map(driver => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} (${driver.cost}M)
                          </option>
                        ))}
                    </select>
                    {selectedDriver && (
                      <span className="selected-cost">${selectedDriver.cost}M</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="constructors-section">
              <h3>Constructors</h3>
              {[...Array(2)].map((_, index) => {
                const selectedConstructor = getSelectedConstructor(team.id, index);
                const availableConstructors = getAvailableConstructors(team.id);
                // Add the selected constructor back to the options if it exists
                if (selectedConstructor && !availableConstructors.find(c => c.id === selectedConstructor.id)) {
                  availableConstructors.push(selectedConstructor);
                }
                return (
                  <div key={index} className="selection-row">
                    <label>Constructor {index + 1}:</label>
                    <select
                      value={selectedConstructor?.id || ''}
                      onChange={(e) => handleConstructorSelect(team.id, e.target.value, index)}
                      className={selectedConstructor ? 'has-value' : ''}
                    >
                      <option value="">Select a constructor</option>
                      {availableConstructors.map(constructor => (
                        <option key={constructor.id} value={constructor.id}>
                          {constructor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamMaker; 