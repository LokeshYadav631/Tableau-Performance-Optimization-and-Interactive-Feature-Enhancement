import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import json

plt.rcParams.update({
    "font.size": 11,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "grid.alpha": 0.25,
    "figure.dpi": 150,
    "font.family": "DejaVu Sans",
})
BLUE, ORANGE, RED, GREEN, PURPLE, TEAL, YELLOW = "#4E79A7","#F28E2B","#E15759","#59A14F","#B07AA1","#76B7B2","#EDC948"
PALETTE = [BLUE, ORANGE, GREEN, RED, PURPLE, TEAL, YELLOW]

df = pd.read_csv("../data/superstore_working.csv", parse_dates=["Order Date", "Ship Date", "Order Month"])
CH = "./charts/"

results = {}

# ---------- KPIs ----------
results["total_sales"] = float(df["Sales"].sum())
results["total_profit"] = float(df["Profit"].sum())
results["overall_margin"] = float(df["Profit"].sum() / df["Sales"].sum())
results["total_orders"] = int(df["Order ID"].nunique())
results["total_line_items"] = int(len(df))
results["unique_customers"] = int(df["Customer ID"].nunique())
results["avg_discount"] = float(df["Discount"].mean())
results["avg_order_value"] = float(df.groupby("Order ID")["Sales"].sum().mean())
results["date_min"] = str(df["Order Date"].min().date())
results["date_max"] = str(df["Order Date"].max().date())
results["pct_negative_profit_lines"] = float((df["Profit"] < 0).mean())

# ---------- describe() ----------
desc = df[["Sales", "Quantity", "Discount", "Profit", "Profit Margin", "Ship Days"]].describe().T
desc.to_csv("../data/describe.csv")
results["describe"] = desc.round(2).to_dict(orient="index")

# ---------- 1. Category / Sub-category performance ----------
cat = df.groupby("Category").agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"), Orders=("Order ID", "nunique")).reset_index()
cat["Margin"] = cat["Profit"] / cat["Sales"]
cat = cat.sort_values("Sales", ascending=False)
results["by_category"] = cat.round(2).to_dict(orient="records")

sub = df.groupby(["Category", "Sub-Category"]).agg(Sales=("Sales", "sum"), Profit=("Profit", "sum")).reset_index()
sub["Margin"] = sub["Profit"] / sub["Sales"]
sub = sub.sort_values("Sales", ascending=False)
results["by_subcategory"] = sub.round(2).to_dict(orient="records")
top5_profit_sub = sub.sort_values("Profit", ascending=False).head(5)
bottom5_profit_sub = sub.sort_values("Profit", ascending=True).head(5)
results["top5_profit_sub"] = top5_profit_sub.round(2).to_dict(orient="records")
results["bottom5_profit_sub"] = bottom5_profit_sub.round(2).to_dict(orient="records")

# Chart 1: Sales & Profit by Category (grouped bar)
fig, ax1 = plt.subplots(figsize=(7.5, 4.2))
x = np.arange(len(cat))
w = 0.38
ax1.bar(x - w/2, cat["Sales"]/1000, width=w, color=BLUE, label="Sales ($K)")
ax1.bar(x + w/2, cat["Profit"]/1000, width=w, color=ORANGE, label="Profit ($K)")
ax1.set_xticks(x); ax1.set_xticklabels(cat["Category"])
ax1.set_ylabel("$ Thousands")
ax1.set_title("Sales vs. Profit by Product Category")
ax1.legend(frameon=False)
ax1.axhline(0, color="black", linewidth=0.8)
plt.tight_layout(); plt.savefig(CH+"01_category_sales_profit.png"); plt.close()

