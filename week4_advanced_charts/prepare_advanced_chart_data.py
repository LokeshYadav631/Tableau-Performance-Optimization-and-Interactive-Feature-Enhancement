"""
Week 4 - Data prep for advanced chart mock-ups.

Reads the Week 1 working dataset and derives the four small summary
tables that make_advanced_charts.py turns into the bullet, waterfall,
control, and bump chart images.

Run from inside week4_advanced_charts/:
    python3 prepare_advanced_chart_data.py
"""
import pandas as pd

df = pd.read_csv("../data/superstore_working.csv", parse_dates=["Order Date", "Order Month"])

# ---- Bullet chart data: regional sales this year vs target (prior year * 1.1) ----
yearly_region = df.groupby([df["Order Date"].dt.year, "Region"])["Sales"].sum().reset_index()
yearly_region.columns = ["Year", "Region", "Sales"]
piv = yearly_region.pivot(index="Region", columns="Year", values="Sales")
piv["Target_2018"] = piv[2017] * 1.10
bullet = piv[[2018, "Target_2018"]].reset_index()
bullet.columns = ["Region", "Actual_2018", "Target_2018"]
bullet["Pct_of_Target"] = bullet["Actual_2018"] / bullet["Target_2018"]
print("BULLET\n", bullet.round(0))

# ---- Waterfall: category profit bridge ----
cat_profit = df.groupby("Category")["Profit"].sum().sort_values(ascending=False)
print("\nWATERFALL\n", cat_profit.round(0), "\nsum=", cat_profit.sum())

# ---- Control chart: monthly margin ----
m = df.groupby("Order Month").agg(Sales=("Sales", "sum"), Profit=("Profit", "sum")).reset_index()
m["Margin"] = m["Profit"] / m["Sales"]
mean_margin = m["Margin"].mean()
std_margin = m["Margin"].std()
ucl = mean_margin + 2 * std_margin
lcl = mean_margin - 2 * std_margin
m["Anomaly"] = (m["Margin"] > ucl) | (m["Margin"] < lcl)
print("\nCONTROL CHART mean/std/ucl/lcl:", mean_margin, std_margin, ucl, lcl)
print(m[m["Anomaly"]])

# ---- Bump chart: sub-category profit rank by year ----
sy = df.groupby([df["Order Date"].dt.year, "Sub-Category"])["Profit"].sum().reset_index()
sy.columns = ["Year", "Sub-Category", "Profit"]
sy["Rank"] = sy.groupby("Year")["Profit"].rank(ascending=False, method="first").astype(int)
print("\nBUMP sample (2018, top 6)\n", sy[sy["Year"] == 2018].sort_values("Rank").head(6))

# save all for chart generation
bullet.to_csv("bullet_data.csv", index=False)
cat_profit.to_csv("waterfall_data.csv")
m.to_csv("control_data.csv", index=False)
sy.to_csv("bump_data.csv", index=False)
print("\nSaved: bullet_data.csv, waterfall_data.csv, control_data.csv, bump_data.csv")
