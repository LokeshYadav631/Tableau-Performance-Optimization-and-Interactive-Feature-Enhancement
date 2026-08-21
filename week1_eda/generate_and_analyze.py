import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from datetime import timedelta
import textwrap

rng = np.random.default_rng(42)

plt.rcParams.update({
    "font.size": 11,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "grid.alpha": 0.25,
    "figure.dpi": 150,
})
TABLEAU_BLUE = "#4E79A7"
TABLEAU_ORANGE = "#F28E2B"
TABLEAU_RED = "#E15759"
TABLEAU_GREEN = "#59A14F"
TABLEAU_PURPLE = "#B07AA1"
PALETTE = [TABLEAU_BLUE, TABLEAU_ORANGE, TABLEAU_GREEN, TABLEAU_RED, TABLEAU_PURPLE, "#76B7B2", "#EDC948"]

# ----------------------------------------------------------------------------------
# 1. GENERATE a realistic "Sample - Superstore" style dataset
#    Structure, category/region proportions and profit-discount relationships are
#    modeled on the well-known public "Sample - Superstore" dataset (fictional US
#    retailer, order-line-item grain) that ships as Tableau's own sample workbook
#    and is widely mirrored on Kaggle/GitHub for EDA practice.
# ----------------------------------------------------------------------------------

N = 9994

regions = ["West", "East", "Central", "South"]
region_p = [0.32, 0.28, 0.23, 0.17]

region_states = {
    "West": ["California", "Washington", "Oregon", "Arizona", "Colorado", "Nevada", "Utah", "New Mexico", "Idaho", "Montana"],
    "East": ["New York", "Pennsylvania", "New Jersey", "Massachusetts", "Connecticut", "Maryland", "Virginia", "Maine", "Rhode Island", "Delaware"],
    "Central": ["Texas", "Illinois", "Ohio", "Michigan", "Indiana", "Wisconsin", "Minnesota", "Missouri", "Oklahoma", "Kansas"],
    "South": ["Florida", "North Carolina", "Georgia", "Tennessee", "Kentucky", "Alabama", "South Carolina", "Louisiana", "Mississippi", "Arkansas"],
}

segments = ["Consumer", "Corporate", "Home Office"]
segment_p = [0.52, 0.30, 0.18]

ship_modes = ["Standard Class", "Second Class", "First Class", "Same Day"]
ship_mode_p = [0.60, 0.19, 0.15, 0.06]
ship_days = {"Standard Class": (4, 7), "Second Class": (3, 4), "First Class": (1, 2), "Same Day": (0, 0)}

cat_sub = {
    "Office Supplies": {
        "share": 0.60,
        "subs": {
            "Binders": 0.19, "Paper": 0.15, "Furnishings": 0.0, "Art": 0.12, "Storage": 0.11,
            "Appliances": 0.07, "Labels": 0.07, "Envelopes": 0.06, "Fasteners": 0.06, "Supplies": 0.05, "Copiers": 0.0,
        },
    },
    "Furniture": {
        "share": 0.21,
        "subs": {"Furnishings": 0.34, "Chairs": 0.27, "Tables": 0.20, "Bookcases": 0.19},
    },
    "Technology": {
        "share": 0.19,
        "subs": {"Phones": 0.34, "Accessories": 0.32, "Machines": 0.13, "Copiers": 0.09, "Office Supplies": 0.0, "Wearables": 0.12},
    },
}
# clean zero shares out, renormalize
for c, d in cat_sub.items():
    subs = {k: v for k, v in d["subs"].items() if v > 0}
    tot = sum(subs.values())
    d["subs"] = {k: v / tot for k, v in subs.items()}

# baseline unit price & margin behaviour per sub-category (mirrors well-documented
# Sample Superstore patterns: Tables/Bookcases/Machines/Supplies are heavy discounters
# and often lose money; Copiers/Labels/Paper/Envelopes are the most reliably profitable)
sub_profile = {
    "Binders":       dict(price=(2, 25),   base_margin=0.30, disc_p=[0.40, 0.35, 0.15, 0.10], disc_v=[0, 0.2, 0.5, 0.7]),
    "Paper":         dict(price=(3, 18),   base_margin=0.42, disc_p=[0.55, 0.30, 0.15], disc_v=[0, 0.2, 0.3]),
    "Art":           dict(price=(2, 18),   base_margin=0.36, disc_p=[0.60, 0.30, 0.10], disc_v=[0, 0.2, 0.3]),
    "Storage":       dict(price=(8, 110),  base_margin=0.25, disc_p=[0.55, 0.30, 0.15], disc_v=[0, 0.15, 0.2]),
    "Appliances":    dict(price=(6, 260),  base_margin=0.14, disc_p=[0.40, 0.30, 0.20, 0.10], disc_v=[0, 0.2, 0.4, 0.7]),
    "Labels":        dict(price=(2, 12),   base_margin=0.45, disc_p=[0.65, 0.35], disc_v=[0, 0.2]),
    "Envelopes":     dict(price=(3, 25),   base_margin=0.42, disc_p=[0.60, 0.40], disc_v=[0, 0.2]),
    "Fasteners":     dict(price=(2, 12),   base_margin=0.34, disc_p=[0.65, 0.35], disc_v=[0, 0.2]),
    "Supplies":      dict(price=(4, 40),   base_margin=0.09, disc_p=[0.45, 0.35, 0.20], disc_v=[0, 0.2, 0.5]),
    "Furnishings":   dict(price=(4, 120),  base_margin=0.27, disc_p=[0.45, 0.30, 0.25], disc_v=[0, 0.2, 0.5]),
    "Chairs":        dict(price=(35, 480), base_margin=0.17, disc_p=[0.40, 0.35, 0.25], disc_v=[0, 0.2, 0.3]),
    "Tables":        dict(price=(50, 650), base_margin=0.05, disc_p=[0.25, 0.25, 0.25, 0.25], disc_v=[0, 0.2, 0.4, 0.5]),
    "Bookcases":     dict(price=(45, 800), base_margin=0.11, disc_p=[0.35, 0.30, 0.20, 0.15], disc_v=[0, 0.2, 0.32, 0.5]),
    "Phones":        dict(price=(12, 380), base_margin=0.20, disc_p=[0.60, 0.28, 0.12], disc_v=[0, 0.2, 0.4]),
    "Accessories":   dict(price=(4, 180),  base_margin=0.27, disc_p=[0.68, 0.22, 0.10], disc_v=[0, 0.2, 0.4]),
    "Machines":      dict(price=(80, 1600),base_margin=0.05, disc_p=[0.40, 0.35, 0.25], disc_v=[0, 0.35, 0.5]),
    "Copiers":       dict(price=(160, 1400),base_margin=0.38, disc_p=[0.65, 0.35], disc_v=[0, 0.2]),
    "Wearables":     dict(price=(18, 130), base_margin=0.23, disc_p=[0.55, 0.30, 0.15], disc_v=[0, 0.2, 0.3]),
}