# Chart 2: Sub-category profit (sorted, diverging bar - the "Tableau classic")
subs = sub.sort_values("Profit")
fig, ax = plt.subplots(figsize=(7.5, 6.5))
colors = [RED if v < 0 else GREEN for v in subs["Profit"]]
ax.barh(subs["Sub-Category"], subs["Profit"]/1000, color=colors)
ax.axvline(0, color="black", linewidth=0.8)
ax.set_xlabel("Profit ($K)")
ax.set_title("Profit by Sub-Category (sorted)")
plt.tight_layout(); plt.savefig(CH+"02_subcategory_profit.png"); plt.close()

# ---------- 2. Time series ----------
ts = df.groupby("Order Month").agg(Sales=("Sales", "sum"), Profit=("Profit", "sum")).reset_index()
results["monthly_sales_head"] = ts.head(3).round(2).to_dict(orient="records")
yearly = df.groupby(df["Order Date"].dt.year).agg(Sales=("Sales","sum"), Profit=("Profit","sum")).reset_index()
yearly.columns = ["Year", "Sales", "Profit"]
results["yearly"] = yearly.round(2).to_dict(orient="records")
yoy_growth = (yearly["Sales"].iloc[-1] / yearly["Sales"].iloc[0]) ** (1/(len(yearly)-1)) - 1
results["cagr_sales"] = float(yoy_growth)

fig, ax = plt.subplots(figsize=(8.5, 4.2))
ax.plot(ts["Order Month"], ts["Sales"]/1000, color=BLUE, linewidth=1.6, label="Monthly Sales ($K)")
ax2 = ax.twinx()
ax2.plot(ts["Order Month"], ts["Profit"]/1000, color=ORANGE, linewidth=1.4, linestyle="--", label="Monthly Profit ($K)")
ax.set_ylabel("Sales ($K)", color=BLUE)
ax2.set_ylabel("Profit ($K)", color=ORANGE)
ax.set_title("Monthly Sales and Profit Trend (2015\u20132018)")
lines1, labels1 = ax.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax.legend(lines1+lines2, labels1+labels2, loc="upper left", frameon=False, fontsize=9)
plt.tight_layout(); plt.savefig(CH+"03_monthly_trend.png"); plt.close()

# Chart: seasonality (avg sales by month-of-year)
df["MonthNum"] = df["Order Date"].dt.month
season = df.groupby("MonthNum")["Sales"].sum().reindex(range(1,13))
month_labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
fig, ax = plt.subplots(figsize=(8, 4))
ax.bar(month_labels, season.values/1000, color=BLUE)
ax.set_ylabel("Total Sales ($K, all years combined)")
ax.set_title("Seasonality: Total Sales by Calendar Month")
plt.tight_layout(); plt.savefig(CH+"04_seasonality.png"); plt.close()
peak_month = month_labels[int(season.values.argmax())]
results["peak_month"] = peak_month
results["peak_month_share"] = float(season.max() / season.sum())

# ---------- 3. Region / State ----------
reg = df.groupby("Region").agg(Sales=("Sales","sum"), Profit=("Profit","sum")).reset_index()
reg["Margin"] = reg["Profit"]/reg["Sales"]
reg = reg.sort_values("Sales", ascending=False)
results["by_region"] = reg.round(2).to_dict(orient="records")

state = df.groupby("State").agg(Sales=("Sales","sum"), Profit=("Profit","sum")).reset_index()
state["Margin"] = state["Profit"]/state["Sales"]
top10_state_sales = state.sort_values("Sales", ascending=False).head(10)
bottom10_state_profit = state.sort_values("Profit", ascending=True).head(10)
results["top10_state_sales"] = top10_state_sales.round(2).to_dict(orient="records")
results["bottom10_state_profit"] = bottom10_state_profit.round(2).to_dict(orient="records")

fig, ax = plt.subplots(figsize=(7, 4.2))
colors = [BLUE, ORANGE, GREEN, RED]
ax.bar(reg["Region"], reg["Sales"]/1000, color=colors)
for i, v in enumerate(reg["Margin"]):
    ax.text(i, reg["Sales"].iloc[i]/1000 + 15, f"{v*100:.1f}% margin", ha="center", fontsize=9)
