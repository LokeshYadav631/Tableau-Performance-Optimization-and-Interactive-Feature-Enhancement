import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Wedge, Ellipse
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
GOLD = "#EDC948"

OUT = "./mockups/"

def rbox(ax, x, y, w, h, label, fc=WHITE, ec=NAVY, fontsize=9.5, weight="bold",
         text_color=NAVY, lw=1.6):
    r = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.010,rounding_size=0.010",
                        linewidth=lw, edgecolor=ec, facecolor=fc, zorder=3)
    ax.add_patch(r)
    if label:
        ax.text(x+w/2, y+h/2, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4, wrap=True)
    return r

def arrow(ax, xy1, xy2, color=NAVY, style="-|>", lw=1.8, connection="arc3,rad=0.0", ls="-"):
    a = FancyArrowPatch(xy1, xy2, arrowstyle=style, mutation_scale=13, linewidth=lw,
                          color=color, connectionstyle=connection, zorder=2, linestyle=ls)
    ax.add_patch(a)

def mini_chart(ax, x, y, w, h, kind):
    ix, iy, iw, ih = x+w*0.10, y+h*0.16, w*0.80, h*0.55
    if kind == "line_up":
        xs = np.linspace(ix, ix+iw, 10)
        ys = iy + ih*np.linspace(0.1, 0.85, 10) + ih*0.05*np.sin(np.linspace(0,4,10))
        ax.plot(xs, ys, color=ACCENT, linewidth=2, zorder=3)
    elif kind == "line_gap":
        xs = np.linspace(ix, ix+iw, 10)
        ys1 = iy + ih*np.linspace(0.15, 0.9, 10)
        ys2 = iy + ih*np.linspace(0.12, 0.42, 10)
        ax.plot(xs, ys1, color=ACCENT, linewidth=2, zorder=3)
        ax.plot(xs, ys2, color=ORANGE, linewidth=2, linestyle="--", zorder=3)
        ax.annotate("", xy=(xs[-1], ys1[-1]), xytext=(xs[-1], ys2[-1]),
                    arrowprops=dict(arrowstyle="<->", color=RED, lw=1.2))
    elif kind == "hbar_mixed":
        n=6
        bh = ih/(n*1.5)
        widths = [0.9,0.7,0.5,0.3,-0.25,-0.4]
        for i,ww in enumerate(widths):
            by = iy + i*(ih/n)
            c = GREEN if ww>0 else RED
            w0 = ix+iw*0.42
            ax.add_patch(mpatches.Rectangle((w0 if ww<0 else w0, by), iw*0.5*ww, bh, facecolor=c, edgecolor="none", zorder=3))
        ax.plot([ix+iw*0.42, ix+iw*0.42],[iy,iy+ih], color="#333", linewidth=0.8, zorder=3)
    elif kind == "scatter_red":
        rng = np.random.default_rng(5)
        xs = ix + iw*rng.uniform(0.05,0.95,26)
        ys = iy + ih*rng.uniform(0.05,0.95,26)
        cs = [RED if (xv-ix)/iw>0.55 and rng.uniform()<0.75 else ACCENT for xv in xs]
        ax.scatter(xs, ys, c=cs, s=9, zorder=3)
    elif kind == "map":
        ax.add_patch(Ellipse((ix+iw*0.5, iy+ih*0.5), iw*0.95, ih*0.9, facecolor="#DCE6F1", edgecolor=ACCENT, linewidth=1, zorder=3))
        for cx, cy, r, c in [(0.3,0.6,0.05,GREEN),(0.55,0.4,0.09,ORANGE),(0.7,0.65,0.045,RED),(0.4,0.3,0.035,ACCENT)]:
            ax.add_patch(Circle((ix+iw*cx, iy+ih*cy), iw*r, facecolor=c, edgecolor="white", linewidth=0.6, zorder=4))
    elif kind == "pareto":
        xs = np.linspace(ix, ix+iw, 20)
        ys = iy + ih*(1 - np.exp(-3*np.linspace(0,1,20)))
        ax.plot(xs, ys, color=ACCENT, linewidth=2, zorder=3)
        ax.plot([ix+iw*0.2, ix+iw*0.2],[iy,iy+ih*0.78], color=RED, linewidth=1, linestyle="--", zorder=3)
    elif kind == "kpi_cta":
        ax.text(ix+iw*0.5, iy+ih*0.5, "\u2713", ha="center", va="center", fontsize=20, color=GREEN, weight="bold", zorder=3)
    elif kind == "grid":
        for gx in np.linspace(ix, ix+iw, 4):
            ax.plot([gx,gx],[iy,iy+ih], color=BORDER, linewidth=1, zorder=3)
        for gy in np.linspace(iy, iy+ih, 3):
            ax.plot([ix,ix+iw],[gy,gy], color=BORDER, linewidth=1, zorder=3)

