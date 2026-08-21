import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
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
PURPLE = "#B07AA1"

OUT = "./mockups/"

def rbox(ax, x, y, w, h, label, fc=WHITE, ec=NAVY, fontsize=9.5, weight="bold",
         text_color=NAVY, lw=1.6, fontsize2=None, sub=None, sub_color=None):
    r = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.012,rounding_size=0.012",
                        linewidth=lw, edgecolor=ec, facecolor=fc, zorder=3)
    ax.add_patch(r)
    if sub:
        ax.text(x+w/2, y+h*0.62, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4)
        ax.text(x+w/2, y+h*0.28, sub, ha="center", va="center", fontsize=fontsize2 or fontsize-2.5, color=sub_color or GREY, zorder=4)
    else:
        ax.text(x+w/2, y+h/2, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4)
    return r

def arrow(ax, xy1, xy2, color=ACCENT, style="-|>", lw=1.8, connection="arc3,rad=0.0", ls="-"):
    a = FancyArrowPatch(xy1, xy2, arrowstyle=style, mutation_scale=14, linewidth=lw,
                          color=color, connectionstyle=connection, zorder=2, linestyle=ls)
    ax.add_patch(a)

# =========================================================================
# DIAGRAM 1 — Dashboard Architecture / Navigation Map
# =========================================================================
fig, ax = plt.subplots(figsize=(9.0, 5.0))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")

rbox(ax, 0.35, 0.80, 0.30, 0.14, "DASHBOARD A", fc=NAVY, ec=NAVY, text_color="white",
     sub="Executive Overview", fontsize2=8.5)

rbox(ax, 0.03, 0.42, 0.30, 0.14, "DASHBOARD B", fc=WHITE, ec=ACCENT, text_color=NAVY,
     sub="Product & Profitability\nDeep-Dive", fontsize2=7.6)
rbox(ax, 0.67, 0.42, 0.30, 0.14, "DASHBOARD C", fc=WHITE, ec=ACCENT, text_color=NAVY,
     sub="Customer & Geographic\nAnalysis", fontsize2=7.6)

rbox(ax, 0.03, 0.10, 0.30, 0.12, "Sub-Category Detail\n(tooltip / hover card)", fc=LIGHT, ec=BORDER,
     text_color="#333333", fontsize=7.6, weight="normal")
rbox(ax, 0.67, 0.10, 0.30, 0.12, "Customer Detail\n(tooltip / hover card)", fc=LIGHT, ec=BORDER,
     text_color="#333333", fontsize=7.6, weight="normal")

# Arrows: overview -> B and C (drill down via KPI tile / chart click)
arrow(ax, (0.42, 0.80), (0.20, 0.56), color=ACCENT)
arrow(ax, (0.58, 0.80), (0.80, 0.56), color=ACCENT)
ax.text(0.29, 0.685, "click a category\nor sub-category", ha="center", fontsize=6.6, color=GREY, style="italic")
ax.text(0.715, 0.685, "click a state\nor region", ha="center", fontsize=6.6, color=GREY, style="italic")

# Return arrows B -> A, C -> A (dashed, labeled "Back to Overview" button)
arrow(ax, (0.24, 0.80-0.005), (0.42, 0.795), color=GREY, ls="--", lw=1.2, connection="arc3,rad=-0.35")
arrow(ax, (0.76, 0.80-0.005), (0.58, 0.795), color=GREY, ls="--", lw=1.2, connection="arc3,rad=0.35")

# B -> detail, C -> detail
arrow(ax, (0.18, 0.42), (0.18, 0.22), color=ACCENT)
arrow(ax, (0.82, 0.42), (0.82, 0.22), color=ACCENT)

# B <-> C cross-navigation (top nav tabs), dashed horizontal
arrow(ax, (0.33, 0.49), (0.67, 0.49), color=PURPLE, lw=1.4, connection="arc3,rad=-0.15")
ax.text(0.5, 0.565, "top navigation tabs (always available)", ha="center", fontsize=6.6, color=PURPLE, style="italic")

# Global filters note
rbox(ax, 0.34, 0.955, 0.32, 0.0, "", fc="none", ec="none", lw=0)  # placeholder spacer
ax.text(0.5, 0.975, "Global filters (Date, Region, Category, Segment, Discount) persist across all three dashboards via Tableau filter actions", ha="center", fontsize=7.6, color=NAVY, weight="bold")

plt.tight_layout(pad=0.3)
plt.savefig(OUT+"diag_architecture.png", bbox_inches="tight")
plt.close()

# =========================================================================
# DIAGRAM 2 — Interaction / Filter-Action Flow (worked example)
# =========================================================================
fig, ax = plt.subplots(figsize=(9.0, 4.6))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")