ax.set_ylabel("Sales ($K)")
ax.set_title("Sales by Region (label = profit margin)")
plt.tight_layout(); plt.savefig(CH+"05_region_sales.png"); plt.close()

fig, ax = plt.subplots(figsize=(7.5, 5.5))
t10 = top10_state_sales.sort_values("Sales")
ax.barh(t10["State"], t10["Sales"]/1000, color=BLUE)
ax.set_xlabel("Sales ($K)")
ax.set_title("Top 10 States by Sales")
plt.tight_layout(); plt.savefig(CH+"06_top_states.png"); plt.close()

# ---------- 4. Discount vs profit ----------
corr_discount_profit = df["Discount"].corr(df["Profit Margin"])
corr_discount_margin_pearson = df["Discount"].corr(df["Profit"])
results["corr_discount_profitmargin"] = float(corr_discount_profit)
results["corr_discount_profit"] = float(corr_discount_margin_pearson)

fig, ax = plt.subplots(figsize=(7.5, 5))
sample = df.sample(1800, random_state=1)
sc = ax.scatter(sample["Discount"], sample["Profit"], c=sample["Profit"] < 0, cmap="coolwarm", alpha=0.5, s=14)
ax.axhline(0, color="black", linewidth=0.8)
ax.set_xlabel("Discount"); ax.set_ylabel("Profit ($)")
ax.set_title("Discount vs. Profit (line-item level)")
plt.tight_layout(); plt.savefig(CH+"07_discount_vs_profit.png"); plt.close()

disc_bins = pd.cut(df["Discount"], bins=[-0.01,0,0.2,0.3,0.5,0.8], labels=["0%","1-20%","21-30%","31-50%","51-80%"])
disc_group = df.groupby(disc_bins, observed=True).agg(AvgMargin=("Profit Margin","mean"), Lines=("Sales","size")).reset_index()
results["discount_band_margin"] = disc_group.round(3).to_dict(orient="records")

fig, ax = plt.subplots(figsize=(7, 4.2))
ax.bar(disc_group["Discount"].astype(str), disc_group["AvgMargin"]*100, color=[GREEN if v>0 else RED for v in disc_group["AvgMargin"]])
ax.axhline(0, color="black", linewidth=0.8)
ax.set_ylabel("Average Profit Margin (%)")
ax.set_xlabel("Discount Band")
ax.set_title("Average Profit Margin by Discount Band")
plt.tight_layout(); plt.savefig(CH+"08_discount_bands.png"); plt.close()

# ---------- 5. Segment analysis ----------
seg = df.groupby("Segment").agg(Sales=("Sales","sum"), Profit=("Profit","sum"), Customers=("Customer ID","nunique")).reset_index()
seg["Margin"] = seg["Profit"]/seg["Sales"]
results["by_segment"] = seg.round(2).to_dict(orient="records")

fig, ax = plt.subplots(figsize=(6.5, 4.2))
ax.pie(seg["Sales"], labels=seg["Segment"], autopct="%1.0f%%", colors=PALETTE[:3],
       wedgeprops=dict(edgecolor="white"))
ax.set_title("Share of Sales by Customer Segment")
plt.tight_layout(); plt.savefig(CH+"09_segment_pie.png"); plt.close()

# ---------- 6. Ship mode ----------
ship = df.groupby("Ship Mode").agg(Sales=("Sales","sum"), AvgDays=("Ship Days","mean"), Lines=("Sales","size")).reset_index()
results["by_ship_mode"] = ship.round(2).to_dict(orient="records")

# ---------- 7. Correlation heatmap ----------
num_cols = ["Sales","Quantity","Discount","Profit"]
corr = df[num_cols].corr()
results["correlation_matrix"] = corr.round(3).to_dict()

