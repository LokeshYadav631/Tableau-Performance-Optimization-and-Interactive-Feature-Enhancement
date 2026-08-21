import pandas as pd, numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.dates as mdates

plt.rcParams.update({"font.family": "DejaVu Sans", "figure.dpi": 150,
                      "axes.spines.top": False, "axes.spines.right": False})

NAVY="#1F3864"; ACCENT="#4E79A7"; ORANGE="#F28E2B"; GREEN="#59A14F"; RED="#E15759"
GREY="#7F7F7F"; LIGHT="#F2F4F7"; BORDER="#B7C0CC"

OUT = "./mockups/"

# =========================================================================
# 1. BULLET CHART — Regional Sales vs. Target, 2018
# =========================================================================
bullet = pd.read_csv("bullet_data.csv")
bullet = bullet.sort_values("Actual_2018")

fig, ax = plt.subplots(figsize=(8.2, 3.6))
y = np.arange(len(bullet))
for i, row in bullet.reset_index(drop=True).iterrows():
    t = row["Target_2018"]
    # qualitative background ranges: poor/satisfactory/good as % of target
    ax.barh(i, t*0.6, height=0.55, color="#E3E7EE", zorder=1)
    ax.barh(i, t*0.85-t*0.6, left=t*0.6, height=0.55, color="#CBD3DE", zorder=1)
    ax.barh(i, t*1.25-t*0.85, left=t*0.85, height=0.55, color="#B7C0CC", zorder=1)
    # actual performance bar (thin, centered)
    color = GREEN if row["Actual_2018"] >= t else RED
    ax.barh(i, row["Actual_2018"], height=0.22, color=color, zorder=3)
    # target tick
    ax.plot([t, t], [i-0.32, i+0.32], color=NAVY, linewidth=2.6, zorder=4)
ax.set_yticks(y); ax.set_yticklabels(bullet["Region"])
ax.set_xlabel("2018 Sales ($)")
ax.set_title("Bullet Chart \u2014 Regional Sales vs. Target (2018)")
handles = [mpatches.Patch(color=GREEN, label="Actual \u2265 Target"),
           mpatches.Patch(color=RED, label="Actual < Target"),
           plt.Line2D([0],[0], color=NAVY, linewidth=2.6, label="Target (110% of PY)")]
ax.legend(handles=handles, loc="lower right", fontsize=7.5, frameon=False)
plt.tight_layout()
plt.savefig(OUT+"adv_bullet_chart.png", bbox_inches="tight")
plt.close()

# =========================================================================
# 2. WATERFALL CHART — Category Profit Bridge to Total
# =========================================================================
wf = pd.read_csv("waterfall_data.csv")
wf.columns = ["Category","Profit"]
wf = wf.sort_values("Profit", ascending=False).reset_index(drop=True)
labels = list(wf["Category"]) + ["Total Profit"]
values = list(wf["Profit"]) + [wf["Profit"].sum()]

fig, ax = plt.subplots(figsize=(7.6, 4.2))
running = 0
for i, (lab, v) in enumerate(zip(labels, values)):
    if lab == "Total Profit":
        ax.bar(i, v, color=NAVY, width=0.6, zorder=3)
        ax.text(i, v+4000, f"${v/1000:.0f}K", ha="center", fontsize=8.5, weight="bold", color=NAVY)
    else:
        ax.bar(i, v, bottom=running, color=ACCENT, width=0.6, zorder=3)
        ax.text(i, running+v/2, f"+${v/1000:.0f}K", ha="center", va="center", fontsize=8, color="white", weight="bold")
        # connector line
        ax.plot([i-0.3+1, i+0.3], [running+v, running+v], color=GREY, linewidth=1, linestyle="--", zorder=2)
        running += v
ax.set_xticks(range(len(labels))); ax.set_xticklabels(labels, rotation=12)
ax.set_ylabel("Cumulative Profit ($)")
ax.set_title("Waterfall Chart \u2014 Category Contribution to Total Profit")
ax.axhline(0, color="black", linewidth=0.8)
plt.tight_layout()
plt.savefig(OUT+"adv_waterfall_chart.png", bbox_inches="tight")
plt.close()

