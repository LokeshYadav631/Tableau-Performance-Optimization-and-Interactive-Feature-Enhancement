import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
from matplotlib.lines import Line2D
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans", "figure.dpi": 150})

NAVY = "#1F3864"
ACCENT = "#4E79A7"
ORANGE = "#F28E2B"
GREEN = "#59A14F"
RED = "#E15759"
GREY = "#7F7F7F"
LIGHT = "#F2F4F7"
BORDER = "#B7C0CC"
WHITE = "#FFFFFF"

OUT = "./mockups/"

def box(ax, x, y, w, h, label, fc=LIGHT, ec=BORDER, fontsize=9, weight="normal",
        text_color="#222222", ls="-", lw=1.3, align="center", va="center", pad=0.02):
    r = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad={pad},rounding_size=0.006",
                        linewidth=lw, edgecolor=ec, facecolor=fc, linestyle=ls, zorder=2)
    ax.add_patch(r)
    tx = x + w/2 if align == "center" else x + 0.02
    ha = "center" if align == "center" else "left"
    ax.text(tx, y + h/2, label, ha=ha, va=va, fontsize=fontsize, color=text_color,
             weight=weight, zorder=3, wrap=True)
    return r

def chart_icon(ax, x, y, w, h, kind="bar"):
    """Draw a tiny schematic chart icon inside a box to suggest chart type."""
    ix, iy, iw, ih = x + w*0.08, y + h*0.18, w*0.84, h*0.55
    if kind == "bar":
        n = 5
        bw = iw/(n*1.6)
        heights = [0.3, 0.55, 0.4, 0.8, 0.6]
        for i, hh in enumerate(heights):
            bx = ix + i*(iw/n)
            ax.add_patch(mpatches.Rectangle((bx, iy), bw, ih*hh, facecolor=ACCENT, edgecolor="none", zorder=3))
    elif kind == "hbar":
        n = 5
        bh = ih/(n*1.6)
        widths = [0.9, 0.7, 0.55, 0.35, 0.2]
        for i, ww in enumerate(widths):
            by = iy + i*(ih/n)
            c = GREEN if ww > 0.3 else RED
            ax.add_patch(mpatches.Rectangle((ix, by), iw*abs(ww), bh, facecolor=c, edgecolor="none", zorder=3))
    elif kind == "line":
        xs = np.linspace(ix, ix+iw, 12)
        ys = iy + ih*(0.3+0.35*np.sin(np.linspace(0,6,12))+0.2*np.linspace(0,1,12))
        ax.plot(xs, ys, color=ACCENT, linewidth=1.6, zorder=3)
        ys2 = iy + ih*(0.2+0.25*np.cos(np.linspace(0,6,12)))
        ax.plot(xs, ys2, color=ORANGE, linewidth=1.3, linestyle="--", zorder=3)
    elif kind == "map":
        ax.add_patch(mpatches.Ellipse((ix+iw*0.5, iy+ih*0.5), iw*0.95, ih*0.9, facecolor="#DCE6F1", edgecolor=ACCENT, linewidth=1, zorder=3))
        for cx, cy, r, c in [(0.3,0.6,0.05,ACCENT),(0.55,0.4,0.08,ORANGE),(0.7,0.65,0.04,GREEN),(0.4,0.3,0.03,RED)]:
            ax.add_patch(Circle((ix+iw*cx, iy+ih*cy), iw*r, facecolor=c, edgecolor="white", linewidth=0.6, zorder=4))
    elif kind == "pie":
        ax.add_patch(mpatches.Wedge((ix+iw*0.5, iy+ih*0.5), min(iw,ih)*0.45, 0, 187, facecolor=ACCENT, zorder=3))
        ax.add_patch(mpatches.Wedge((ix+iw*0.5, iy+ih*0.5), min(iw,ih)*0.45, 187, 300, facecolor=ORANGE, zorder=3))
        ax.add_patch(mpatches.Wedge((ix+iw*0.5, iy+ih*0.5), min(iw,ih)*0.45, 300, 360, facecolor=GREEN, zorder=3))
    elif kind == "scatter":
        rng = np.random.default_rng(3)
        xs = ix + iw*rng.uniform(0.05,0.95,22)
        ys = iy + ih*rng.uniform(0.05,0.95,22)
        cs = [RED if rng.uniform()<0.3 else ACCENT for _ in range(22)]
        ax.scatter(xs, ys, c=cs, s=10, zorder=3)
    elif kind == "kpi":
        ax.text(ix+iw*0.5, iy+ih*0.55, "$—", ha="center", va="center", fontsize=13, weight="bold", color=NAVY, zorder=3)
        ax.text(ix+iw*0.5, iy+ih*0.15, "vs. LY \u25B2", ha="center", va="center", fontsize=6.5, color=GREEN, zorder=3)

def panel(ax, x, y, w, h, title, kind, note=None, fc=WHITE):
    box(ax, x, y, w, h, "", fc=fc, ec=BORDER, lw=1.1)
    ax.text(x+0.012, y+h-0.028, title, ha="left", va="top", fontsize=7.6, weight="bold", color=NAVY, zorder=4)
    chart_icon(ax, x, y-0.01, w, h-0.05, kind=kind)
    if note:
        ax.text(x+w/2, y+0.014, note, ha="center", va="bottom", fontsize=5.6, color=GREY, style="italic", zorder=4)

def new_canvas(figsize=(9.0,5.2)):
    fig, ax = plt.subplots(figsize=figsize)
    ax.set_xlim(0,1); ax.set_ylim(0,1)
    ax.axis("off")
    return fig, ax

