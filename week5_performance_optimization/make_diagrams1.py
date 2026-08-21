import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans", "figure.dpi": 150,
                      "axes.spines.top": False, "axes.spines.right": False})

NAVY="#1F3864"; ACCENT="#4E79A7"; ORANGE="#F28E2B"; GREEN="#59A14F"; RED="#E15759"
GREY="#7F7F7F"; LIGHT="#F2F4F7"; BORDER="#B7C0CC"; WHITE="#FFFFFF"; PURPLE="#B07AA1"; GOLD="#EDC948"

OUT = "./mockups/"

def rbox(ax, x, y, w, h, label, fc=WHITE, ec=NAVY, fontsize=8.4, weight="bold", text_color=NAVY, lw=1.5):
    r = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.009,rounding_size=0.009",
                        linewidth=lw, edgecolor=ec, facecolor=fc, zorder=3)
    ax.add_patch(r)
    ax.text(x+w/2, y+h/2, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4, linespacing=1.3)
    return r

def badge(ax, x, y, text, color):
    ax.add_patch(FancyBboxPatch((x-0.028, y-0.017), 0.056, 0.034, boxstyle="round,pad=0.004,rounding_size=0.008",
                                 facecolor=color, edgecolor="none", zorder=5))
    ax.text(x, y, text, ha="center", va="center", fontsize=6.2, color="white", weight="bold", zorder=6)

def arrow(ax, xy1, xy2, color=NAVY, lw=1.6, connection="arc3,rad=0.0"):
    a = FancyArrowPatch(xy1, xy2, arrowstyle="-|>", mutation_scale=12, linewidth=lw, color=color, connectionstyle=connection, zorder=2)
    ax.add_patch(a)

# =========================================================================
# DIAGRAM 1 — Performance Bottleneck Map (across the 4 dashboards + story)
# =========================================================================
fig, ax = plt.subplots(figsize=(11.4, 5.6))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")

nodes = [
    ("A. Executive\nOverview", 0.10, 0.68, "8 sheets \u00b7 5 filters"),
    ("B. Product &\nProfitability", 0.32, 0.68, "6 sheets \u00b7 scatter 9,994 marks"),
    ("C. Customer &\nGeographic", 0.54, 0.68, "6 sheets \u00b7 filled map + table"),
    ("D. Advanced\nAnalytics", 0.76, 0.68, "4 sheets \u00b7 4 table calcs"),
    ("Story:\nBeyond the Top Line", 0.43, 0.90, "7 scenes \u00b7 1 parameter"),
]
for lab, x, y, sub in nodes:
    rbox(ax, x-0.09, y-0.055, 0.18, 0.11, lab, fc=NAVY, ec=NAVY, text_color="white", fontsize=8.2)
    ax.text(x, y-0.075, sub, ha="center", fontsize=6.3, color=GREY)

arrow(ax, (0.43, 0.845), (0.20, 0.735), color=BORDER, lw=1.1)
arrow(ax, (0.43, 0.845), (0.65, 0.735), color=BORDER, lw=1.1)

issues = [
    (0.10, 0.42, "Live connection re-queries\non every quick-filter change", "High", RED),
    (0.32, 0.42, "Unaggregated scatter plot:\n9,994 marks rendered live", "High", RED),
    (0.54, 0.42, "Filled map + detail table\nboth on one dashboard", "Med", ORANGE),
    (0.76, 0.42, "4 table calcs (RANK, WINDOW_*)\nrecomputed on every filter", "Med", ORANGE),
    (0.43, 0.20, "5 global filters applied\n\u201call sheets using data source\u201d,\nnone set as Context", "High", RED),
]
for x, y, text, sev, color in issues:
    rbox(ax, x-0.098, y-0.075, 0.196, 0.15, text, fc=LIGHT, ec=color, text_color="#222", fontsize=7.0, weight="normal", lw=1.6)
    badge(ax, x+0.075, y+0.062, sev, color)

for (nx,ny),(ix,iy,_,_,ic) in zip([(n[1],n[2]) for n in nodes[:4]], issues[:4]):
    arrow(ax, (nx, ny-0.055), (ix, iy+0.075), color=ic, lw=1.3)
arrow(ax, (0.43, 0.90-0.06), (0.43, 0.275), color=RED, lw=1.3, connection="arc3,rad=0.25")

ax.text(0.5, 0.985, "Performance Bottleneck Map \u2014 Current Workbook Design", ha="center", fontsize=12.5, weight="bold", color=NAVY)
handles = [mpatches.Patch(color=RED, label="High impact"), mpatches.Patch(color=ORANGE, label="Medium impact")]
ax.legend(handles=handles, loc="lower left", fontsize=8, frameon=False, bbox_to_anchor=(0.0,-0.02))
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"bottleneck_map.png", bbox_inches="tight")
plt.close()

# =========================================================================
# DIAGRAM 2 — Before / After load-time benchmark (illustrative estimate)
# =========================================================================
fig, ax = plt.subplots(figsize=(8.6, 4.4))
dashboards = ["A. Exec.\nOverview", "B. Product &\nProfitability", "C. Customer &\nGeographic", "D. Advanced\nAnalytics", "Story\n(7 scenes)"]
before = [3.8, 6.5, 5.2, 4.6, 4.0]
after  = [1.4, 2.1, 1.9, 1.8, 1.3]
x = np.arange(len(dashboards)); w = 0.34
b1 = ax.bar(x-w/2, before, width=w, color="#C9CED8", label="Before optimization (est.)")
b2 = ax.bar(x+w/2, after, width=w, color=GREEN, label="After optimization (est.)")
for i,(bv,av) in enumerate(zip(before,after)):
    ax.text(i-w/2, bv+0.1, f"{bv:.1f}s", ha="center", fontsize=7.5, color="#555")
    ax.text(i+w/2, av+0.1, f"{av:.1f}s", ha="center", fontsize=7.5, color=GREEN, weight="bold")
    pct = int(round((1-av/bv)*100))
    ax.text(i, max(bv,av)+0.75, f"\u2212{pct}%", ha="center", fontsize=8.5, weight="bold", color=NAVY)
ax.set_xticks(x); ax.set_xticklabels(dashboards, fontsize=8.2)
ax.set_ylabel("Estimated Load Time (seconds)")
ax.set_title("Projected Load-Time Impact of Optimization (Illustrative Estimate)")
ax.legend(loc="upper right", fontsize=8, frameon=False)
ax.set_ylim(0, 8.2)
plt.tight_layout()
plt.savefig(OUT+"benchmark_chart.png", bbox_inches="tight")
plt.close()

print("Batch 1 done")
