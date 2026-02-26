from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Query
from .queries import get_monthly_growth


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sales Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/metrics/growth")
def growth_metrics(
    group_by: str = Query(..., description="Hierarchy level"),
    start_month: str = Query(..., example="2023-01"),
    end_month: str = Query(..., example="2023-12")
):
    return get_monthly_growth(group_by, start_month, end_month)