steps = [
    ("1. User hovers /\nclicks 'West' on\nthe region map", 0.03, WHITE, ACCENT),
    ("2. Tableau 'Filter'\naction fires,\npassing Region=West", 0.28, LIGHT, ACCENT),
    ("3. All sheets on the\ndashboard re-query\nfiltered to West", 0.53, LIGHT, ACCENT),
    ("4. KPI tiles, trend line,\nsub-category bars &\nmap re-render instantly", 0.78, WHITE, GREEN),
]
w, h, y = 0.19, 0.30, 0.36
for i,(label, x, fc, ec) in enumerate(steps):
    rbox(ax, x, y, w, h, label, fc=fc, ec=ec, text_color="#222222", fontsize=7.6, weight="normal", lw=1.6)
    if i < len(steps)-1:
        arrow(ax, (x+w+0.005, y+h/2), (x+0.25+0.005, y+h/2), color=NAVY, lw=2)

ax.text(0.5, 0.82, "Worked Example: Cross-Filtering on Click", ha="center", fontsize=11, weight="bold", color=NAVY)
ax.text(0.5, 0.20, "A 'Reset Filters' button (dashboard action) returns all views to the unfiltered state in one click.", ha="center", fontsize=7.8, color=GREY, style="italic")
ax.text(0.5, 0.10, "The same pattern applies to: clicking a sub-category bar \u2192 filters the discount-band and box-plot views; hovering a Pareto point \u2192 highlights that customer on the state map.", ha="center", fontsize=7.2, color=GREY, wrap=True)

plt.tight_layout(pad=0.3)
plt.savefig(OUT+"diag_interaction_flow.png", bbox_inches="tight")
plt.close()

# =========================================================================
# DIAGRAM 3 — Data Story Arc (narrative flow across the 3 dashboards)
# =========================================================================
fig, ax = plt.subplots(figsize=(9.0, 3.6))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")

stages = [
    ("OVERVIEW", "How is the\nbusiness doing?", NAVY),
    ("DIAGNOSE", "Where is profit\nbeing won or lost?", ACCENT),
    ("EXPLORE", "Who / where is\ndriving that pattern?", GREEN),
    ("ACT", "Which accounts, states\nor SKUs need attention?", ORANGE),
]
w, h, y = 0.20, 0.42, 0.32
x = 0.03
for i,(title, sub, color) in enumerate(stages):
    rbox(ax, x, y, w, h, title, fc=color, ec=color, text_color="white", fontsize=10.5, weight="bold", sub=sub, fontsize2=7.6, sub_color="#E8ECF3")
    if i < len(stages)-1:
        arrow(ax, (x+w+0.006, y+h/2), (x+0.25-0.006, y+h/2), color=NAVY, lw=2.2)
    x += 0.25

ax.text(0.5, 0.85, "Data Story Arc \u2014 How a Reader Moves Through the Three Dashboards", ha="center", fontsize=10.5, weight="bold", color=NAVY)
ax.text(0.5, 0.06, "Dashboard A covers Overview + first-pass Diagnose; Dashboards B and C support the deeper Explore / Act stages.", ha="center", fontsize=7.6, color=GREY, style="italic")

plt.tight_layout(pad=0.3)
plt.savefig(OUT+"diag_story_arc.png", bbox_inches="tight")
plt.close()

# =========================================================================
# DIAGRAM 4 — Color Palette & Visual System Swatch
# =========================================================================
fig, ax = plt.subplots(figsize=(9.0, 3.2))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")

palette = [
    ("#1F3864", "Navy", "Headers, titles, nav bar"),
    ("#4E79A7", "Steel Blue", "Primary measure (Sales)"),
    ("#F28E2B", "Orange", "Secondary measure (Profit, discount)"),
    ("#59A14F", "Green", "Positive / profit / growth"),
    ("#E15759", "Red", "Negative / loss / alert"),
    ("#B07AA1", "Purple", "Navigation / cross-links"),
    ("#F2F4F7", "Light Grey", "Panel & filter backgrounds"),
    ("#7F7F7F", "Grey", "Captions, secondary text"),
]
cols = 4
cw, ch = 0.235, 0.40
for i,(hexcode, name, use) in enumerate(palette):
    r, c = divmod(i, cols)
    x = 0.015 + c*(cw+0.01)
    y = 0.55 - r*(ch+0.06)
    ax.add_patch(mpatches.FancyBboxPatch((x, y), cw, ch*0.62, boxstyle="round,pad=0.006,rounding_size=0.01",
                                          facecolor=hexcode, edgecolor="#DDDDDD", linewidth=0.8, zorder=3))
    tcolor = "white" if name in ("Navy","Steel Blue","Red","Purple") else "#222222"
    ax.text(x+cw/2, y+ch*0.31, hexcode, ha="center", va="center", fontsize=7.4, color=tcolor, weight="bold", zorder=4)
    ax.text(x+cw/2, y-0.035, f"{name}", ha="center", va="top", fontsize=7.6, color=NAVY, weight="bold")
    ax.text(x+cw/2, y-0.075, use, ha="center", va="top", fontsize=6.2, color=GREY, wrap=True)

ax.text(0.5, 0.97, "Dashboard Color System", ha="center", fontsize=11, weight="bold", color=NAVY)
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"diag_color_palette.png", bbox_inches="tight")
plt.close()

print("Diagrams done")