# =========================================================================
# DIAGRAM 1 — Storyboard strip (7 scenes)
# =========================================================================
scenes = [
    ("SCENE 1\nThe Hook", "Sales are climbing\n~15%/yr", "line_up", ACCENT),
    ("SCENE 2\nThe Gap", "But profit isn't\nkeeping pace", "line_gap", ACCENT),
    ("SCENE 3\nThe Culprit", "2 sub-categories\nlose money", "hbar_mixed", RED),
    ("SCENE 4\nThe Root Cause", "Margins flip negative\npast ~30% discount", "scatter_red", RED),
    ("SCENE 5\nWhere It Hurts", "Central & South regions\nrun thinnest margins", "map", ORANGE),
    ("SCENE 6\nThe Bright Spot", "Top 20% of customers\ndrive ~40% of sales", "pareto", GREEN),
    ("SCENE 7\nThe Ask", "Cap discounts, protect\ntop accounts, act", "kpi_cta", GREEN),
]
fig, ax = plt.subplots(figsize=(12.2, 3.55))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")
n = len(scenes)
w = 0.122
gap = (1 - n*w - 0.02) / (n-1)
x = 0.01
y, h = 0.20, 0.62
for i,(title, cap, kind, color) in enumerate(scenes):
    rbox(ax, x, y, w, h, "", fc=WHITE, ec=color, lw=2.0)
    ax.add_patch(mpatches.Rectangle((x, y+h-0.085), w, 0.085, facecolor=color, edgecolor="none", zorder=3.5))
    ax.text(x+w/2, y+h-0.0425, title, ha="center", va="center", fontsize=6.6, color="white", weight="bold", zorder=4)
    mini_chart(ax, x, y+0.06, w, h-0.18, kind)
    ax.text(x+w/2, y-0.045, cap, ha="center", va="top", fontsize=6.6, color="#333333", zorder=4, linespacing=1.3)
    ax.text(x+w-0.008, y+h-0.02, f"{i+1}", ha="right", va="top", fontsize=6, color="white", zorder=4.5)
    if i < n-1:
        arrow(ax, (x+w+0.003, y+h/2), (x+w+gap-0.003, y+h/2), color=GREY, lw=1.4)
    x += w + gap
ax.text(0.5, 0.965, "Storyboard \u2014 Seven-Scene Narrative Sequence", ha="center", fontsize=12, weight="bold", color=NAVY)
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"storyboard_strip.png", bbox_inches="tight")
plt.close()

# =========================================================================
# DIAGRAM 2 — Narrative tension / engagement arc
# =========================================================================
fig, ax = plt.subplots(figsize=(9.6, 4.4))
xs = np.arange(1,8)
tension = np.array([2.0, 3.6, 6.2, 8.6, 7.6, 5.4, 4.2])
ax.plot(xs, tension, color=ACCENT, linewidth=2.6, marker="o", markersize=7, markerfacecolor=NAVY, markeredgecolor="white", zorder=4)
ax.fill_between(xs, 0, tension, color=ACCENT, alpha=0.10, zorder=2)

labels = ["Hook\n(Growth story)", "Context\n(Profit lags)", "Complication\n(Loss-makers found)",
          "Insight / Climax\n(Discount threshold)", "Consequence\n(Regional impact)",
          "Turn\n(Concentration opportunity)", "Resolution\n(Recommended actions)"]
for x, t, lab in zip(xs, tension, labels):
    va = "bottom" if t < 7.8 else "top"
    off = 0.45 if va=="bottom" else -0.85
    ax.text(x, t+off, lab, ha="center", va=va, fontsize=7.6, color="#333333", linespacing=1.3)

ax.axvline(4, color=RED, linestyle=":", linewidth=1.2, zorder=1)
ax.text(4, 9.4, "narrative climax", ha="center", fontsize=7.6, color=RED, style="italic")

ax.set_xlim(0.4, 7.6); ax.set_ylim(0, 10.2)
ax.set_xticks(xs); ax.set_xticklabels([f"Scene {i}" for i in xs], fontsize=8)
ax.set_yticks([])
for spine in ["top","right","left"]:
    ax.spines[spine].set_visible(False)
ax.set_ylabel("Reader Engagement / Narrative Tension \u2192", fontsize=8.5, color=GREY)
ax.set_title("Narrative Arc \u2014 Tension and Resolution Across the Seven Scenes", fontsize=11.5, weight="bold", color=NAVY, pad=14)
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"narrative_arc.png", bbox_inches="tight")
plt.close()

print("Batch 1 done")
