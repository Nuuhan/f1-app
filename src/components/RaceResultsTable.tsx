import React, { useEffect, useState } from 'react';
import './RaceResultsTable.css';

interface RaceResult {
  Track: string;
  Position: string;
  No: string;
  Driver: string;
  Team: string;
  StartingGrid: string;
  Laps: string;
  TimeRetired: string;
  Points: string;
  FastestLap: string;
  FastestLapTime: string;
}

const RaceResultsTable: React.FC = () => {
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaceResults = async () => {
      try {
        // Fetch from public directory
        const response = await fetch('/Formula1_2025Season_RaceResults.csv');
        const csvText = await response.text();

        // Parse CSV robustly
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          setRaceResults([]);
          setLoading(false);
          return;
        }
        const headers = lines[0].split(',').map(h => h.trim());
        const results: RaceResult[] = lines.slice(1)
          .map(line => {
            const cols = line.split(',').map(col => col.trim());
            // Pad with empty strings if columns are missing
            while (cols.length < headers.length) cols.push('');
            return {
              Track: cols[0],
              Position: cols[1],
              No: cols[2],
              Driver: cols[3],
              Team: cols[4],
              StartingGrid: cols[5],
              Laps: cols[6],
              TimeRetired: cols[7],
              Points: cols[8],
              FastestLap: cols[9],
              FastestLapTime: cols[10],
            };
          });

        // Get the latest race (Saudi Arabia)
        const latestRace = results.filter(result => result.Track === 'Saudi Arabia');
        setRaceResults(latestRace);
        setLoading(false);
      } catch (err) {
        setError('Failed to load race results');
        setLoading(false);
      }
    };

    fetchRaceResults();
  }, []);

  if (loading) {
    return <div className="loading">Loading race results...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="race-results-container">
      <h2>Saudi Arabian Grand Prix Results</h2>
      <div className="table-container">
        <table className="race-results-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>No</th>
              <th>Driver</th>
              <th>Team</th>
              <th>Grid</th>
              <th>Laps</th>
              <th>Time/Retired</th>
              <th>Points</th>
              <th>Fastest Lap</th>
            </tr>
          </thead>
          <tbody>
            {raceResults.map((result, index) => (
              <tr key={index} className={result.Position === 'NC' || result.Position === 'DQ' ? 'dnf-row' : ''}>
                <td>{result.Position}</td>
                <td>{result.No}</td>
                <td>{result.Driver}</td>
                <td>{result.Team}</td>
                <td>{result.StartingGrid}</td>
                <td>{result.Laps}</td>
                <td>{result.TimeRetired}</td>
                <td>{result.Points}</td>
                <td>{result.FastestLap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RaceResultsTable; 