def header_bar(ax, title, subtitle=None):
    box(ax, 0.0, 0.90, 1.0, 0.10, "", fc=NAVY, ec=NAVY, lw=0)
    ax.text(0.015, 0.955, title, ha="left", va="center", fontsize=11, weight="bold", color="white", zorder=4)
    if subtitle:
        ax.text(0.985, 0.955, subtitle, ha="right", va="center", fontsize=7, color="#CBD5E1", zorder=4)

def filter_bar(ax, y=0.855, h=0.038):
    filters = ["Date Range \u25BE", "Region \u25BE", "Category \u25BE", "Segment \u25BE", "Discount %  \u25AC\u25AC\u25CF\u25AC\u25AC"]
    x = 0.012
    for f in filters:
        w = 0.03 + 0.014*len(f)
        box(ax, x, y, w, h, f, fc="#E8ECF3", ec=BORDER, fontsize=6.4, text_color="#333333")
        x += w + 0.012

# =========================================================================
# WIREFRAME 1 — Executive Overview Dashboard
# =========================================================================
fig, ax = new_canvas()
header_bar(ax, "SUPERSTORE PERFORMANCE \u2014 EXECUTIVE OVERVIEW", "Updated: Live  |  superstore.tableau.com")
filter_bar(ax)
# KPI row
kpi_labels = ["Total Sales", "Total Profit", "Profit Margin", "Orders", "Avg. Discount"]
kx = 0.012; kw = (1-0.024-4*0.012)/5; ky = 0.735; kh = 0.095
for lab in kpi_labels:
    panel(ax, kx, ky, kw, kh, lab, "kpi")
    kx += kw + 0.012
# Main row: category/sub-category profit (left, tall) + monthly trend (right top) + seasonality (right bottom)
panel(ax, 0.012, 0.30, 0.36, 0.415, "Profit by Sub-Category", "hbar", "sorted, red = loss")
panel(ax, 0.386, 0.52, 0.602, 0.195, "Monthly Sales & Profit Trend", "line", "dual axis, 2015\u20132018")
panel(ax, 0.386, 0.30, 0.294, 0.20, "Sales by Region", "bar", "labeled w/ margin %")
panel(ax, 0.694, 0.30, 0.294, 0.20, "Seasonality (by month)", "bar")
# Bottom row: map + segment + discount scatter
panel(ax, 0.012, 0.03, 0.33, 0.255, "Sales & Profit by State", "map", "filled map, color=margin")
panel(ax, 0.354, 0.03, 0.30, 0.255, "Discount vs. Profit", "scatter", "line-item detail")
panel(ax, 0.666, 0.03, 0.322, 0.255, "Segment Mix", "pie")
ax.text(0.985, 0.008, "Fig. Wireframe A \u2014 Executive Overview (1 of 3 dashboards)", ha="right", fontsize=6, color=GREY, style="italic")
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"wf1_executive_overview.png", bbox_inches="tight")
plt.close()

# =========================================================================
# WIREFRAME 2 — Product & Profitability Deep-Dive
# =========================================================================
fig, ax = new_canvas()
header_bar(ax, "PRODUCT & PROFITABILITY DEEP-DIVE", "Drilled from: Executive Overview")
filter_bar(ax)
panel(ax, 0.012, 0.50, 0.486, 0.335, "Sales vs. Profit by Category", "bar", "3 categories, dual bars")
panel(ax, 0.502, 0.50, 0.486, 0.335, "Profit by Sub-Category (sorted)", "hbar", "click to filter panels below")
panel(ax, 0.012, 0.245, 0.486, 0.235, "Average Margin by Discount Band", "bar", "0% / 1-20% / 21-30% / 31-50% / 51-80%")
panel(ax, 0.502, 0.245, 0.486, 0.235, "Discount vs. Profit (scatter)", "scatter", "1,800-pt sample, red = loss")
panel(ax, 0.012, 0.03, 0.486, 0.185, "Profit Distribution by Category (box plot)", "bar", "outlier detection")
panel(ax, 0.502, 0.03, 0.486, 0.185, "Correlation Heatmap", "map", "Sales / Qty / Discount / Profit")
ax.text(0.985, 0.008, "Fig. Wireframe B \u2014 Product & Profitability Deep-Dive (2 of 3)", ha="right", fontsize=6, color=GREY, style="italic")
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"wf2_product_deepdive.png", bbox_inches="tight")
plt.close()

# =========================================================================
# WIREFRAME 3 — Customer & Geographic Analysis
# =========================================================================
fig, ax = new_canvas()
header_bar(ax, "CUSTOMER & GEOGRAPHIC ANALYSIS", "Drilled from: Executive Overview")
filter_bar(ax)
panel(ax, 0.012, 0.50, 0.60, 0.335, "Sales & Profit Map by State", "map", "size=sales, color=margin")
panel(ax, 0.626, 0.665, 0.362, 0.17, "Sales by Segment", "pie")
panel(ax, 0.626, 0.50, 0.362, 0.15, "Top / Bottom 10 States by Profit", "hbar")
panel(ax, 0.012, 0.245, 0.486, 0.235, "Customer Sales Concentration (Pareto)", "line", "cum. % of sales by customer rank")
panel(ax, 0.502, 0.245, 0.486, 0.235, "Sales by Ship Mode", "bar", "+ avg. days to ship")
panel(ax, 0.012, 0.03, 0.976, 0.185, "Customer Detail Table (rank, sales, profit, orders, segment)", "kpi", "sortable / searchable grid")
ax.text(0.985, 0.008, "Fig. Wireframe C \u2014 Customer & Geographic Analysis (3 of 3)", ha="right", fontsize=6, color=GREY, style="italic")
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"wf3_customer_geo.png", bbox_inches="tight")
plt.close()

print("Wireframes done")
