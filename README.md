<<<<<<< HEAD
# Superstore Tableau Analytics — 5-Week Deliverables

A five-week data-analytics internship project built around the public
**Sample – Superstore** dataset (the standard Tableau/Kaggle training
dataset). Each week's folder contains the Python/Node scripts that
generate its charts and mock-up diagrams, the resulting images, and the
final Word (`.docx`) report submitted for that week.

| Week | Folder | Deliverable | Focus |
|------|--------|-------------|-------|
| 1 | [`week1_eda/`](week1_eda) | `Superstore_EDA_Report.docx` | Exploratory data analysis & insight generation |
| 2 | [`week2_dashboard_planning/`](week2_dashboard_planning) | `Dashboard_Planning_Design_Strategy.docx` | Dashboard planning & design strategy (wireframes) |
| 3 | [`week3_data_story/`](week3_data_story) | `Interactive_Data_Story_Plan.docx` | Interactive data storytelling (storyboard, narrative arc) |
| 4 | [`week4_advanced_charts/`](week4_advanced_charts) | `Advanced_Chart_Techniques_Calculation_Insights.docx` | Advanced charts (bullet/waterfall/control/bump) & calculated fields |
| 5 | [`week5_performance_optimization/`](week5_performance_optimization) | `Performance_Optimization_Interactivity_Plan.docx` | Performance optimization & interactivity enhancement plan |

The finished `.docx` files are already included in each folder — you
don't need to run anything to read the deliverables. The scripts are
included so every chart, diagram, and number in those documents is
fully reproducible from source.

## Repository structure

```
superstore-tableau-analytics/
├── data/                              # shared dataset (generated in Week 1)
│   ├── superstore_working.csv         # 9,994-row working dataset
│   ├── describe.csv                   # summary statistics
│   └── results.json                   # all computed EDA figures used across weeks
├── week1_eda/
│   ├── generate_and_analyze.py        # builds data/superstore_working.csv
│   ├── eda_charts.py                  # runs the EDA, writes charts/ + data/results.json
│   ├── build_report.js                # assembles the Week 1 .docx from charts + results.json
│   ├── charts/                        # 12 EDA chart PNGs
│   └── Superstore_EDA_Report.docx
├── week2_dashboard_planning/
│   ├── make_wireframes.py             # 3 dashboard wireframe mock-ups
│   ├── make_diagrams.py               # architecture / story-arc / palette diagrams
│   ├── build_report2.js
│   ├── mockups/
│   └── Dashboard_Planning_Design_Strategy.docx
├── week3_data_story/
│   ├── make_diagrams1.py              # storyboard strip + narrative arc
│   ├── make_diagrams2.py              # interactivity map + what-if parameter mock-up
│   ├── build_report3.js
│   ├── mockups/
│   └── Interactive_Data_Story_Plan.docx
├── week4_advanced_charts/
│   ├── prepare_advanced_chart_data.py # derives bullet/waterfall/control/bump data from data/
│   ├── make_advanced_charts.py        # renders the 4 advanced charts
│   ├── make_diagrams.py               # dashboard wireframe + calculation build-up diagram
│   ├── build_report4.js
│   ├── mockups/
│   └── Advanced_Chart_Techniques_Calculation_Insights.docx
├── week5_performance_optimization/
│   ├── make_diagrams1.py              # bottleneck map + before/after benchmark
│   ├── make_diagrams2.py              # optimization workflow + drill-down interactivity diagram
│   ├── build_report5.js
│   ├── mockups/
│   └── Performance_Optimization_Interactivity_Plan.docx
├── requirements.txt
├── package.json
└── README.md
```

## About the dataset

`data/superstore_working.csv` is a **calibrated synthetic recreation**
of the public Sample – Superstore dataset: same schema, category/
region/segment structure, and date range (2015–2018, 9,994 order line
items), with aggregate KPIs matched to the well-known real dataset
(~$2.6M total sales, ~10% profit margin). It was generated this way
because the full original file could not be downloaded in the build
environment; the generation logic and calibration are fully documented
in `week1_eda/generate_and_analyze.py` and in Section 3 of the Week 1
report. Every chart and figure in all five reports is computed for
real from this file — nothing is hand-typed or illustrative.

If you have the original Sample – Superstore CSV, you can drop it in
as `data/superstore_working.csv` (matching column names) and re-run
`week1_eda/eda_charts.py` onward to refresh every downstream number,
chart, and report with the real data.

## Setup

You need Python 3.9+ and Node.js 18+.

```bash
# Python dependencies (chart generation)
pip install -r requirements.txt

# Node dependency (Word document generation)
npm install
```

## Reproducing a week's deliverable

Each week is self-contained. From the repo root:

```bash
# Week 1 — generate data, run EDA, build the report
cd week1_eda
python3 generate_and_analyze.py     # writes ../data/superstore_working.csv
python3 eda_charts.py               # writes ./charts/*.png and ../data/results.json
node build_report.js                # writes ./Superstore_EDA_Report.docx
cd ..

# Week 2 — dashboard wireframes + report
cd week2_dashboard_planning
python3 make_wireframes.py
python3 make_diagrams.py
node build_report2.js
cd ..

# Week 3 — data story diagrams + report
cd week3_data_story
python3 make_diagrams1.py
python3 make_diagrams2.py
node build_report3.js
cd ..

# Week 4 — advanced charts + report
cd week4_advanced_charts
python3 prepare_advanced_chart_data.py
python3 make_advanced_charts.py
python3 make_diagrams.py
node build_report4.js
cd ..

# Week 5 — optimization diagrams + report
cd week5_performance_optimization
python3 make_diagrams1.py
python3 make_diagrams2.py
node build_report5.js
cd ..
```

Weeks 2–5 depend only on `data/results.json` (already included) for
the figures quoted in their reports — they do not need Week 1 to be
re-run unless you want to refresh the underlying numbers.

## Notes

- All `.docx` files are generated with the [`docx`](https://www.npmjs.com/package/docx) npm package and open natively in Microsoft Word, Google Docs, and LibreOffice.
- Chart/diagram images are generated with `matplotlib` and embedded directly into each report — no manual screenshots.
- The Week 5 performance figures are explicitly labeled as **planning estimates**, not measurements from a live Tableau Server, since no published workbook exists in this environment.
=======
# Tableau-Performance-Optimization-and-Interactive-Feature-Enhancement
>>>>>>> 4961ed0a64c19eb0a44724891b8626882180a1a7
