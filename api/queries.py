from sqlalchemy import text
from .db import engine

ALLOWED_DIMENSIONS = {
    "channel": "channel",
    "state": "state",
    "zone": "zone",
    "city": "city",
    "category": "category",
    "sub_category": "sub_category",
    "segment": "segment",
    "master_sku": "master_sku",
    "customer": "customer",
    "sales_leader": "sales_leader",
    "rsm": "rsm",
    "asm": "asm"
}


def get_kpi_metrics(current_start_date: str, current_end_date: str, compare_start_date: str = None, compare_end_date: str = None):
    """Get KPI metrics for current date range and optionally compare with another date range"""
    
    sql = """
    WITH current_metrics AS (
        SELECT
            SUM(revenue) AS total_revenue,
            SUM(quantity) AS total_quantity,
            COUNT(*) AS total_transactions,
            CASE 
                WHEN COUNT(*) > 0 THEN SUM(revenue) / COUNT(*)
                ELSE 0
            END AS avg_revenue_per_txn,
            SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END) AS gross_revenue,
            ABS(SUM(CASE WHEN revenue < 0 THEN revenue ELSE 0 END)) AS returns,
            CASE 
                WHEN SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END) > 0 
                THEN (ABS(SUM(CASE WHEN revenue < 0 THEN revenue ELSE 0 END)) / SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END)) * 100
                ELSE 0
            END AS returns_impact_pct
        FROM sales.fact_sales
        WHERE posting_date BETWEEN :current_start_date AND :current_end_date
    ),
    compare_metrics AS (
        SELECT
            SUM(revenue) AS total_revenue,
            SUM(quantity) AS total_quantity,
            COUNT(*) AS total_transactions,
            CASE 
                WHEN COUNT(*) > 0 THEN SUM(revenue) / COUNT(*)
                ELSE 0
            END AS avg_revenue_per_txn,
            SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END) AS gross_revenue,
            ABS(SUM(CASE WHEN revenue < 0 THEN revenue ELSE 0 END)) AS returns,
            CASE 
                WHEN SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END) > 0 
                THEN (ABS(SUM(CASE WHEN revenue < 0 THEN revenue ELSE 0 END)) / SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END)) * 100
                ELSE 0
            END AS returns_impact_pct
        FROM sales.fact_sales
        WHERE posting_date BETWEEN :compare_start_date AND :compare_end_date
    )
    SELECT
        c.total_revenue AS current_revenue,
        c.total_quantity AS current_quantity,
        c.total_transactions AS current_transactions,
        c.avg_revenue_per_txn AS current_avg_revenue_per_txn,
        c.gross_revenue AS current_gross_revenue,
        c.returns AS current_returns,
        c.returns_impact_pct AS current_returns_impact_pct,
        cm.total_revenue AS compare_revenue,
        cm.total_quantity AS compare_quantity,
        cm.total_transactions AS compare_transactions,
        cm.avg_revenue_per_txn AS compare_avg_revenue_per_txn,
        cm.gross_revenue AS compare_gross_revenue,
        cm.returns AS compare_returns,
        cm.returns_impact_pct AS compare_returns_impact_pct
    FROM current_metrics c
    CROSS JOIN compare_metrics cm;
    """
    
    with engine.connect() as conn:
        result = conn.execute(
            text(sql),
            {
                "current_start_date": current_start_date, 
                "current_end_date": current_end_date,
                "compare_start_date": compare_start_date or current_start_date,
                "compare_end_date": compare_end_date or current_end_date
            }
        )
        row = result.fetchone()
        if not row:
            return None
        return dict(row._mapping)


def get_available_months():
    """Get list of available months in the dataset"""
    
    sql = """
    SELECT DISTINCT year_month
    FROM sales.fact_sales
    ORDER BY year_month DESC;
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        return [row[0] for row in result]


def get_available_segments():
    """Get list of available segments in the dataset"""
    
    sql = """
    SELECT DISTINCT segment
    FROM sales.fact_sales
    WHERE segment IS NOT NULL
    ORDER BY segment;
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        return [row[0] for row in result]


