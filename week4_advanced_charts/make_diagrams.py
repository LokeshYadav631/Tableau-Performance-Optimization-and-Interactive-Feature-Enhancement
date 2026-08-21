import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans", "figure.dpi": 150})

NAVY="#1F3864"; ACCENT="#4E79A7"; ORANGE="#F28E2B"; GREEN="#59A14F"; RED="#E15759"
GREY="#7F7F7F"; LIGHT="#F2F4F7"; BORDER="#B7C0CC"; WHITE="#FFFFFF"; PURPLE="#B07AA1"

OUT = "./mockups/"

def box(ax, x, y, w, h, label, fc=LIGHT, ec=BORDER, fontsize=9, weight="normal",
        text_color="#222222", lw=1.3):
    r = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.006",
                        linewidth=lw, edgecolor=ec, facecolor=fc, zorder=2)
    ax.add_patch(r)
    ax.text(x+w/2, y+h/2, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=3, linespacing=1.3)
    return r

def header_bar(ax, title, subtitle=None):
    box(ax, 0.0, 0.92, 1.0, 0.08, "", fc=NAVY, ec=NAVY, lw=0)
    ax.text(0.015, 0.96, title, ha="left", va="center", fontsize=11, weight="bold", color="white", zorder=4)
    if subtitle:
        ax.text(0.985, 0.96, subtitle, ha="right", va="center", fontsize=7, color="#CBD5E1", zorder=4)

def filter_bar(ax, y=0.865, h=0.038):
    filters = ["Date Range \u25BE", "Region \u25BE", "\u03c3 Multiplier: 2.0 \u25AC\u25AC\u25CF\u25AC\u25AC", "Rank Basis: Profit \u25BE"]
    x = 0.012
    for f in filters:
        w = 0.035 + 0.0125*len(f)
        box(ax, x, y, w, h, f, fc="#E8ECF3", ec=BORDER, fontsize=6.6, text_color="#333333")
        x += w + 0.014

# =========================================================================
# DIAGRAM 1 — Dashboard D wireframe: Advanced Analytics
# =========================================================================
fig, ax = plt.subplots(figsize=(9.2, 5.3))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")
header_bar(ax, "ADVANCED ANALYTICS \u2014 PERFORMANCE, MIX & ANOMALIES", "Dashboard D  |  drilled from Executive Overview")
filter_bar(ax)

box(ax, 0.012, 0.475, 0.486, 0.365,
    "BULLET CHART\nRegional Sales vs. Target\n\n[reference: interactive target line\nvia Target parameter; click a bar\nto filter Dashboards B/C]",
    fc="white", ec=ACCENT, fontsize=8.4)
box(ax, 0.502, 0.475, 0.486, 0.365,
    "WATERFALL CHART\nCategory \u2192 Total Profit Bridge\n\n[hover a segment for the calc\nbreakdown tooltip; click to isolate\nthat category everywhere]",
    fc="white", ec=ACCENT, fontsize=8.4)
box(ax, 0.012, 0.08, 0.486, 0.365,
    "CONTROL CHART\nMonthly Margin, \u00b1\u03c3 Bands\n\n[\u03c3 Multiplier parameter (1\u20133) lets\nreader tighten/loosen anomaly\nsensitivity live]",
    fc="white", ec=ORANGE, fontsize=8.4)
box(ax, 0.502, 0.08, 0.486, 0.365,
    "BUMP CHART\nSub-Category Rank Trend\n\n[Rank Basis parameter toggles\nProfit vs. Sales vs. Margin ranking;\nhover a line to isolate it]",
    fc="white", ec=GREEN, fontsize=8.4)

ax.text(0.985, 0.02, "Fig. Wireframe D \u2014 Advanced Analytics dashboard (4th workbook page)", ha="right", fontsize=6, color=GREY, style="italic")
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"wf4_advanced_analytics.png", bbox_inches="tight")
plt.close()

# =========================================================================
# DIAGRAM 2 — Calculation dependency / build-up diagram
# =========================================================================
def rbox(ax, x, y, w, h, label, fc=WHITE, ec=NAVY, fontsize=7.6, weight="bold", text_color=NAVY, lw=1.4):
    r = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.008,rounding_size=0.008",
                        linewidth=lw, edgecolor=ec, facecolor=fc, zorder=3)
    ax.add_patch(r)
    ax.text(x+w/2, y+h/2, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4, linespacing=1.35)
    return r

def arrow(ax, xy1, xy2, color=NAVY, lw=1.6, connection="arc3,rad=0.0"):
    a = FancyArrowPatch(xy1, xy2, arrowstyle="-|>", mutation_scale=11, linewidth=lw,
                          color=color, connectionstyle=connection, zorder=2)
    ax.add_patch(a)