# =========================================================================
# 3. CONTROL CHART — Monthly Profit Margin with UCL/LCL bands
# =========================================================================
ctrl = pd.read_csv("control_data.csv", parse_dates=["Order Month"])
mean_m = ctrl["Margin"].mean(); std_m = ctrl["Margin"].std()
ucl, lcl = mean_m+2*std_m, mean_m-2*std_m

fig, ax = plt.subplots(figsize=(8.6, 4.0))
ax.axhspan(lcl, ucl, color=GREEN, alpha=0.08, zorder=1)
ax.plot(ctrl["Order Month"], ctrl["Margin"]*100, color=ACCENT, linewidth=1.6, zorder=3)
ax.axhline(mean_m*100, color=NAVY, linewidth=1.3, linestyle="-", zorder=2, label="Mean margin")
ax.axhline(ucl*100, color=RED, linewidth=1.2, linestyle="--", zorder=2, label="UCL / LCL (\u00b12\u03c3)")
ax.axhline(lcl*100, color=RED, linewidth=1.2, linestyle="--", zorder=2)
anom = ctrl[ctrl["Anomaly"]]
ax.scatter(anom["Order Month"], anom["Margin"]*100, color=RED, s=45, zorder=4, label="Out-of-control month")
for _, r in anom.iterrows():
    ax.annotate(r["Order Month"].strftime("%b %Y"), (r["Order Month"], r["Margin"]*100),
                textcoords="offset points", xytext=(0,9), ha="center", fontsize=6.5, color=RED)
ax.set_ylabel("Monthly Profit Margin (%)")
ax.set_title("Control Chart \u2014 Monthly Profit Margin with \u00b12\u03c3 Bands")
ax.legend(loc="upper left", fontsize=7.5, frameon=False, ncol=3)
ax.xaxis.set_major_locator(mdates.YearLocator())
ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
plt.tight_layout()
plt.savefig(OUT+"adv_control_chart.png", bbox_inches="tight")
plt.close()

# =========================================================================
# 4. BUMP CHART — Sub-Category Profit Rank Trend, 2015-2018
# =========================================================================
bump = pd.read_csv("bump_data.csv")
top_subs = bump[bump["Year"]==2018].sort_values("Rank").head(6)["Sub-Category"].tolist()
loss_subs = ["Machines","Tables"]
highlight = list(dict.fromkeys(top_subs + loss_subs))

fig, ax = plt.subplots(figsize=(8.6, 5.2))
years = sorted(bump["Year"].unique())
colors_cycle = [ACCENT, ORANGE, GREEN, "#76B7B2", "#B07AA1", "#EDC948", RED, "#9C6644"]
ci = 0
for sub in bump["Sub-Category"].unique():
    d = bump[bump["Sub-Category"]==sub].sort_values("Year")
    if sub in highlight:
        c = RED if sub in loss_subs else colors_cycle[ci % len(colors_cycle)]
        if sub not in loss_subs: ci += 1
        ax.plot(d["Year"], d["Rank"], color=c, linewidth=2.2, marker="o", markersize=5, zorder=4)
        ax.text(years[-1]+0.15, d[d["Year"]==years[-1]]["Rank"].values[0], sub, va="center", fontsize=7.6, color=c, weight="bold")
    else:
        ax.plot(d["Year"], d["Rank"], color="#DDDDDD", linewidth=1, zorder=2)
ax.invert_yaxis()
ax.set_xticks(years)
ax.set_ylabel("Profit Rank (1 = highest profit)")
ax.set_title("Bump Chart \u2014 Sub-Category Profit Rank Trend, 2015\u20132018")
ax.set_xlim(years[0]-0.1, years[-1]+1.3)
plt.tight_layout()
plt.savefig(OUT+"adv_bump_chart.png", bbox_inches="tight")
plt.close()

print("Advanced charts done")
