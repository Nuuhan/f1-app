import React, { useState, useEffect } from 'react';
import './RaceVisualizer.css';
import SavedVisualizers from '../components/SavedVisualizers';

interface SavedVisualizer {
  id: string;
  title: string;
  imageUrl: string;
  timestamp: string;
}

const RaceVisualizer: React.FC = () => {
    const [plotImage, setPlotImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState('2023');
    const [selectedRace, setSelectedRace] = useState('1');
    const [selectedDriver, setSelectedDriver] = useState('HAM');
    const [activeTool, setActiveTool] = useState('race-positions');
    const [savedVisualizers, setSavedVisualizers] = useState<SavedVisualizer[]>([]);
    const [saveStatus, setSaveStatus] = useState<string>('');

    const years = ['2023', '2024', '2025'];
    
    const raceCalendars: Record<string, Record<string, string>> = {
        '2023': {
            '1': 'Bahrain Grand Prix | Sakhir',
            '2': 'Saudi Arabian Grand Prix | Jeddah',
            '3': 'Australian Grand Prix | Melbourne',
            '4': 'Azerbaijan Grand Prix | Baku',
            '5': 'Miami Grand Prix | Miami',
            '6': 'Emilia Romagna Grand Prix | Imola',
            '7': 'Monaco Grand Prix | Monaco',
            '8': 'Spanish Grand Prix | Barcelona',
            '9': 'Canadian Grand Prix | Montreal',
            '10': 'Austrian Grand Prix | Spielberg',
            '11': 'British Grand Prix | Silverstone',
            '12': 'Hungarian Grand Prix | Budapest',
            '13': 'Belgian Grand Prix | Spa',
            '14': 'Dutch Grand Prix | Zandvoort',
            '15': 'Italian Grand Prix | Monza',
            '16': 'Singapore Grand Prix | Singapore',
            '17': 'Japanese Grand Prix | Suzuka',
            '18': 'Qatar Grand Prix | Lusail',
            '19': 'United States Grand Prix | Austin',
            '20': 'Mexico City Grand Prix | Mexico City',
            '21': 'São Paulo Grand Prix | São Paulo',
            '22': 'Las Vegas Grand Prix | Las Vegas',
            '23': 'Abu Dhabi Grand Prix | Yas Marina'
        },
        '2024': {
            '1': 'Bahrain Grand Prix | Sakhir',
            '2': 'Saudi Arabian Grand Prix | Jeddah',
            '3': 'Australian Grand Prix | Melbourne',
            '4': 'Japanese Grand Prix | Suzuka',
            '5': 'Chinese Grand Prix | Shanghai',
            '6': 'Miami Grand Prix | Miami',
            '7': 'Emilia Romagna Grand Prix | Imola',
            '8': 'Monaco Grand Prix | Monaco',
            '9': 'Canadian Grand Prix | Montreal',
            '10': 'Spanish Grand Prix | Barcelona',
            '11': 'Austrian Grand Prix | Spielberg',
            '12': 'British Grand Prix | Silverstone',
            '13': 'Hungarian Grand Prix | Budapest',
            '14': 'Belgian Grand Prix | Spa',
            '15': 'Dutch Grand Prix | Zandvoort',
            '16': 'Italian Grand Prix | Monza',
            '17': 'Azerbaijan Grand Prix | Baku',
            '18': 'Singapore Grand Prix | Singapore',
            '19': 'United States Grand Prix | Austin',
            '20': 'Mexico City Grand Prix | Mexico City',
            '21': 'São Paulo Grand Prix | São Paulo',
            '22': 'Las Vegas Grand Prix | Las Vegas',
            '23': 'Qatar Grand Prix | Lusail',
            '24': 'Abu Dhabi Grand Prix | Yas Marina'
        },
        '2025': {
            '1': 'Australian Grand Prix | Melbourne',
            '2': 'Chinese Grand Prix | Shanghai',
            '3': 'Japanese Grand Prix | Suzuka',
            '4': 'Bahrain Grand Prix | Sakhir',
            '5': 'Saudi Arabian Grand Prix | Jeddah',
            '6': 'Miami Grand Prix | Miami'
        }
    };

    const drivers = {
        'HAM': 'Lewis Hamilton',
        'VER': 'Max Verstappen',
        'PER': 'Sergio Perez',
        'LEC': 'Charles Leclerc',
        'SAI': 'Carlos Sainz',
        'NOR': 'Lando Norris',
        'RUS': 'George Russell',
        'ALO': 'Fernando Alonso',
        'STR': 'Lance Stroll',
        'OCO': 'Esteban Ocon',
        'GAS': 'Pierre Gasly',
        'TSU': 'Yuki Tsunoda',
        'BOT': 'Valtteri Bottas',
        'ZHO': 'Guanyu Zhou',
        'HUL': 'Nico Hulkenberg',
        'MAG': 'Kevin Magnussen',
        'ALB': 'Alexander Albon',
        'SAR': 'Logan Sargeant',
        'PIA': 'Oscar Piastri',
        'DEV': 'Nyck de Vries'
    };

    // Load saved visualizers from localStorage on component mount
    useEffect(() => {
        const saved = localStorage.getItem('savedVisualizers');
        if (saved) {
            setSavedVisualizers(JSON.parse(saved));
        }
    }, []);

    // Save visualizers to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('savedVisualizers', JSON.stringify(savedVisualizers));
    }, [savedVisualizers]);

    const handleSaveVisualizer = () => {
        if (!plotImage) return;

        // Check if this exact visualization is already saved
        const isDuplicate = savedVisualizers.some(
            v => v.imageUrl === plotImage && v.title === `${selectedYear} ${raceCalendars[selectedYear][selectedRace]}`
        );

        if (isDuplicate) {
            setError('This visualization is already saved');
            return;
        }

        const newVisualizer: SavedVisualizer = {
            id: Date.now().toString(),
            title: `${selectedYear} ${raceCalendars[selectedYear][selectedRace]}`,
            imageUrl: plotImage,
            timestamp: new Date().toLocaleString()
        };

        setSavedVisualizers(prev => {
            const updated = [newVisualizer, ...prev].slice(0, 3); // Keep only the 3 most recent
            return updated;
        });
    };

    const handleDeleteVisualizer = (id: string) => {
        setSavedVisualizers(prev => prev.filter(v => v.id !== id));
    };

    const generatePlot = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching plot from backend...');
            const response = await fetch(`http://localhost:8000/generate-plot?year=${selectedYear}&race=${selectedRace}`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.image) {
                throw new Error('No image data received from server');
            }
            
            setPlotImage(`data:image/png;base64,${data.image}`);
        } catch (err) {
            console.error('Error details:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate plot. Please make sure the Python backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const generateLapTimes = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching lap times plot from backend...');
            const response = await fetch(
                `http://localhost:8000/generate-lap-times?year=${selectedYear}&race=${selectedRace}&driver=${selectedDriver}`
            );
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.image) {
                throw new Error('No image data received from server');
            }
            
            setPlotImage(`data:image/png;base64,${data.image}`);
        } catch (err) {
            console.error('Error details:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate plot. Please make sure the Python backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const generateTeamPace = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching team pace plot from backend...');
            const response = await fetch(
                `http://localhost:8000/generate-team-pace?year=${selectedYear}&race=${selectedRace}`
            );
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.image) {
                throw new Error('No image data received from server');
            }
            
            setPlotImage(`data:image/png;base64,${data.image}`);
        } catch (err) {
            console.error('Error details:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate plot. Please make sure the Python backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const generateTireStrategy = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching tire strategy plot from backend...');
            const response = await fetch(
                `http://localhost:8000/generate-tire-strategy?year=${selectedYear}&race=${selectedRace}`
            );
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.image) {
                throw new Error('No image data received from server');
            }
            
            setPlotImage(`data:image/png;base64,${data.image}`);
        } catch (err) {
            console.error('Error details:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate plot. Please make sure the Python backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const generateLaptimeDistribution = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching laptime distribution plot from backend...');
            const response = await fetch(
                `http://localhost:8000/generate-laptime-distribution?year=${selectedYear}&race=${selectedRace}`
            );
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.image) {
                throw new Error('No image data received from server');
            }
            
            setPlotImage(`data:image/png;base64,${data.image}`);
        } catch (err) {
            console.error('Error details:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate plot. Please make sure the Python backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const generateQualifying = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching qualifying plot from backend...');
            const response = await fetch(
                `http://localhost:8000/generate-qualifying?year=${selectedYear}&race=${selectedRace}`
            );
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.image) {
                throw new Error('No image data received from server');
            }
            
            setPlotImage(`data:image/png;base64,${data.image}`);
        } catch (err) {
            console.error('Error details:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate plot. Please make sure the Python backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToProfile = () => {
        if (!plotImage) {
            setSaveStatus('No visualization to save');
            return;
        }

        const savedVisualizers = JSON.parse(localStorage.getItem('profileVisualizers') || '[]');
        
        // Check if we already have 3 visualizations
        if (savedVisualizers.length >= 3) {
            setSaveStatus('Maximum of 3 visualizations allowed in profile');
            return;
        }

        // Check for duplicates
        const isDuplicate = savedVisualizers.some(
            (v: any) => v.imageUrl === plotImage && v.title === `${selectedYear} ${raceCalendars[selectedYear][selectedRace]}`
        );

        if (isDuplicate) {
            setSaveStatus('This visualization is already saved to your profile');
            return;
        }

        const newVisualizer = {
            id: Date.now().toString(),
            title: `${selectedYear} ${raceCalendars[selectedYear][selectedRace]}`,
            imageUrl: plotImage,
            timestamp: new Date().toLocaleString()
        };

        savedVisualizers.push(newVisualizer);
        localStorage.setItem('profileVisualizers', JSON.stringify(savedVisualizers));
        setSaveStatus('Visualization saved to profile');
    };

    const handleSaveToView = () => {
        if (!plotImage) {
            setSaveStatus('No visualization to save');
            return;
        }

        // Check if we already have 4 visualizations
        if (savedVisualizers.length >= 4) {
            setSaveStatus('Maximum of 4 visualizations allowed in view');
            return;
        }

        // Check for duplicates
        const isDuplicate = savedVisualizers.some(
            v => v.imageUrl === plotImage && v.title === `${selectedYear} ${raceCalendars[selectedYear][selectedRace]}`
        );

        if (isDuplicate) {
            setSaveStatus('This visualization is already saved to view');
            return;
        }

        const newVisualizer: SavedVisualizer = {
            id: Date.now().toString(),
            title: `${selectedYear} ${raceCalendars[selectedYear][selectedRace]}`,
            imageUrl: plotImage,
            timestamp: new Date().toLocaleString()
        };

        setSavedVisualizers(prev => {
            const updated = [newVisualizer, ...prev];
            localStorage.setItem('savedVisualizers', JSON.stringify(updated));
            return updated;
        });
        setSaveStatus('Visualization saved to view');
    };

    // Get the current race calendar based on selected year
    const getCurrentRaceCalendar = () => {
        return raceCalendars[selectedYear] || raceCalendars['2023'];
    };

    // Update the race select options to use the current calendar
    const renderRaceOptions = () => {
        const currentCalendar = getCurrentRaceCalendar();
        return Object.entries(currentCalendar).map(([number, name]) => (
            <option key={number} value={number}>
                {number}. {name}
            </option>
        ));
    };

    const renderToolContent = () => {
        switch (activeTool) {
            case 'race-positions':
                return (
                    <>
                        <div className="selection-container">
                            <div className="select-group">
                                <label htmlFor="year-select">Select Year:</label>
                                <select 
                                    id="year-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="select-input"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="select-group">
                                <label htmlFor="race-select">Select Race:</label>
                                <select 
                                    id="race-select"
                                    value={selectedRace}
                                    onChange={(e) => setSelectedRace(e.target.value)}
                                    className="select-input"
                                >
                                    {renderRaceOptions()}
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={generatePlot} 
                            disabled={loading}
                            className="generate-button"
                        >
                            {loading ? 'Generating...' : 'Generate Race Plot'}
                        </button>
                        
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                                <p>Please make sure:</p>
                                <ul>
                                    <li>The Python backend is running on http://localhost:8000</li>
                                    <li>You have all required Python packages installed</li>
                                    <li>Check the browser console for more details</li>
                                </ul>
                            </div>
                        )}
                    </>
                );
            case 'lap-times':
                return (
                    <>
                        <div className="selection-container">
                            <div className="select-group">
                                <label htmlFor="year-select">Select Year:</label>
                                <select 
                                    id="year-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="select-input"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="select-group">
                                <label htmlFor="race-select">Select Race:</label>
                                <select 
                                    id="race-select"
                                    value={selectedRace}
                                    onChange={(e) => setSelectedRace(e.target.value)}
                                    className="select-input"
                                >
                                    {renderRaceOptions()}
                                </select>
                            </div>

                            <div className="select-group">
                                <label htmlFor="driver-select">Select Driver:</label>
                                <select 
                                    id="driver-select"
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    className="select-input"
                                >
                                    {Object.entries(drivers).map(([code, name]) => (
                                        <option key={code} value={code}>
                                            {code} - {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={generateLapTimes} 
                            disabled={loading}
                            className="generate-button"
                        >
                            {loading ? 'Generating...' : 'Generate Lap Times Plot'}
                        </button>
                        
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                                <p>Please make sure:</p>
                                <ul>
                                    <li>The Python backend is running on http://localhost:8000</li>
                                    <li>You have all required Python packages installed</li>
                                    <li>Check the browser console for more details</li>
                                </ul>
                            </div>
                        )}
                    </>
                );
            case 'team-pace':
                return (
                    <>
                        <div className="selection-container">
                            <div className="select-group">
                                <label htmlFor="year-select">Select Year:</label>
                                <select 
                                    id="year-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="select-input"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="select-group">
                                <label htmlFor="race-select">Select Race:</label>
                                <select 
                                    id="race-select"
                                    value={selectedRace}
                                    onChange={(e) => setSelectedRace(e.target.value)}
                                    className="select-input"
                                >
                                    {renderRaceOptions()}
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={generateTeamPace} 
                            disabled={loading}
                            className="generate-button"
                        >
                            {loading ? 'Generating...' : 'Generate Team Pace Plot'}
                        </button>
                        
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                                <p>Please make sure:</p>
                                <ul>
                                    <li>The Python backend is running on http://localhost:8000</li>
                                    <li>You have all required Python packages installed</li>
                                    <li>Check the browser console for more details</li>
                                </ul>
                            </div>
                        )}
                    </>
                );
            case 'tire-strategy':
                return (
                    <>
                        <div className="selection-container">
                            <div className="select-group">
                                <label htmlFor="year-select">Select Year:</label>
                                <select 
                                    id="year-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="select-input"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="select-group">
                                <label htmlFor="race-select">Select Race:</label>
                                <select 
                                    id="race-select"
                                    value={selectedRace}
                                    onChange={(e) => setSelectedRace(e.target.value)}
                                    className="select-input"
                                >
                                    {renderRaceOptions()}
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={generateTireStrategy} 
                            disabled={loading}
                            className="generate-button"
                        >
                            {loading ? 'Generating...' : 'Generate Tire Strategy Plot'}
                        </button>
                        
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                                <p>Please make sure:</p>
                                <ul>
                                    <li>The Python backend is running on http://localhost:8000</li>
                                    <li>You have all required Python packages installed</li>
                                    <li>Check the browser console for more details</li>
                                </ul>
                            </div>
                        )}
                    </>
                );
            case 'laptime-distribution':
                return (
                    <>
                        <div className="selection-container">
                            <div className="select-group">
                                <label htmlFor="year-select">Select Year:</label>
                                <select 
                                    id="year-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="select-input"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="select-group">
                                <label htmlFor="race-select">Select Race:</label>
                                <select 
                                    id="race-select"
                                    value={selectedRace}
                                    onChange={(e) => setSelectedRace(e.target.value)}
                                    className="select-input"
                                >
                                    {renderRaceOptions()}
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={generateLaptimeDistribution} 
                            disabled={loading}
                            className="generate-button"
                        >
                            {loading ? 'Generating...' : 'Generate Lap Time Distribution Plot'}
                        </button>
                        
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                                <p>Please make sure:</p>
                                <ul>
                                    <li>The Python backend is running on http://localhost:8000</li>
                                    <li>You have all required Python packages installed</li>
                                    <li>Check the browser console for more details</li>
                                </ul>
                            </div>
                        )}
                    </>
                );
            case 'qualifying':
                return (
                    <>
                        <div className="selection-container">
                            <div className="select-group">
                                <label htmlFor="year-select">Select Year:</label>
                                <select 
                                    id="year-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="select-input"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="select-group">
                                <label htmlFor="race-select">Select Race:</label>
                                <select 
                                    id="race-select"
                                    value={selectedRace}
                                    onChange={(e) => setSelectedRace(e.target.value)}
                                    className="select-input"
                                >
                                    {renderRaceOptions()}
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={generateQualifying} 
                            disabled={loading}
                            className="generate-button"
                        >
                            {loading ? 'Generating...' : 'Generate Qualifying Results Plot'}
                        </button>
                        
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                                <p>Please make sure:</p>
                                <ul>
                                    <li>The Python backend is running on http://localhost:8000</li>
                                    <li>You have all required Python packages installed</li>
                                    <li>Check the browser console for more details</li>
                                </ul>
                            </div>
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="race-visualizer">
            <h1>F1 Race Visualizers</h1>
            
            <div className="tool-buttons">
                <button 
                    className={`tool-button ${activeTool === 'race-positions' ? 'active' : ''}`}
                    onClick={() => setActiveTool('race-positions')}
                >
                    Race Positions
                </button>
                <button 
                    className={`tool-button ${activeTool === 'lap-times' ? 'active' : ''}`}
                    onClick={() => setActiveTool('lap-times')}
                >
                    Lap Times
                </button>
                <button 
                    className={`tool-button ${activeTool === 'team-pace' ? 'active' : ''}`}
                    onClick={() => setActiveTool('team-pace')}
                >
                    Team Pace
                </button>
                <button 
                    className={`tool-button ${activeTool === 'tire-strategy' ? 'active' : ''}`}
                    onClick={() => setActiveTool('tire-strategy')}
                >
                    Tire Strategy
                </button>
                <button 
                    className={`tool-button ${activeTool === 'laptime-distribution' ? 'active' : ''}`}
                    onClick={() => setActiveTool('laptime-distribution')}
                >
                    Lap Time Distribution
                </button>
                <button 
                    className={`tool-button ${activeTool === 'qualifying' ? 'active' : ''}`}
                    onClick={() => setActiveTool('qualifying')}
                >
                    Qualifying Results
                </button>
            </div>

            <div className="tool-content">
                {renderToolContent()}
            </div>

            {plotImage && (
                <div className="plot-container">
                    <img src={plotImage} alt="Race visualization" />
                    <div className="save-buttons">
                        <button 
                            className="save-button"
                            onClick={handleSaveToProfile}
                        >
                            Save to Profile
                        </button>
                        <button 
                            className="save-button"
                            onClick={handleSaveToView}
                        >
                            Save to View
                        </button>
                    </div>
                    {saveStatus && (
                        <div className={`save-status ${saveStatus.includes('Maximum') || saveStatus.includes('already') ? 'error' : 'success'}`}>
                            {saveStatus}
                        </div>
                    )}
                </div>
            )}

            <SavedVisualizers
                savedVisualizers={savedVisualizers}
                onDelete={handleDeleteVisualizer}
            />
        </div>
    );
};

export default RaceVisualizer; 