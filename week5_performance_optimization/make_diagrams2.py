import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans", "figure.dpi": 150})

NAVY="#1F3864"; ACCENT="#4E79A7"; ORANGE="#F28E2B"; GREEN="#59A14F"; RED="#E15759"
GREY="#7F7F7F"; LIGHT="#F2F4F7"; BORDER="#B7C0CC"; WHITE="#FFFFFF"; PURPLE="#B07AA1"

OUT = "./mockups/"

def rbox(ax, x, y, w, h, label, fc=WHITE, ec=NAVY, fontsize=8.2, weight="bold", text_color=NAVY, lw=1.5, sub=None, sub_color=None):
    r = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.009,rounding_size=0.009",
                        linewidth=lw, edgecolor=ec, facecolor=fc, zorder=3)
    ax.add_patch(r)
    if sub:
        ax.text(x+w/2, y+h*0.62, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4)
        ax.text(x+w/2, y+h*0.28, sub, ha="center", va="center", fontsize=fontsize-1.4, color=sub_color or GREY, zorder=4)
    else:
        ax.text(x+w/2, y+h/2, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4, linespacing=1.3)
    return r

def arrow(ax, xy1, xy2, color=NAVY, lw=1.8, connection="arc3,rad=0.0", style="-|>"):
    a = FancyArrowPatch(xy1, xy2, arrowstyle=style, mutation_scale=13, linewidth=lw, color=color, connectionstyle=connection, zorder=2)
    ax.add_patch(a)

# =========================================================================
# DIAGRAM 3 — Optimization workflow (6-stage process)
# =========================================================================
stages = [
    ("1. ASSESS", "Performance Recording,\nidentify bottlenecks", NAVY),
    ("2. EXTRACT", "Aggregate, filter,\nhide unused fields", ACCENT),
    ("3. FILTERS", "Context filters,\nparameters over filters", ACCENT),
    ("4. CALC", "Materialize LODs,\nsimplify table calcs", ACCENT),
    ("5. DESIGN", "Reduce marks & sheets,\nfewer actions", ACCENT),
    ("6. TEST", "Re-record, validate\nagainst targets", GREEN),
]
fig, ax = plt.subplots(figsize=(12.2, 3.1))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")
n = len(stages)
w = 0.145
gap = (1 - n*w - 0.02)/(n-1)
x = 0.01
for i,(title, sub, color) in enumerate(stages):
    rbox(ax, x, 0.42, w, 0.42, title, fc=color, ec=color, text_color="white", fontsize=9.5, sub=sub, sub_color="#E8ECF3")
    if i < n-1:
        arrow(ax, (x+w+0.004, 0.63), (x+w+gap-0.004, 0.63), color=GREY, lw=1.6)
    x += w+gap
# loop-back arrow from 6 to 1 (continuous monitoring), routed below the boxes
last_x = x - w - gap
ax.text(0.01+w*0.5, 0.37, "\u21ba repeats", ha="center", fontsize=7.2, color=RED, weight="bold", style="italic")
ax.text(last_x+w*0.5, 0.37, "loops back to Assess \u2192", ha="center", fontsize=7.2, color=RED, weight="bold", style="italic")
ax.text(0.5, 0.16, "Continuous monitoring: re-run Assess after each publish or major data-volume change", ha="center", fontsize=7.6, color=RED, style="italic")
ax.text(0.5, 0.95, "Optimization Workflow \u2014 Six-Stage Process", ha="center", fontsize=12.5, weight="bold", color=NAVY)
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"optimization_workflow.png", bbox_inches="tight")
plt.close()

# =========================================================================
# DIAGRAM 4 — Drill-down hierarchy + interaction enhancement
# =========================================================================
fig, ax = plt.subplots(figsize=(9.6, 5.1))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")

rbox(ax, 0.06, 0.74, 0.24, 0.15, "CATEGORY", fc=NAVY, ec=NAVY, text_color="white", fontsize=10, sub="3 members", sub_color="#CBD5E1")
rbox(ax, 0.38, 0.74, 0.24, 0.15, "SUB-CATEGORY", fc=ACCENT, ec=ACCENT, text_color="white", fontsize=10, sub="17 members", sub_color="#E8ECF3")
rbox(ax, 0.70, 0.74, 0.24, 0.15, "PRODUCT", fc=GREEN, ec=GREEN, text_color="white", fontsize=10, sub="1,850+ members", sub_color="#E8F3EA")
arrow(ax, (0.30, 0.815), (0.38, 0.815), color=NAVY, lw=2.2)
arrow(ax, (0.62, 0.815), (0.70, 0.815), color=ACCENT, lw=2.2)
ax.text(0.34, 0.85, "double-click\nto drill in", ha="center", fontsize=6.6, color=GREY, style="italic")
ax.text(0.66, 0.85, "double-click\nto drill in", ha="center", fontsize=6.6, color=GREY, style="italic")
ax.text(0.5, 0.665, "\u2191 single click on breadcrumb / \u2018Reset Hierarchy\u2019 button drills back up (no re-query of a new sheet needed)",
        ha="center", fontsize=7.4, color=GREY, style="italic")

# Bottom row: other interactivity enhancements
enh = [
    ("Top-N Parameter", "Lets user cap the sub-category\nbar chart to Top 5 / 10 / All,\ncutting rendered marks."),
    ("Smart Default Filters", "Dashboards open pre-filtered to\nlatest full quarter instead of\nall four years."),
    ("Global Reset Button", "One click clears every filter,\nparameter, and highlight\nacross all four dashboards."),
    ("Saved Bookmarks / Views", "Lets a returning user jump\nstraight to their last filtered\nstate instead of rebuilding it."),
]
ex, ey, ew, eh = 0.02, 0.06, 0.225, 0.40
for i,(title, desc) in enumerate(enh):
    xx = ex + i*(ew+0.02)
    rbox(ax, xx, ey, ew, eh, "", fc=LIGHT, ec=BORDER, text_color=NAVY, fontsize=8, weight="bold")
    ax.text(xx+ew/2, ey+eh*0.86, title, ha="center", va="center", fontsize=8.2, color=NAVY, weight="bold")
    ax.text(xx+ew/2, ey+eh*0.42, desc, ha="center", va="center", fontsize=6.6, color="#333333", linespacing=1.5)

ax.text(0.5, 0.965, "Interactivity Enhancements \u2014 Drill-Down Hierarchy & Supporting Controls", ha="center", fontsize=12, weight="bold", color=NAVY)
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"drilldown_interactivity.png", bbox_inches="tight")
plt.close()

print("Batch 2 done")
