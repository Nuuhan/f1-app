import React, { useState, useEffect } from 'react';
import DriverStandingsTable from '../components/DriverStandingsTable';
import './SeasonStats.css';

interface DriverStanding {
    Position: string;
    Driver: string;
    Team: string;
    Points: string;
}

interface ConstructorStanding {
    Position: string;
    Team: string;
    Points: string;
}

interface RaceResult {
    Position: string;
    Driver: string;
    Team: string;
    Time: string;
    Points: string;
}

const SeasonStats: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState('2023');
    const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
    const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
    const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const years = ['2021', '2022', '2023'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch driver standings
                const driverResponse = await fetch(`/data/${selectedYear}/driver_standings.csv`);
                if (!driverResponse.ok) throw new Error('Failed to fetch driver standings');
                const driverData = await driverResponse.text();
                const driverRows = driverData.split('\n').slice(1); // Skip header
                const driverStandings = driverRows
                    .filter(row => row.trim())
                    .map(row => {
                        const [Position, Driver, Team, Points] = row.split(',');
                        return { Position, Driver, Team, Points };
                    });
                setDriverStandings(driverStandings);

                // Fetch constructor standings
                const constructorResponse = await fetch(`/data/${selectedYear}/constructor_standings.csv`);
                if (!constructorResponse.ok) throw new Error('Failed to fetch constructor standings');
                const constructorData = await constructorResponse.text();
                const constructorRows = constructorData.split('\n').slice(1); // Skip header
                const constructorStandings = constructorRows
                    .filter(row => row.trim())
                    .map(row => {
                        const [Position, Team, Points] = row.split(',');
                        return { Position, Team, Points };
                    });
                setConstructorStandings(constructorStandings);

                // Fetch race results (using the first race as an example)
                const raceResponse = await fetch(`/data/${selectedYear}/race_bahrain_grand_prix.csv`);
                if (!raceResponse.ok) throw new Error('Failed to fetch race results');
                const raceData = await raceResponse.text();
                const raceRows = raceData.split('\n').slice(1); // Skip header
                const raceResults = raceRows
                    .filter(row => row.trim())
                    .map(row => {
                        const [Position, Driver, Team, Time, Points] = row.split(',');
                        return { Position, Driver, Team, Time, Points };
                    });
                setRaceResults(raceResults);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear]);

    return (
        <div className="season-stats">
            <h1>Seasonal Statistics</h1>
            <div className="stats-container">
                <DriverStandingsTable />
            </div>
        </div>
    );
};

export default SeasonStats; 