fig, ax = plt.subplots(figsize=(5.2, 4.6))
im = ax.imshow(corr, cmap="RdBu_r", vmin=-1, vmax=1)
ax.set_xticks(range(len(num_cols))); ax.set_xticklabels(num_cols, rotation=30, ha="right")
ax.set_yticks(range(len(num_cols))); ax.set_yticklabels(num_cols)
for i in range(len(num_cols)):
    for j in range(len(num_cols)):
        ax.text(j, i, f"{corr.iloc[i,j]:.2f}", ha="center", va="center",
                 color="white" if abs(corr.iloc[i,j])>0.5 else "black", fontsize=9)
plt.colorbar(im, fraction=0.046, pad=0.04)
ax.set_title("Correlation Matrix: Core Numeric Fields")
plt.tight_layout(); plt.savefig(CH+"10_correlation_heatmap.png"); plt.close()

# ---------- 8. Outliers (boxplot) ----------
fig, ax = plt.subplots(figsize=(7.5, 4.5))
data_to_plot = [df[df["Category"]==c]["Profit"] for c in cat["Category"]]
bp = ax.boxplot(data_to_plot, labels=cat["Category"], showfliers=True, patch_artist=True,
                 flierprops=dict(marker='o', markersize=3, alpha=0.3, markerfacecolor=RED, markeredgecolor='none'))
for patch, color in zip(bp['boxes'], PALETTE[:3]):
    patch.set_facecolor(color); patch.set_alpha(0.5)
ax.axhline(0, color="black", linewidth=0.8)
ax.set_ylabel("Profit per line item ($)")
ax.set_title("Profit Distribution & Outliers by Category")
plt.tight_layout(); plt.savefig(CH+"11_outliers_boxplot.png"); plt.close()

# outlier quantification via IQR on Profit
Q1, Q3 = df["Profit"].quantile(.25), df["Profit"].quantile(.75)
IQR = Q3-Q1
lo_fence, hi_fence = Q1-1.5*IQR, Q3+1.5*IQR
outliers = df[(df["Profit"]<lo_fence)|(df["Profit"]>hi_fence)]
results["outlier_count"] = int(len(outliers))
results["outlier_pct"] = float(len(outliers)/len(df))
results["outlier_fences"] = [float(lo_fence), float(hi_fence)]

# ---------- 9. Top customers (Pareto) ----------
cust = df.groupby("Customer ID").agg(Sales=("Sales","sum"), Profit=("Profit","sum")).reset_index().sort_values("Sales", ascending=False)
cust["cum_sales_pct"] = cust["Sales"].cumsum()/cust["Sales"].sum()
cust_20pct_n = int(len(cust)*0.2)
share_from_top20 = cust["cum_sales_pct"].iloc[cust_20pct_n-1]
results["pareto_top20pct_customers_sales_share"] = float(share_from_top20)

fig, ax = plt.subplots(figsize=(7.5,4.2))
ax.plot(np.arange(1,len(cust)+1)/len(cust)*100, cust["cum_sales_pct"]*100, color=BLUE, linewidth=2)
ax.axvline(20, color=RED, linestyle="--", linewidth=1)
ax.axhline(share_from_top20*100, color=RED, linestyle="--", linewidth=1)
ax.set_xlabel("% of Customers (ranked by sales)")
ax.set_ylabel("Cumulative % of Total Sales")
ax.set_title("Customer Sales Concentration (Pareto Curve)")
plt.tight_layout(); plt.savefig(CH+"12_pareto_customers.png"); plt.close()

with open("../data/results.json", "w") as f:
    json.dump(results, f, indent=2, default=str)

print("DONE. Key results:")
for k in ["total_sales","total_profit","overall_margin","total_orders","unique_customers",
          "avg_discount","cagr_sales","peak_month","corr_discount_profitmargin",
          "outlier_count","outlier_pct","pareto_top20pct_customers_sales_share"]:
    print(k, "=", results[k])
