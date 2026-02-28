from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Query
from .queries import get_monthly_growth, get_kpi_metrics, get_available_months, get_revenue_trend, get_growth_by_dimension, get_detailed_breakdown, get_available_segments, get_available_dimension_values


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sales Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/metrics/kpi")
def kpi_metrics(
    current_start_date: str = Query(..., example="2025-12-01"),
    current_end_date: str = Query(..., example="2025-12-31"),
    compare_start_date: str = Query(None, example="2025-11-01"),
    compare_end_date: str = Query(None, example="2025-11-30")
):
    return get_kpi_metrics(current_start_date, current_end_date, compare_start_date, compare_end_date)

@app.get("/metrics/available-months")
def available_months():
    return {"months": get_available_months()}

@app.get("/metrics/available-segments")
def available_segments():
    return {"segments": get_available_segments()}

@app.get("/metrics/available-dimension-values")
def available_dimension_values(
    dimension: str = Query(..., example="category")
):
    return {"values": get_available_dimension_values(dimension)}

@app.get("/metrics/growth")
def growth_metrics(
    group_by: str = Query(..., description="Hierarchy level"),
    start_month: str = Query(..., example="2023-01"),
    end_month: str = Query(..., example="2023-12")
):
    return get_monthly_growth(group_by, start_month, end_month)

@app.get("/metrics/revenue-trend")
def revenue_trend(
    start_date: str = Query(None, example="2024-01-01"),
    end_date: str = Query(None, example="2025-12-31"),
    dimension: str = Query(None, example="zone"),
    dimension_values: str = Query(None, example="North,South"),
    granularity: str = Query("monthly", example="monthly")
):
    values_list = dimension_values.split(",") if dimension_values else None
    return {"data": get_revenue_trend(start_date, end_date, dimension, values_list, granularity)}

@app.get("/metrics/growth-by-dimension")
def growth_by_dimension(
    dimension: str = Query(..., example="zone"),
    current_start_date: str = Query(..., example="2025-12-01"),
    current_end_date: str = Query(..., example="2025-12-31"),
    compare_start_date: str = Query(..., example="2025-11-01"),
    compare_end_date: str = Query(..., example="2025-11-30"),
    dimension_values: str = Query(None, example="North,South")
):
    values_list = dimension_values.split(",") if dimension_values else None
    return {"data": get_growth_by_dimension(dimension, current_start_date, current_end_date, compare_start_date, compare_end_date, values_list)}

@app.get("/metrics/detailed-breakdown")
def detailed_breakdown(
    dimension: str = Query(..., example="zone"),
    current_start_date: str = Query(..., example="2025-12-01"),
    current_end_date: str = Query(..., example="2025-12-31"),
    compare_start_date: str = Query(..., example="2025-11-01"),
    compare_end_date: str = Query(..., example="2025-11-30"),
    dimension_values: str = Query(None, example="North,South")
):
    values_list = dimension_values.split(",") if dimension_values else None
    return {"data": get_detailed_breakdown(dimension, current_start_date, current_end_date, compare_start_date, compare_end_date, values_list)}