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