cats = list(cat_sub.keys())
cat_share = [cat_sub[c]["share"] for c in cats]

rows = []
start = pd.Timestamp("2015-01-01")
end = pd.Timestamp("2018-12-30")
span_days = (end - start).days

# mild year-over-year growth + Nov/Dec seasonal bump
def sample_order_date():
    year_weights = np.array([0.20, 0.23, 0.27, 0.30])  # growth 2015->2018
    year = rng.choice([2015, 2016, 2017, 2018], p=year_weights)
    month_weights = np.array([.06,.06,.07,.07,.08,.08,.08,.08,.09,.09,.10,.14])  # Nov/Dec bump
    month = rng.choice(np.arange(1, 13), p=month_weights)
    day = rng.integers(1, 28)
    return pd.Timestamp(year=int(year), month=int(month), day=int(day))

customer_pool = [f"CUST-{i:05d}" for i in range(1, 800)]
product_id_counter = {}

for i in range(1, N + 1):
    region = rng.choice(regions, p=region_p)
    state = rng.choice(region_states[region])
    segment = rng.choice(segments, p=segment_p)
    ship_mode = rng.choice(ship_modes, p=ship_mode_p)
    category = rng.choice(cats, p=cat_share)
    subs = cat_sub[category]["subs"]
    sub_category = rng.choice(list(subs.keys()), p=list(subs.values()))
    prof = sub_profile[sub_category]

    lo, hi = prof["price"]
    # right-skewed unit price within sub-category band
    unit_price = lo + (hi - lo) * rng.beta(1.6, 5.0)
    qty = int(rng.integers(1, 8))
    sales = round(unit_price * qty, 2)

    discount = rng.choice(prof["disc_v"], p=prof["disc_p"])
    margin = prof["base_margin"] - discount * rng.uniform(0.35, 0.55)
    noise = rng.normal(0, 0.03)
    profit = round(sales * (margin + noise), 2)

    order_date = sample_order_date()
    lo_d, hi_d = ship_days[ship_mode]
    ship_date = order_date + timedelta(days=int(rng.integers(lo_d, hi_d + 1)) if hi_d > 0 else 0)

    customer = rng.choice(customer_pool)
    key = (category, sub_category)
    product_id_counter[key] = product_id_counter.get(key, 0) + 1
    product_id = f"{category[:3].upper()}-{sub_category[:2].upper()}-{product_id_counter[key]:05d}"

    rows.append((
        i, order_date, ship_date, ship_mode, customer, segment, region, state,
        category, sub_category, product_id, sales, qty, round(discount, 2), profit
    ))

df = pd.DataFrame(rows, columns=[
    "Row ID", "Order Date", "Ship Date", "Ship Mode", "Customer ID", "Segment", "Region", "State",
    "Category", "Sub-Category", "Product ID", "Sales", "Quantity", "Discount", "Profit"
])
df["Order ID"] = "ORD-" + df["Order Date"].dt.year.astype(str) + "-" + (df.index // 3 + 1000).astype(str)
df["Profit Margin"] = df["Profit"] / df["Sales"]
df["Order Month"] = df["Order Date"].values.astype("datetime64[M]")
df["Ship Days"] = (df["Ship Date"] - df["Order Date"]).dt.days

df.to_csv("../data/superstore_working.csv", index=False)

print("=== SHAPE ===", df.shape)
print(df.dtypes)
print("\n=== NULLS ===\n", df.isna().sum().sum())
print("\n=== KPI ===")
print("Total Sales:      $%.2f" % df["Sales"].sum())
print("Total Profit:     $%.2f" % df["Profit"].sum())
print("Overall Margin:    %.2f%%" % (100 * df["Profit"].sum() / df["Sales"].sum()))
print("Total Orders:     ", df["Order ID"].nunique())
print("Total Line Items: ", len(df))
print("Unique Customers: ", df["Customer ID"].nunique())
print("Avg Discount:      %.1f%%" % (100 * df["Discount"].mean()))
