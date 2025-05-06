import React, { useEffect, useState } from 'react';
import './DriverStandingsTable.css';

interface RaceResult {
  Track: string;
  Position: string;
  No: string;
  Driver: string;
  Team: string;
  Points: string;
}

interface DriverStanding {
  driver: string;
  team: string;
  totalPoints: number;
  raceResults: { [key: string]: string };
}

const DriverStandingsTable: React.FC = () => {
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState('2025');

  const seasons = ['2025', '2024', '2023', '2022'];

  useEffect(() => {
    const fetchRaceResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/Formula1_${selectedSeason}Season_RaceResults.csv`);
        const csvText = await response.text();

        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          setDriverStandings([]);
          setLoading(false);
          return;
        }

        const results: RaceResult[] = lines.slice(1).map(line => {
          const cols = line.split(',').map(col => col.trim());
          return {
            Track: cols[0],
            Position: cols[1],
            No: cols[2],
            Driver: cols[3],
            Team: cols[4],
            Points: cols[8]
          };
        });

        // Process results to calculate standings
        const standingsMap = new Map<string, DriverStanding>();

        results.forEach(result => {
          if (!standingsMap.has(result.Driver)) {
            standingsMap.set(result.Driver, {
              driver: result.Driver,
              team: result.Team,
              totalPoints: 0,
              raceResults: {}
            });
          }

          const standing = standingsMap.get(result.Driver)!;
          const points = parseInt(result.Points) || 0;
          standing.totalPoints += points;
          standing.raceResults[result.Track] = result.Position;
        });

        // Convert to array and sort by total points
        const standings = Array.from(standingsMap.values())
          .sort((a, b) => b.totalPoints - a.totalPoints);

        setDriverStandings(standings);
        setLoading(false);
      } catch (err) {
        setError('Failed to load driver standings');
        setLoading(false);
      }
    };

    fetchRaceResults();
  }, [selectedSeason]);

  if (loading) {
    return <div className="loading">Loading driver standings...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Get unique races for the selected season
  const races = Array.from(new Set(driverStandings.flatMap(d => Object.keys(d.raceResults)))).sort();

  return (
    <div className="driver-standings-container">
      <div className="season-selector">
        <h2>F1 Driver Standings</h2>
        <select 
          value={selectedSeason} 
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="season-select"
        >
          {seasons.map(season => (
            <option key={season} value={season}>{season} Season</option>
          ))}
        </select>
      </div>
      <div className="table-container">
        <table className="driver-standings-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Driver</th>
              <th>Team</th>
              {races.map(race => (
                <th key={race}>{race}</th>
              ))}
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {driverStandings.map((standing, index) => (
              <tr key={standing.driver}>
                <td>{index + 1}</td>
                <td>{standing.driver}</td>
                <td>{standing.team}</td>
                {races.map(race => (
                  <td 
                    key={race} 
                    className={standing.raceResults[race] === 'NC' || standing.raceResults[race] === 'DQ' ? 'dnf-cell' : ''}
                  >
                    {standing.raceResults[race] || '-'}
                  </td>
                ))}
                <td className="total-points">{standing.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverStandingsTable; 