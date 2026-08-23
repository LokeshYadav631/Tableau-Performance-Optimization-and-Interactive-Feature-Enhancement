import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans", "figure.dpi": 150})

NAVY="#1F3864"; ACCENT="#4E79A7"; ORANGE="#F28E2B"; GREEN="#59A14F"; RED="#E15759"
GREY="#7F7F7F"; LIGHT="#F2F4F7"; BORDER="#B7C0CC"; WHITE="#FFFFFF"; PURPLE="#B07AA1"; GOLD="#EDC948"

OUT = "./mockups/"

def rbox(ax, x, y, w, h, label, fc=WHITE, ec=NAVY, fontsize=8.4, weight="bold", text_color=NAVY, lw=1.5, sub=None, fontsize2=None, sub_color=None):
    r = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.010,rounding_size=0.010",
                        linewidth=lw, edgecolor=ec, facecolor=fc, zorder=3)
    ax.add_patch(r)
    if sub:
        ax.text(x+w/2, y+h*0.66, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4, linespacing=1.3)
        ax.text(x+w/2, y+h*0.30, sub, ha="center", va="center", fontsize=fontsize2 or fontsize-1.5, color=sub_color or GREY, zorder=4, linespacing=1.3)
    else:
        ax.text(x+w/2, y+h/2, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4, linespacing=1.3)
    return r

def arrow(ax, xy1, xy2, color=NAVY, lw=1.8, connection="arc3,rad=0.0"):
    a = FancyArrowPatch(xy1, xy2, arrowstyle="-|>", mutation_scale=13, linewidth=lw,
                          color=color, connectionstyle=connection, zorder=2)
    ax.add_patch(a)

# =========================================================================
# DIAGRAM 1 — Six-week journey timeline
# =========================================================================
weeks = [
    ("WEEK 1", "Exploratory Data\nAnalysis", ACCENT),
    ("WEEK 2", "Dashboard Planning\n& Design Strategy", ACCENT),
    ("WEEK 3", "Interactive Data\nStorytelling", ORANGE),
    ("WEEK 4", "Advanced Charts &\nCalculated Fields", ORANGE),
    ("WEEK 5", "Performance\nOptimization", GREEN),
    ("WEEK 6", "Final Integration\n& Evaluation", NAVY),
]
fig, ax = plt.subplots(figsize=(12.4, 3.2))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")
n = len(weeks)
w = 0.135
gap = (1 - n*w - 0.02) / (n-1)
x = 0.01
y, h = 0.30, 0.46
for i,(wk, desc, color) in enumerate(weeks):
    rbox(ax, x, y, w, h, wk, fc=color, ec=color, text_color="white", fontsize=9.5, sub=desc, fontsize2=7.6, sub_color="#EAEFF7")
    if i < n-1:
        arrow(ax, (x+w+0.004, y+h/2), (x+w+gap-0.004, y+h/2), color=BORDER, lw=1.6)
    x += w + gap
ax.text(0.5, 0.90, "Six-Week Learning Journey \u2014 From Raw Data to a Production-Ready Analytics Practice", ha="center", fontsize=12, weight="bold", color=NAVY)
ax.text(0.5, 0.10, "Analysis (1\u20132)  \u2192  Communication (3\u20134)  \u2192  Production Readiness (5\u20136)", ha="center", fontsize=8.4, color=GREY, style="italic")
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"journey_timeline.png", bbox_inches="tight")
plt.close()

# =========================================================================
# DIAGRAM 2 — Integrated workbook architecture (all 6 weeks combined)
# =========================================================================
fig, ax = plt.subplots(figsize=(11.6, 6.6))
ax.set_xlim(0,1.06); ax.set_ylim(0,1); ax.axis("off")

# Layer labels on the right
ax.text(1.045, 0.885, "narrative\nlayer (Wk 3)", ha="left", fontsize=7, color=GREY, style="italic", linespacing=1.4)
ax.text(1.045, 0.64, "exploration layer\n(Wk 2 & 4)", ha="left", fontsize=7, color=GREY, style="italic", linespacing=1.4)
ax.text(1.045, 0.16, "foundation &\ngovernance\n(Wk 1 & 5)", ha="left", fontsize=7, color=GREY, style="italic", linespacing=1.4)

# Story layer
rbox(ax, 0.30, 0.83, 0.40, 0.115, "GUIDED STORY", fc=NAVY, ec=NAVY, text_color="white", fontsize=10,
     sub="\u201cBeyond the Top Line\u201d \u2014 7 scenes, what-if parameter", fontsize2=7.4, sub_color="#D7DEEA")

# 4 dashboards
boards = [
    ("DASHBOARD A", "Executive\nOverview", 0.02),
    ("DASHBOARD B", "Product &\nProfitability", 0.265),
    ("DASHBOARD C", "Customer &\nGeographic", 0.51),
    ("DASHBOARD D", "Advanced\nAnalytics", 0.755),
]
for title, sub, x in boards:
    rbox(ax, x, 0.565, 0.225, 0.155, title, fc=WHITE, ec=ACCENT, text_color=NAVY, fontsize=8.4, sub=sub, fontsize2=7.6)
    arrow(ax, (0.5, 0.83), (x+0.1125, 0.72), color=BORDER, lw=1.3)

# Foundation layer: data + calc engine + performance layer
rbox(ax, 0.02, 0.30, 0.45, 0.155,
     "DATA FOUNDATION (Week 1)", fc=LIGHT, ec=BORDER, text_color=NAVY, fontsize=8.6,
     sub="9,994-row extract \u2022 12 validated EDA findings \u2022\nshared results.json feeds every later week", fontsize2=7.2)
rbox(ax, 0.53, 0.30, 0.45, 0.155,
     "CALCULATION LAYER (Week 4)", fc=LIGHT, ec=BORDER, text_color=NAVY, fontsize=8.6,
     sub="8 calculated fields \u2022 LOD + table calcs\n(LOOKUP, RUNNING_SUM, WINDOW_*, RANK)", fontsize2=7.2)
for x in [0.245, 0.755]:
    arrow(ax, (x, 0.565), (x, 0.455), color=BORDER, lw=1.3)

rbox(ax, 0.02, 0.09, 0.96, 0.14,
     "PERFORMANCE & GOVERNANCE LAYER (Week 5)", fc="#EAF3EC", ec=GREEN, text_color="#1F5C2E", fontsize=8.8,
     sub="Extract strategy \u2022 context filters \u2022 scoped actions \u2022 6-stage re-run workflow \u2014 underlies every layer above", fontsize2=7.4, sub_color="#3D7A4C")
arrow(ax, (0.25, 0.30), (0.25, 0.23), color=GREEN, lw=1.3)
arrow(ax, (0.75, 0.30), (0.75, 0.23), color=GREEN, lw=1.3)

ax.text(0.5, 0.975, "Integrated Workbook Architecture \u2014 All Six Weeks Combined", ha="center", fontsize=12.5, weight="bold", color=NAVY)
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"integrated_architecture.png", bbox_inches="tight")
plt.close()

print("Week 6 diagrams done")
