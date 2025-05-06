import React from 'react';
import './Predictions.css';

interface Prediction {
    grid: number;
    driver: string;
    probability: number;
}

const Predictions: React.FC = () => {
    const miamiPredictions: Prediction[] = [
        { grid: 1, driver: 'Max Verstappen', probability: 44.17 },
        { grid: 2, driver: 'Charles Leclerc', probability: 74.32 },
        { grid: 3, driver: 'Carlos Sainz', probability: 78.67 },
        { grid: 4, driver: 'Liam Lawson', probability: 89.75 },
        { grid: 5, driver: 'Lando Norris', probability: 41.00 },
        { grid: 6, driver: 'Oscar Piastri', probability: 8.17 },
        { grid: 7, driver: 'George Russell', probability: 15.00 },
        { grid: 8, driver: 'Lewis Hamilton', probability: 4.00 },
        { grid: 9, driver: 'Nico Hülkenberg', probability: 0.00 },
        { grid: 10, driver: 'Yuki Tsunoda', probability: 0.00 },
        { grid: 11, driver: 'Lance Stroll', probability: 0.00 },
        { grid: 12, driver: 'Pierre Gasly', probability: 0.00 },
        { grid: 13, driver: 'Esteban Ocon', probability: 0.00 },
        { grid: 14, driver: 'Alexander Albon', probability: 0.00 },
        { grid: 15, driver: 'Fernando Alonso', probability: 0.00 },
        { grid: 16, driver: 'Valtteri Bottas', probability: 0.00 },
        { grid: 17, driver: 'Kimi Antonelli', probability: 0.00 },
        { grid: 18, driver: 'Oliver Bearman', probability: 0.00 },
        { grid: 19, driver: 'Gabriel Bortoleto', probability: 0.00 },
        { grid: 20, driver: 'Isack Hadjar', probability: 0.00 }
    ];

    return (
        <div className="predictions-page">
            <h1>Predicted outcome for Miami 25 Grand Prix</h1>
            <div className="predictions-grid">
                {miamiPredictions.map((prediction) => (
                    <div key={prediction.grid} className="prediction-card">
                        <div className="grid-position">Grid {prediction.grid}</div>
                        <div className="driver-name">{prediction.driver}</div>
                        <div className="probability">
                            Prob Top 3: {prediction.probability.toFixed(2)}%
                        </div>
                    </div>
                ))}
            </div>
            <div className="disclaimer">
                <p>Disclaimer: These predictions are generated using machine learning algorithms and historical data analysis. While we strive for accuracy, predictions may not always reflect actual race outcomes due to various factors including but not limited to:</p>
                <ul>
                    <li>Weather conditions</li>
                    <li>Technical issues</li>
                    <li>Driver performance variations</li>
                    <li>Team strategy changes</li>
                    <li>Track conditions</li>
                </ul>
                <p>Please use these predictions as a reference only and not as definitive race outcomes.</p>
            </div>
        </div>
    );
};

export default Predictions; 