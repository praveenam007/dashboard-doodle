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

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

For production:
```bash
VITE_API_URL=https://your-backend-api.railway.app
```

### Installation

```bash
cd frontend
npm install
```

### Running Locally

```bash
npm run dev
```

## Deployment

### Backend (Railway/Render)
- Ensure `DATABASE_URL` environment variable is set
- Ensure `CORS_ORIGINS` environment variable includes your frontend domain
- The Procfile will automatically start the server on the correct port

### Frontend (Vercel)
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Environment Variable**: `VITE_API_URL=https://your-backend-api-url.com`
- Build Command: `npm run build`
- Output Directory: `dist`
