import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Ellipse
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

def rbox(ax, x, y, w, h, label, fc=WHITE, ec=NAVY, fontsize=8.6, weight="bold",
         text_color=NAVY, lw=1.4):
    r = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.008,rounding_size=0.008",
                        linewidth=lw, edgecolor=ec, facecolor=fc, zorder=3)
    ax.add_patch(r)
    if label:
        ax.text(x+w/2, y+h/2, label, ha="center", va="center", fontsize=fontsize, color=text_color, weight=weight, zorder=4, linespacing=1.3)
    return r

def arrow(ax, xy1, xy2, color=NAVY, style="-|>", lw=1.6, connection="arc3,rad=0.0", ls="-"):
    a = FancyArrowPatch(xy1, xy2, arrowstyle=style, mutation_scale=12, linewidth=lw,
                          color=color, connectionstyle=connection, zorder=2, linestyle=ls)
    ax.add_patch(a)

# =========================================================================
# DIAGRAM 3 — Interactivity map (which interactive element lives on which scene)
# =========================================================================
fig, ax = plt.subplots(figsize=(12.6, 5.2))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")

scene_x = np.linspace(0.295, 0.86, 7)
scene_labels = [f"S{i}" for i in range(1,8)]
y_scene = 0.90
for x, lab in zip(scene_x, scene_labels):
    rbox(ax, x-0.028, y_scene-0.035, 0.056, 0.07, lab, fc=NAVY, ec=NAVY, text_color="white", fontsize=9)
ax.plot([scene_x[0], scene_x[-1]], [y_scene, y_scene], color=BORDER, lw=1, zorder=1)
ax.text(0.01, y_scene, "Story\nPoints", ha="left", va="center", fontsize=7.6, color=GREY, weight="bold")

rows = [
    ("Story-point navigator\n(prev / next / scene dots)", GREY, list(range(7)), "Lets a reader move at\ntheir own pace, or jump\nback to an earlier scene."),
    ("Annotated callouts\n(auto-appear per scene)", ACCENT, list(range(7)), "Pulls the eye straight to\nthe one mark that matters\ninstead of leaving it\nto be found."),
    ("Hover tooltips\n(value + context)", ACCENT, [0,1,2,3,4,5], "Rewards curiosity with\nexact figures without\ncluttering the base view."),
    ("Click-to-highlight\n(cross-chart)", GREEN, [2,4,5], "Selecting one sub-category\nor state highlights it\nconsistently as the\nstory continues."),
    ("What-if parameter\n(discount cap slider)", ORANGE, [3], "Turns the key insight into\na hands-on simulation \u2014\nthe reader sets the cap and\nwatches profit recover."),
    ("Drill-through to\nWeek 2 dashboards", RED, [6], "Hands off from guided\nnarrative to full self-\nservice exploration once\nthe story is told."),
]
row_h = 0.115
y = 0.72
for label, color, active_scenes, note in rows:
    rbox(ax, 0.005, y-row_h*0.32, 0.255, row_h*0.62, label, fc=LIGHT, ec=color, text_color="#222222", fontsize=7.4, weight="normal", lw=1.3)
    for i, x in enumerate(scene_x):
        on = i in active_scenes
        c = Circle((x, y), 0.016, facecolor=color if on else "#EAEAEA", edgecolor=color if on else BORDER, linewidth=1.2, zorder=3)
        ax.add_patch(c)
    ax.text(0.895, y, note, ha="left", va="center", fontsize=6.6, color=GREY, linespacing=1.4)
    y -= row_h

ax.text(0.5, 0.985, "Interactivity Map \u2014 Which Interactive Element Appears in Which Scene", ha="center", fontsize=11.5, weight="bold", color=NAVY)
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"interactivity_map.png", bbox_inches="tight")
plt.close()

# =========================================================================
# DIAGRAM 4 — What-if parameter mock-up (before / after discount cap slider)
# =========================================================================
fig, ax = plt.subplots(figsize=(9.6, 4.3))
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis("off")

def profit_panel(ax, x, y, w, h, cap, title, color):
    rbox(ax, x, y, w, h, "", fc=WHITE, ec=BORDER, lw=1.3)
    ax.text(x+w/2, y+h-0.05, title, ha="center", va="center", fontsize=8.5, weight="bold", color=NAVY)
    bands = ["0%","1-20%","21-30%","31-50%","51-80%"]
    margins = [0.285, 0.195, 0.161, -0.036, -0.058]
    if cap is not None:
        margins = [m if i <= cap else 0.0 for i,m in enumerate(margins)]
    ix, iy, iw, ih = x+w*0.08, y+h*0.16, w*0.86, h*0.55
    n = len(bands)
    bw = iw/(n*1.5)
    zero_y = iy + ih*0.5
    for i,(b,m) in enumerate(zip(bands, margins)):
        bx = ix + i*(iw/n)
        bh = ih*0.42*m/0.285
        c = GREEN if m>=0 else RED
        if m == 0 and cap is not None and i > cap:
            c = "#DDDDDD"
        ax.add_patch(mpatches.Rectangle((bx, zero_y if bh>=0 else zero_y+bh), bw, abs(bh), facecolor=c, edgecolor="none", zorder=3))
        ax.text(bx+bw/2, iy-0.02, b, ha="center", va="top", fontsize=5.6, color=GREY, rotation=0)
    ax.plot([ix, ix+iw],[zero_y, zero_y], color="#333", linewidth=0.8, zorder=3)
    est = "+$262.6K" if cap is None else ("+$281K (est.)" if cap==2 else "+$262.6K")
    ax.text(x+w/2, y+0.035, f"Simulated Total Profit: {est}", ha="center", fontsize=7.2, color=color, weight="bold")

profit_panel(ax, 0.03, 0.18, 0.42, 0.62, None, "BEFORE \u2014 Slider at 80% (no cap)", GREY)
profit_panel(ax, 0.55, 0.18, 0.42, 0.62, 2, "AFTER \u2014 Slider capped at 30%", GREEN)

# slider illustration between panels
sx, sy, sw = 0.30, 0.10, 0.40
ax.plot([sx, sx+sw],[sy,sy], color=BORDER, linewidth=4, solid_capstyle="round", zorder=2)
ax.plot([sx, sx+sw*0.375],[sy,sy], color=ORANGE, linewidth=4, solid_capstyle="round", zorder=2.5)
ax.add_patch(Circle((sx+sw*0.375, sy), 0.014, facecolor=NAVY, edgecolor="white", linewidth=1.3, zorder=4))
ax.text(sx+sw*0.375, sy+0.045, "Discount Cap: 30%", ha="center", fontsize=7.6, weight="bold", color=NAVY)
ax.text(sx-0.01, sy, "0%", ha="right", va="center", fontsize=6.5, color=GREY)
ax.text(sx+sw+0.01, sy, "80%", ha="left", va="center", fontsize=6.5, color=GREY)
arrow(ax, (0.46, 0.5), (0.53, 0.5), color=NAVY, lw=2)

ax.text(0.5, 0.97, "What-If Parameter Mock-Up \u2014 \u201cDiscount Cap\u201d Slider (Scene 4)", ha="center", fontsize=11.5, weight="bold", color=NAVY)
ax.text(0.5, 0.02, "Reader drags the slider; bars beyond the cap grey out and the estimated total-profit recovery updates live.", ha="center", fontsize=7.4, color=GREY, style="italic")
plt.tight_layout(pad=0.3)
plt.savefig(OUT+"whatif_parameter_mock.png", bbox_inches="tight")
plt.close()

print("Batch 2 done")