def get_available_dimension_values(dimension: str):
    """Get list of available values for a specific dimension"""
    
    if dimension not in ALLOWED_DIMENSIONS:
        raise ValueError("Invalid dimension")
    
    dim_col = ALLOWED_DIMENSIONS[dimension]
    
    sql = f"""
    SELECT DISTINCT {dim_col}
    FROM sales.fact_sales
    WHERE {dim_col} IS NOT NULL
    ORDER BY {dim_col};
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        return [row[0] for row in result]


def get_monthly_growth(group_by: str, start_month: str, end_month: str):
    if group_by not in ALLOWED_DIMENSIONS:
        raise ValueError("Invalid hierarchy")

    dimension = ALLOWED_DIMENSIONS[group_by]

    sql = f"""
    WITH monthly AS (
        SELECT
            year_month,
            {dimension} AS dimension_value,
            SUM(revenue) AS revenue
        FROM sales.fact_sales
        WHERE year_month BETWEEN :start_month AND :end_month
        GROUP BY year_month, {dimension}
    )
    SELECT
        year_month,
        dimension_value,
        revenue,
        LAG(revenue) OVER (
            PARTITION BY dimension_value
            ORDER BY year_month
        ) AS prev_revenue,
        CASE
            WHEN LAG(revenue) OVER (
                PARTITION BY dimension_value
                ORDER BY year_month
            ) = 0
            THEN NULL
            ELSE
                (revenue - LAG(revenue) OVER (
                    PARTITION BY dimension_value
                    ORDER BY year_month
                ))
                / LAG(revenue) OVER (
                    PARTITION BY dimension_value
                    ORDER BY year_month
                )
        END AS growth_pct
    FROM monthly
    ORDER BY dimension_value, year_month;
    """

    with engine.connect() as conn:
        result = conn.execute(
            text(sql),
            {"start_month": start_month, "end_month": end_month}
        )
        return [dict(row._mapping) for row in result]


def get_revenue_trend(start_date: str = None, end_date: str = None, dimension: str = None, dimension_values: list[str] = None, granularity: str = "monthly"):
    """Get revenue trend over time with different granularities (daily, weekly, monthly), optionally broken down by dimension and filtered by dimension values"""
    
    # Determine the date grouping column based on granularity
    if granularity == "daily":
        date_col = "posting_date"
        date_alias = "date_value"
    elif granularity == "weekly":
        date_col = "date_trunc('week', posting_date)::date"
        date_alias = "date_value"
    else:  # monthly (default)
        date_col = "year_month"
        date_alias = "year_month"
    
    if dimension and dimension in ALLOWED_DIMENSIONS:
        dim_col = ALLOWED_DIMENSIONS[dimension]
        sql = f"""
        SELECT
            {date_col} AS {date_alias},
            {dim_col} AS dimension_value,
            SUM(revenue) AS revenue
        FROM sales.fact_sales
        """
    else:
        sql = f"""
        SELECT
            {date_col} AS {date_alias},
            SUM(revenue) AS revenue
        FROM sales.fact_sales
        """
    
    conditions = []
    params = {}
    
    if start_date:
        conditions.append("posting_date >= :start_date")
        params["start_date"] = start_date
    
    if end_date:
        conditions.append("posting_date <= :end_date")
        params["end_date"] = end_date
    
    if dimension and dimension in ALLOWED_DIMENSIONS and dimension_values and len(dimension_values) > 0:
        dim_col = ALLOWED_DIMENSIONS[dimension]
        values_filter = ",".join([f"'{v}'" for v in dimension_values])
        conditions.append(f"{dim_col} IN ({values_filter})")
    
    if conditions:
        sql += " WHERE " + " AND ".join(conditions)
    
    if dimension and dimension in ALLOWED_DIMENSIONS:
        sql += f"""
        GROUP BY {date_col}, {dim_col}
        ORDER BY {date_col}, {dim_col};
        """
    else:
        sql += f"""
        GROUP BY {date_col}
        ORDER BY {date_col};
        """
    
    with engine.connect() as conn:
        result = conn.execute(text(sql), params)
        rows = [dict(row._mapping) for row in result]
        
        # Normalize the date column name to year_month for consistency with frontend
        if granularity in ["daily", "weekly"]:
            for row in rows:
                if "date_value" in row:
                    row["year_month"] = str(row["date_value"])
                    del row["date_value"]
        
        return rows


def get_growth_by_dimension(dimension: str, current_start_date: str, current_end_date: str, compare_start_date: str, compare_end_date: str, dimension_values: list[str] = None):
    """Get growth percentage by dimension (zone, state, etc.) for date ranges, optionally filtered by dimension values"""
    
    if dimension not in ALLOWED_DIMENSIONS:
        raise ValueError("Invalid dimension")
    
    dim_col = ALLOWED_DIMENSIONS[dimension]
    
    # Build dimension filter if provided
    dimension_filter = ""
    if dimension_values and len(dimension_values) > 0:
        values_list = ",".join([f"'{v}'" for v in dimension_values])
        dimension_filter = f"AND {dim_col} IN ({values_list})"
    
    sql = f"""
    WITH current_data AS (
        SELECT
            {dim_col} AS dimension_value,
            SUM(revenue) AS revenue
        FROM sales.fact_sales
        WHERE posting_date BETWEEN :current_start_date AND :current_end_date
        {dimension_filter}
        GROUP BY {dim_col}
    ),
    compare_data AS (
        SELECT
            {dim_col} AS dimension_value,
            SUM(revenue) AS revenue
        FROM sales.fact_sales
        WHERE posting_date BETWEEN :compare_start_date AND :compare_end_date
        {dimension_filter}
        GROUP BY {dim_col}
    )
    SELECT
        COALESCE(c.dimension_value, cm.dimension_value) AS dimension_value,
        COALESCE(c.revenue, 0) AS current_revenue,
        COALESCE(cm.revenue, 0) AS compare_revenue,
        CASE
            WHEN COALESCE(cm.revenue, 0) = 0 THEN NULL
            ELSE ((COALESCE(c.revenue, 0) - COALESCE(cm.revenue, 0)) / cm.revenue) * 100
        END AS growth_pct
    FROM current_data c
    FULL OUTER JOIN compare_data cm ON c.dimension_value = cm.dimension_value
    WHERE COALESCE(c.dimension_value, cm.dimension_value) IS NOT NULL
    ORDER BY growth_pct DESC NULLS LAST;
    """
    
    with engine.connect() as conn:
        result = conn.execute(
            text(sql),
            {
                "current_start_date": current_start_date,
                "current_end_date": current_end_date,
                "compare_start_date": compare_start_date,
                "compare_end_date": compare_end_date
            }
        )
        return [dict(row._mapping) for row in result]


def get_detailed_breakdown(dimension: str, current_start_date: str, current_end_date: str, compare_start_date: str, compare_end_date: str, dimension_values: list[str] = None):
    """Get detailed breakdown with revenue and quantity for both date ranges, optionally filtered by dimension values"""
    
    if dimension not in ALLOWED_DIMENSIONS:
        raise ValueError("Invalid dimension")
    
    dim_col = ALLOWED_DIMENSIONS[dimension]
    
    # Build dimension filter
    dimension_filter = ""
    if dimension_values and len(dimension_values) > 0:
        # Escape and quote each value
        values_quoted = [f"'{v.replace(chr(39), chr(39)+chr(39))}' " for v in dimension_values]
        dimension_filter = f" AND {dim_col} IN ({','.join(values_quoted)})"
    
    sql = f"""
    WITH current_data AS (
        SELECT
            {dim_col} AS dimension_value,
            SUM(revenue) AS revenue,
            SUM(quantity) AS quantity,
            SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END) AS gross_revenue,
            ABS(SUM(CASE WHEN revenue < 0 THEN revenue ELSE 0 END)) AS returns,
            CASE 
                WHEN SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END) > 0 
                THEN (ABS(SUM(CASE WHEN revenue < 0 THEN revenue ELSE 0 END)) / SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END)) * 100
                ELSE 0
            END AS return_impact_pct
        FROM sales.fact_sales
        WHERE posting_date BETWEEN :current_start_date AND :current_end_date{dimension_filter}
        GROUP BY {dim_col}
    ),
    compare_data AS (
        SELECT
            {dim_col} AS dimension_value,
            SUM(revenue) AS revenue,
            SUM(quantity) AS quantity,
            SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END) AS gross_revenue,
            ABS(SUM(CASE WHEN revenue < 0 THEN revenue ELSE 0 END)) AS returns,
            CASE 
                WHEN SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END) > 0 
                THEN (ABS(SUM(CASE WHEN revenue < 0 THEN revenue ELSE 0 END)) / SUM(CASE WHEN revenue > 0 THEN revenue ELSE 0 END)) * 100
                ELSE 0
            END AS return_impact_pct
        FROM sales.fact_sales
        WHERE posting_date BETWEEN :compare_start_date AND :compare_end_date{dimension_filter}
        GROUP BY {dim_col}
    )
    SELECT
        COALESCE(c.dimension_value, cm.dimension_value) AS dimension_value,
        COALESCE(c.revenue, 0) AS current_revenue,
        COALESCE(cm.revenue, 0) AS compare_revenue,
        CASE
            WHEN COALESCE(cm.revenue, 0) = 0 THEN NULL
            ELSE ((COALESCE(c.revenue, 0) - COALESCE(cm.revenue, 0)) / cm.revenue) * 100
        END AS revenue_growth_pct,
        COALESCE(c.quantity, 0) AS current_quantity,
        COALESCE(cm.quantity, 0) AS compare_quantity,
        CASE
            WHEN COALESCE(cm.quantity, 0) = 0 THEN NULL
            ELSE ((COALESCE(c.quantity, 0) - COALESCE(cm.quantity, 0)) / cm.quantity) * 100
        END AS quantity_growth_pct,
        COALESCE(c.gross_revenue, 0) AS current_gross_revenue,
        COALESCE(cm.gross_revenue, 0) AS compare_gross_revenue,
        COALESCE(c.returns, 0) AS current_returns,
        COALESCE(cm.returns, 0) AS compare_returns,
        COALESCE(c.return_impact_pct, 0) AS current_return_impact_pct,
        COALESCE(cm.return_impact_pct, 0) AS compare_return_impact_pct
    FROM current_data c
    FULL OUTER JOIN compare_data cm ON c.dimension_value = cm.dimension_value
    WHERE COALESCE(c.dimension_value, cm.dimension_value) IS NOT NULL
    ORDER BY COALESCE(c.revenue, 0) DESC;
    """
    
    with engine.connect() as conn:
        result = conn.execute(
            text(sql),
            {
                "current_start_date": current_start_date,
                "current_end_date": current_end_date,
                "compare_start_date": compare_start_date,
                "compare_end_date": compare_end_date
            }
        )
        return [dict(row._mapping) for row in result]