fig, ax = plt.subplots(figsize=(11.6, 5.6))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")

# Row 1: raw fields
raw = [("[Sales]", 0.06), ("[Profit]", 0.22), ("[Discount]", 0.38), ("[Order Date]", 0.56), ("[Sub-Category]", 0.76)]
for lab, x in raw:
    rbox(ax, x, 0.86, 0.14, 0.08, lab, fc=LIGHT, ec=BORDER, text_color="#333", fontsize=7.6, weight="normal")

# Row 2: first-level calcs
lvl2 = [
    ("[Sales Target]\n= LOOKUP(SUM([Sales]),-1) * 1.1", 0.04, ACCENT),
    ("[Waterfall Running Total]\n= RUNNING_SUM(SUM([Profit]))", 0.245, ACCENT),
    ("[Monthly Margin]\n= SUM([Profit]) / SUM([Sales])", 0.46, ACCENT),
    ("[Profit Rank]\n= RANK(SUM([Profit]))", 0.685, ACCENT),
]
for lab, x, c in lvl2:
    rbox(ax, x, 0.62, 0.20, 0.14, lab, fc="white", ec=c, text_color=NAVY, fontsize=7.3)

# Row 3: second-level calcs (derived from level 2)
lvl3 = [
    ("[Target Status]\nIIF(SUM([Sales])>=[Sales Target],\n\"On/Above Target\",\"Below Target\")", 0.02, GREEN),
    ("[Waterfall Base]\n= [Waterfall Running Total]\n\u2212 SUM([Profit])", 0.245, GREEN),
    ("[UCL] / [LCL]\n= WINDOW_AVG([Monthly Margin])\n\u00b1 [\u03c3 Mult.]\u00d7WINDOW_STDEV(...)", 0.44, GREEN),
    ("[Rank Change]\n= LOOKUP([Profit Rank],-1)\n\u2212 [Profit Rank]", 0.70, GREEN),
]
for lab, x, c in lvl3:
    rbox(ax, x, 0.35, 0.235, 0.18, lab, fc="white", ec=c, text_color=NAVY, fontsize=7.0)

# Row 4: chart outputs
outs = [
    ("Bullet Chart\n(Regional target attainment)", 0.06, RED),
    ("Waterfall Chart\n(Category profit bridge)", 0.29, RED),
    ("Control Chart\n(Anomalous months)", 0.53, RED),
    ("Bump Chart\n(Sub-category momentum)", 0.76, RED),
]
for lab, x, c in outs:
    rbox(ax, x, 0.06, 0.185, 0.14, lab, fc=NAVY, ec=NAVY, text_color="white", fontsize=8, weight="bold")

# arrows raw -> lvl2 (approximate mapping)
pairs_12 = [(0,0),(1,1),(1,2),(3,0),(3,2),(4,3)]
raw_x = [0.06+0.07,0.22+0.07,0.38+0.07,0.56+0.07,0.76+0.07]
l2_x = [0.04+0.10,0.245+0.10,0.46+0.10,0.685+0.10]
for ri, li in pairs_12:
    arrow(ax, (raw_x[ri], 0.86), (l2_x[li], 0.76), color=BORDER, lw=1.1)

# arrows lvl2 -> lvl3 (1:1)
l3_x = [0.02+0.1175,0.245+0.1175,0.44+0.1175,0.70+0.1175]
for a,b in zip(l2_x,l3_x):
    arrow(ax, (a,0.62), (b,0.53), color=BORDER, lw=1.1)

# arrows lvl3 -> outputs (1:1)
out_x = [0.06+0.0925,0.29+0.0925,0.53+0.0925,0.76+0.0925]
for a,b in zip(l3_x,out_x):
    arrow(ax, (a,0.35), (b,0.20), color=NAVY, lw=1.5)

ax.text(0.5, 0.985, "Calculation Build-Up \u2014 From Raw Fields to Advanced Chart", ha="center", fontsize=12, weight="bold", color=NAVY)
ax.text(0.99, 0.90, "raw\nfields", ha="right", fontsize=6.5, color=GREY, style="italic")
ax.text(0.99, 0.685, "table calc /\nLOD layer 1", ha="right", fontsize=6.5, color=GREY, style="italic")
ax.text(0.99, 0.42, "derived\nlayer 2", ha="right", fontsize=6.5, color=GREY, style="italic")
ax.text(0.99, 0.11, "chart", ha="right", fontsize=6.5, color=GREY, style="italic")

plt.tight_layout(pad=0.3)
plt.savefig(OUT+"calc_buildup_diagram.png", bbox_inches="tight")
plt.close()

print("Diagrams done")
