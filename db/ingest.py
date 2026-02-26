import os

import pandas as pd
from sqlalchemy import create_engine

from dotenv import load_dotenv
load_dotenv()

# --- DB connection ---
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

engine = create_engine(DATABASE_URL)

# --- Load Excel ---
df = pd.read_csv(r"C:\Users\praisy\Downloads\Sales Data For Data Analyst Role (1).csv")

# --- Date handling ---
df["posting_date"] = pd.to_datetime(df["Posting Date"])
df["year"] = df["posting_date"].dt.year
df["month"] = df["posting_date"].dt.month
df["year_month"] = df["posting_date"].dt.to_period("M").astype(str)

# --- Metrics ---
df["revenue"] = df["Amount"]
df["quantity"] = df["Quantity"]
df["is_return"] = (df["revenue"] < 0) | (df["quantity"] < 0)

# --- Rename & select ---
final_df = df.rename(columns={
    "Channel Name_masked": "channel",
    "Sub Channel_masked": "sub_channel",
    "Chain_masked": "chain",
    "Customer Name_masked": "customer",

    "District_masked": "district",
    "State Name_masked": "state",
    "Zone_masked": "zone",
    "GT City_masked": "city",

    "Category_masked": "category",
    "Sub-category_masked": "sub_category",
    "Segment_masked": "segment",
    "NEW Category Mapping_masked": "category_mapping_new",
    "Category Mapping_masked": "category_mapping_old",

    "Master SKU_masked": "master_sku",
    "Variant Code_masked": "variant_code",
    "Master Variant_masked": "master_variant",
    "Master Flavour_masked": "flavour",
    "Size_masked": "size",

    "CPG_masked": "cpg",

    "Sales Leader_masked": "sales_leader",
    "RSM_masked": "rsm",
    "ASM Emp Name_masked": "asm",

    "Population Group_masked": "population_group",

    "Source Document No._masked": "source_doc_no",
    "Source No._masked": "source_no",
    "No._masked": "line_no"
})[[
    "posting_date","year","month","year_month",
    "revenue","quantity","is_return",

    "channel","sub_channel","chain","customer",
    "district","state","zone","city",

    "category","sub_category","segment",
    "category_mapping_new","category_mapping_old",

    "master_sku","variant_code","master_variant",
    "flavour","size","cpg",

    "sales_leader","rsm","asm",
    "population_group",

    "source_doc_no","source_no","line_no"
]]

# --- Inject ---
final_df.to_sql(
    "fact_sales",
    engine,
    schema="sales",
    if_exists="append",
    index=False
)

print("✅ Injection completed successfully")