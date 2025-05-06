# F1 Fantasy Project

This project consists of a Python backend for F1 data analysis and a React TypeScript frontend for visualization and interaction.

## Project Structure

```
.
├── f1-app/           # Frontend React TypeScript application
├── requirements.txt  # Backend Python dependencies
└── .ipynb_checkpoints/
```

## Backend Setup

1. Create a Python virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

The backend requires the following Python packages:
- requests==2.31.0
- pandas==2.1.4
- beautifulsoup4==4.12.2
- selenium==4.16.0
- webdriver-manager==4.0.1
- fastf1>=3.5.0
- numpy>=1.21.0
- scikit-learn>=1.0.0
- matplotlib>=3.5.1
- seaborn>=0.11.0
- jupyter>=1.0.0
- fastapi==0.68.1
- uvicorn==0.15.0
- python-multipart==0.0.5

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd f1-app
```

2. Install Node.js dependencies:
```bash
npm install
```

The frontend uses the following main dependencies:
- React 19.1.0
- TypeScript 4.9.5
- React Router DOM 7.5.0
- PapaParse 5.5.2 (for CSV parsing)
- Various testing libraries

## Running the Application

### Backend
1. Make sure you're in the root directory
2. Start the FastAPI server:
```bash

uvicorn main:app --reload
or
python -m uvicorn f1-app.src.services.race_visualizer:app --reload

```

### Frontend
1. Navigate to the frontend directory:
```bash
cd f1-app
```

2. Start the development server:
```bash

npm start

```

The frontend will be available at `http://localhost:3000`

## Development

- Backend API documentation will be available at `http://localhost:8000/docs` when the server is running
- Frontend development server includes hot-reloading
- Use `npm run build` in the frontend directory to create a production build

## Notes

- Make sure you have Python 3.8+ and Node.js 14+ installed
- The backend uses FastAPI for the API server
- The frontend is built with React and TypeScript
- Both development servers need to be running simultaneously for full functionality 
