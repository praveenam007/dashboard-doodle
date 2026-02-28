# Dashboard Doodle

Sales analytics dashboard with FastAPI backend and React frontend.

## Backend Setup

### Environment Variables

Required environment variables:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

For production:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CORS_ORIGINS=https://your-frontend-domain.com
```

### Installation

```bash
pip install -r requirements.txt
```

### Running Locally

```bash
uvicorn api.main:app --reload --port 8000
```

### Running in Production

The app uses the Procfile for deployment:

```bash
uvicorn api.main:app --host 0.0.0.0 --port $PORT
```

This ensures the app listens on all interfaces and uses the platform's PORT environment variable.

## Frontend Setup

See [frontend/README.md](frontend/README.md) for frontend setup instructions.

## Deployment

### Backend
- Ensure `DATABASE_URL` environment variable is set
- Ensure `CORS_ORIGINS` environment variable includes your frontend domain
- The Procfile will automatically start the server on the correct port

### Frontend
- Set the backend API URL in your frontend environment configuration
