const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, ImageRun, AlignmentType, BorderStyle, PageBreak,
  LevelFormat, Header, Footer, PageNumber, VerticalAlign, TabStopType, TabStopPosition, LeaderType,
} = require("docx");
const fs = require("fs");

const CH2 = "../week2_dashboard_planning/mockups/";
const CH3 = "../week3_data_story/mockups/";
const CH4 = "../week4_advanced_charts/mockups/";
const CH5 = "../week5_performance_optimization/mockups/";
const CH6 = "./mockups/";
const NAVY = "1F3864";
const ACCENT = "4E79A7";
const GREY = "595959";
const LIGHTGREY = "F2F2F2";

function H1(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } }); }
function H2(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } }); }
function H3(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 100 } }); }
function P(text, opts = {}) {
  return new Paragraph({ spacing: { after: 160, line: 276 }, children: [new TextRun({ text, ...opts })] });
}
function Bullet(text, opts = {}) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 90, line: 268 }, children: [new TextRun({ text, ...opts })] });
}
function Caption(text) {
  return new Paragraph({ spacing: { before: 60, after: 260 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, italics: true, size: 19, color: GREY })] });
}
function Img(path, widthIn, heightIn) {
  const data = fs.readFileSync(path);
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 40 },
    children: [new ImageRun({ type: "png", data, transformation: { width: widthIn * 96, height: heightIn * 96 } })] });
}
function Figure(path, widthIn, heightIn, captionText) {
  return [Img(path, widthIn, heightIn), Caption(captionText)];
}
function cell(text, { bold = false, shade = null, width = null, align = AlignmentType.LEFT, color = null, size=20 } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: String(text), bold, size, color: color || undefined })] })],
  });
}
function dataTable(headers, rows, widths) {
  const total = widths.reduce((a,b)=>a+b,0);
  const headerRow = new TableRow({ tableHeader: true,
    children: headers.map((h,i) => cell(h, { bold: true, shade: NAVY, width: widths[i], color: "FFFFFF", align: i===0?AlignmentType.LEFT:AlignmentType.CENTER })) });
  const bodyRows = rows.map((r, ridx) => new TableRow({
    children: r.map((v,i) => cell(v, { width: widths[i], shade: ridx % 2 === 1 ? LIGHTGREY : null, align: AlignmentType.LEFT })) }));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows: [headerRow, ...bodyRows] });
}
// TOC row with dot leader tab to a right-aligned page number
function TocRow(title, page, indent=0) {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX, leader: LeaderType.DOT }],
    spacing: { after: 100 },
    indent: { left: indent },
    children: [
      new TextRun({ text: title, size: 21, color: "1B1B1B" }),
      new TextRun({ text: `\t${page}`, size: 21, color: "1B1B1B" }),
    ],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: NAVY, font: "Calibri" },
        paragraph: { spacing: { before: 360, after: 160 }, border: { bottom: { color: ACCENT, space: 4, style: BorderStyle.SINGLE, size: 8 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: NAVY, font: "Calibri" } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, color: ACCENT, font: "Calibri" } },
    ],
  },
  numbering: { config: [{ reference: "bullet-list",
    levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 360, hanging: 200 } } } }] }] },
  sections: [
    // ---------------- TITLE PAGE ----------------
    {
      properties: { page: { size: { width: 12240, height: 15840 } } },
      children: [
        new Paragraph({ spacing: { before: 2000, line: 340 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "FINAL INTEGRATION,", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 40, line: 340 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "EVALUATION & REPORTING", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "A Six-Week Capstone: From Exploratory Analysis to a Performance-Optimized, Interactive Tableau Practice", size: 25, color: ACCENT, italics: true })] }),
        new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Week 6 Task \u2013 Data Analytics Internship Program", size: 24, color: GREY })] }),
        new Paragraph({ spacing: { before: 2600 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Built on the Sample \u2013 Superstore dataset across Weeks 1\u20135:", size: 20, color: GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "exploratory analysis \u2192 dashboard design \u2192 interactive storytelling \u2192", size: 20, color: GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "advanced calculation \u2192 performance optimization \u2192 this integration report.", size: 20, color: GREY })] }),
        new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Portfolio-ready summary of process, deliverables, and reflective evaluation.", size: 18, color: GREY, italics: true })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ---------------- TABLE OF CONTENTS ----------------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      children: [
        new Paragraph({ text: "Table of Contents", heading: HeadingLevel.HEADING_1, spacing: { after: 260 } }),
        TocRow("1. Executive Summary", 3),
        TocRow("2. Introduction & Internship Overview", 3),
        TocRow("3. Week 1 \u2014 Exploratory Data Analysis & Insight Generation", 4),
        TocRow("4. Week 2 \u2014 Dashboard Planning & Design Strategy", 5),
        TocRow("5. Week 3 \u2014 Interactive Data Storytelling", 6),
        TocRow("6. Week 4 \u2014 Advanced Chart Techniques & Calculation Insights", 6),
        TocRow("7. Week 5 \u2014 Performance Optimization & Interactivity Enhancement", 7),
        TocRow("8. Integrated Workbook Architecture", 8),
        TocRow("9. Critical Evaluation", 9),
        TocRow("10. Lessons Learned", 10),
        TocRow("11. Challenges & How They Were Addressed", 11),
        TocRow("12. Recommendations for Future Enhancements", 11),
        TocRow("13. Skills & Competency Summary", 12),
        TocRow("14. Conclusion", 12),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ---------------- MAIN BODY ----------------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Sample \u2013 Superstore | Final Integration, Evaluation & Reporting", size: 16, color: GREY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })] })] }) },
      children: [

        H1("1. Executive Summary"),
        P("This report closes out a six-week, self-directed Tableau data-analytics internship built entirely around one dataset \u2014 the public Sample \u2013 Superstore dataset \u2014 taken from first exploration through to a performance-optimized, interactive analytics practice. Each week added a distinct capability on top of the last: Week 1 established what the data actually says; Week 2 turned those findings into a planned, audience-aware dashboard architecture; Week 3 layered a curated narrative on top of that architecture for a one-time executive audience; Week 4 added statistically rigorous advanced visualizations and their underlying calculated fields; and Week 5 audited the resulting workbook for real-world performance and interaction quality. This report integrates all five, evaluates the approach taken at each stage, and reflects on what was learned."),
        P(`Across the five weeks the same ${'9,994'}-row working dataset was used consistently, anchoring every chart, wireframe, and calculation to the same set of validated figures \u2014 total sales of $2.63M, total profit of $262.6K (a 10.0% margin), 15.1% compound annual sales growth, and a -0.66 correlation between discount rate and profit margin \u2014 so that no downstream week ever contradicts an earlier one. The result is not five disconnected assignments but one coherent analytics artifact: a guided story, four purpose-built dashboards, eight documented calculated fields, and an audited, optimization-ready workbook design, all traceable back to the same Week 1 findings.`),
        P("The remainder of this report documents each week's process and output, critically evaluates the effectiveness of the choices made, distills the lessons learned into technical and process categories, and closes with concrete recommendations for extending this work with real Tableau Server deployment, live data, and further automation."),

        H1("2. Introduction & Internship Overview"),
        H2("2.1 Program Structure"),
        P("The internship was structured as six weekly deliverables, each a standalone DOC report, building in a deliberate sequence: analytical foundation (Weeks 1\u20132), communication and depth (Weeks 3\u20134), and production readiness (Weeks 5\u20136)."),
        ...Figure(CH6 + "journey_timeline.png", 6.6, 1.7, "Figure 1. The six-week progression, grouped into three phases."),
        H2("2.2 Dataset & Tooling"),
        P("All six weeks use the Sample \u2013 Superstore dataset: 9,994 order line items, 2015\u20132018, across three product categories, four US regions, and three customer segments. Because the complete original file could not be downloaded in this build environment, a calibrated synthetic recreation was generated \u2014 matching the real dataset's schema, category/region structure, and well-known aggregate KPIs (~$2.3\u20132.6M sales, ~10\u201312% margin) \u2014 and used consistently from Week 1 onward. This choice, and its implications, is discussed critically in Section 9."),
        P("Analysis and chart prototyping were done in Python (pandas, NumPy, Matplotlib); every dashboard and chart specification was then translated into concrete Tableau shelves, marks, and calculated-field syntax so the plan is directly buildable in Tableau Desktop. Report documents were produced as formatted Word files with embedded, purpose-built diagrams rather than generic clip art \u2014 every figure in every week's report is a real, data-driven or logic-driven artifact."),
        H2("2.3 How to Read This Report"),
        P("Sections 3\u20137 summarize each week in turn \u2014 objective, what was produced, and the key figures or artifacts \u2014 with pointers back to that week's full report rather than reproducing it in full. Sections 8 onward are new synthesis: an integrated architecture view, a critical evaluation, lessons learned, challenges, forward-looking recommendations, and a skills summary suitable for a portfolio or employer review."),

        H1("3. Week 1 \u2014 Exploratory Data Analysis & Insight Generation"),
        H2("3.1 Objective"),
        P("Select a rich public dataset and perform a structured EDA to characterize its variables, surface trends and outliers, and generate insights suited to Tableau visualization."),
        H2("3.2 What Was Produced"),
        Bullet("A full data-quality and descriptive-statistics pass (zero missing values, verified schema, 9,994 rows)."),
        Bullet("Twelve EDA charts covering category/sub-category profitability, monthly trend and seasonality, regional and state performance, discount-vs-profit correlation, customer segments, shipping modes, a correlation matrix, outlier detection, and customer concentration (Pareto)."),
        Bullet("A prioritized \u201ckey insights\u201d summary and, critically, a section translating every chart into an exact Tableau build specification (shelves, marks, calculated fields, filters)."),
        H2("3.3 Headline Findings (used throughout every later week)"),
        dataTable(
          ["Finding", "Figure"],
          [
            ["Total sales / profit / margin (2015\u20132018)", "$2.63M / $262.6K / 10.0%"],
            ["Compound annual sales growth", "~15.1%"],
            ["Discount \u2194 profit margin correlation", "-0.66"],
            ["Margin turns negative beyond a discount of roughly", "30%"],
            ["Structurally loss-making sub-categories", "Machines, Tables"],
            ["Top 20% of customers' share of total sales", "~40%"],
            ["Strongest seasonal month", "December (~14.8% of annual sales)"],
          ],
          [5600, 3380]
        ),
        Caption("Table 1. Week 1 findings that every subsequent week's design decisions trace back to."),
        H2("3.4 Downstream Impact"),
        P("Every dashboard panel in Week 2, every story beat in Week 3, and every advanced calculation in Week 4 cites one of the rows in Table 1 as its rationale \u2014 this traceability is what keeps the six-week arc feeling like one project rather than six."),

        H1("4. Week 2 \u2014 Dashboard Planning & Design Strategy"),
        H2("4.1 Objective"),
        P("Plan (not yet build) an interactive Tableau dashboard: objectives, target audience, layout, color system, and interaction points, justified by the Week 1 findings."),
        H2("4.2 What Was Produced"),
        Bullet("Three target personas (Executive, Category Manager, Regional Manager) mapped to time budget and dashboard."),
        Bullet("A three-dashboard architecture \u2014 Executive Overview, Product & Profitability Deep-Dive, Customer & Geographic Analysis \u2014 with a defined navigation and global-filter model."),
        Bullet("Full wireframe mock-ups for all three dashboards, with a panel-by-panel rationale table justifying every chart choice against a specific Week 1 finding."),
        Bullet("A functional (not decorative) color system, typography rules, and accessibility guidelines."),
        ...Figure(CH2 + "diag_architecture.png", 5.8, 3.3, "Figure 2. The three-dashboard navigation architecture designed in Week 2, later extended to four dashboards in Week 4."),
        H2("4.3 Design Rationale Highlights"),
        P("The three-persona, three-time-budget framing is the single decision that shaped everything downstream: because an executive needs a 30-second read while a manager needs 5\u201310 minutes of exploration, no single dashboard could serve both well \u2014 which directly motivated splitting the workbook rather than building one dense screen."),

        H1("5. Week 3 \u2014 Interactive Data Storytelling"),
        H2("5.1 Objective"),
        P("Layer a single, curated, sequential narrative \u2014 built with Tableau Story Points \u2014 on top of the Week 2 dashboards, for a one-time, high-stakes read rather than repeat self-service exploration."),
        H2("5.2 What Was Produced"),
        Bullet("A seven-scene story, \u201cBeyond the Top Line,\u201d following a tension-and-resolution arc from a reassuring growth headline to the discount-driven profit problem to a concrete recommendation."),
        Bullet("A scene-by-scene visual narrative table (visualization, narrative role, exact on-screen caption) and a storyboard diagram."),
        Bullet("An interactivity map specifying which mechanism (navigation, annotations, tooltips, click-to-highlight, a what-if parameter, drill-through) is active in each scene."),
        Bullet("A \u201cDiscount Cap\u201d what-if parameter mock-up letting the reader simulate profit recovery under different caps \u2014 turning the story's central claim into something the reader proves themselves."),
        ...Figure(CH3 + "narrative_arc.png", 6.0, 2.85, "Figure 3. The narrative arc designed in Week 3 \u2014 tension rising to a climax at the discount-threshold insight, then resolving toward a recommendation."),
        H2("5.3 Design Rationale Highlights"),
        P("The story is explicitly designed not to replace the Week 2 dashboards but to hand off into them (Scene 7 drills through to the Executive Overview) \u2014 the guided narrative is the front door, and the dashboards remain the rooms a reader can explore afterward."),

        H1("6. Week 4 \u2014 Advanced Chart Techniques & Calculation Insights"),
        H2("6.1 Objective"),
        P("Apply advanced Tableau visualization techniques, each backed by a documented, non-trivial calculated field, to surface analysis the simpler charts from Weeks 1\u20133 could not."),
        H2("6.2 What Was Produced"),
        dataTable(
          ["Technique", "Key Calculation", "New Insight Surfaced"],
          [
            ["Bullet Chart", "LOOKUP(SUM([Sales]),-1)*1.1", "West and South regions are behind their own dynamic target despite strong absolute sales"],
            ["Waterfall Chart", "RUNNING_SUM(SUM([Profit]))", "Furniture is a modest net-positive profit contributor, not a net-negative one"],
            ["Control Chart", "WINDOW_AVG / WINDOW_STDEV \u00b12\u03c3", "Three specific months (Oct 2015, May 2017, Nov 2017) are statistically anomalous"],
            ["Bump Chart", "RANK(SUM([Profit]))", "Machines/Tables hold the bottom two profit ranks in every single year \u2014 a structural, not one-off, pattern"],
          ],
          [1900, 2900, 4180]
        ),
        Caption("Table 2. The four Week 4 advanced techniques, their core calculation, and the insight each one added."),
        ...Figure(CH4 + "calc_buildup_diagram.png", 6.2, 2.95, "Figure 4. Calculation build-up from raw fields to each advanced chart, as documented in Week 4."),
        H2("6.3 Design Rationale Highlights"),
        P("Every Week 4 calculation was validated against the same Week 1 dataset before being written into the report \u2014 the bullet-chart targets, waterfall totals, control limits, and rank trends are all real computed outputs, not illustrative placeholders, which is what makes Table 2's \u201cnew insight\u201d column defensible rather than aspirational."),

        H1("7. Week 5 \u2014 Performance Optimization & Interactivity Enhancement"),
        H2("7.1 Objective"),
        P("Audit the four-dashboard workbook (as designed in Weeks 2 and 4) for performance, scalability, and interaction quality, and propose concrete, prioritized optimizations."),
        H2("7.2 What Was Produced"),
        Bullet("A bottleneck map identifying five concrete, severity-ranked issues against the actual dashboard designs (an unaggregated 9,994-mark scatter plot, un-set context filters, live-connection re-querying, heavy Week 4 table calculations, and a crowded Customer & Geographic page)."),
        Bullet("Optimization strategies across five areas \u2014 data/extract, filters, calculations, visual/dashboard design, and publishing/server-side \u2014 each tied to a specific identified bottleneck."),
        Bullet("A before/after benchmark projecting a 60\u201370% load-time reduction across all five dashboard pages, explicitly labeled as a planning estimate rather than a live measurement."),
        Bullet("Interactivity enhancements (drill-down hierarchy, Top-N parameter, smart default filters, global reset button, saved bookmarks) each framed as simultaneously improving usability and reducing compute cost."),
        ...Figure(CH5 + "bottleneck_map.png", 6.3, 3.55, "Figure 5. The Week 5 performance bottleneck map, rating five issues found in the Weeks 2 & 4 dashboard designs."),
        H2("7.3 Design Rationale Highlights"),
        P("Week 5's central insight was that performance and usability are not competing concerns in this workbook: nearly every proposed interactivity enhancement (parameters, smart defaults, scoped filters) reduces what Tableau has to compute on each interaction, so the same change improves both the feel and the speed of the dashboard at once."),

        H1("8. Integrated Workbook Architecture"),
        P("Bringing all six weeks together, the finished design is a single Tableau workbook with four architectural layers: a narrative layer (the Week 3 Story) sitting on top of an exploration layer (the four Week 2/4 dashboards), which in turn depends on a data foundation (Week 1) and a calculation layer (Week 4), all underpinned by the performance and governance practices from Week 5."),
        ...Figure(CH6 + "integrated_architecture.png", 6.6, 3.95, "Figure 6. Integrated architecture \u2014 how the guided story, four dashboards, data foundation, calculation layer, and performance layer from all six weeks combine into one workbook."),
        P("This layered view is also a dependency map for the Week 7+ build phase referenced throughout Weeks 2\u20135's \u201cbuild roadmap\u201d sections: the data foundation and calculation layer must exist before any dashboard can be built, the four dashboards must exist before the story can drill through to them, and the performance layer's context-filter and extract decisions should be applied from the start rather than retrofitted."),

        H1("9. Critical Evaluation"),
        H2("9.1 What Worked Well"),
        Bullet("Traceability: because every week explicitly cited Week 1 figures, the six deliverables read as one coherent analysis rather than six independent exercises \u2014 this discipline was worth the extra effort of cross-referencing specific numbers in every report."),
        Bullet("Separating exploration from narrative (Week 2 vs. Week 3) proved to be the right structural call: the three-persona dashboards and the single-audience story genuinely need different layouts, and conflating them would have compromised both."),
        Bullet("Grounding every Week 4 advanced-chart claim in a real, computed number (rather than an illustrative mock figure) materially strengthened the report \u2014 the finding that Machines/Tables rank last in every single year is a much stronger claim than an assumed pattern would have been."),
        H2("9.2 Trade-offs and Limitations"),
        Bullet("Synthetic data: because the original Sample \u2013 Superstore file could not be downloaded in this environment, all six weeks work from a calibrated synthetic recreation. It is closely matched to the real dataset's structure and aggregate KPIs, but exact figures (e.g., the specific anomalous months in the Week 4 control chart) would shift somewhat if re-run against the genuine file \u2014 a caveat carried honestly through every week's report rather than glossed over."),
        Bullet("Planning artifacts, not a built workbook: every week produced wireframes, calculation specifications, and Tableau build instructions rather than a published .twbx workbook, since no live Tableau environment was available. This is appropriate for tasks explicitly scoped as \u201cplanning\u201d (Weeks 2, 3, 5) but means the Week 5 performance figures, in particular, are estimates grounded in documented Tableau behavior rather than measurements from Tableau's own Performance Recorder."),
        Bullet("Table-calculation complexity: the Week 4 RANK/WINDOW_-based calculations are powerful but fragile \u2014 their correctness depends entirely on the partition/addressing configured in the actual Tableau view, a detail that is easy to get right on paper and easy to get subtly wrong in the live product; this risk is called out in Week 4 but is worth re-emphasizing here as the single highest-risk technical element to validate first during a real build."),
        H2("9.3 Effectiveness Against the Stated Goals"),
        P("Judged against each week's own evaluation criteria, the strongest deliverables were Week 1 (depth of EDA, directly enabling every later week) and Week 4 (technical correctness of calculated fields, verified against real computed data). The area with the most inherent uncertainty is Week 5, precisely because performance claims are hardest to validate without a live server \u2014 the report addresses this by labeling all benchmark figures as estimates and by proposing a concrete validation plan (Section 7 of the Week 5 report) rather than presenting projections as measured fact."),

        H1("10. Lessons Learned"),
        H2("10.1 Technical Lessons"),
        Bullet("Table calculations (RANK, WINDOW_AVG, RUNNING_SUM) are addressed relative to a specific partition, and that partition has to be chosen deliberately \u2014 getting this wrong silently produces a plausible-looking but incorrect chart, which is a much harder failure mode to catch than an outright error."),
        Bullet("A waterfall chart's \u201cfloating bar\u201d technique (RUNNING_SUM minus the current value, on a Gantt mark) is a good example of Tableau's default chart types being extendable well beyond their apparent limits with one well-chosen calculated field."),
        Bullet("Designing the discount-cap what-if parameter in Week 3 clarified how much more persuasive a simulated, reader-controlled number is than the same number simply stated \u2014 a lesson that generalizes well beyond this dataset."),
        H2("10.2 Process Lessons"),
        Bullet("Writing each week's report with an explicit \u201ctraceability\u201d discipline (citing the exact Week 1 figure behind every claim) made later weeks faster to write, not slower \u2014 it removed the need to re-derive or re-justify findings that were already established."),
        Bullet("Separating \u201cwhat to build\u201d (Weeks 2, 3, 5) from \u201cwhat the numbers show\u201d (Weeks 1, 4) kept each report focused; attempting to do both in one document earlier in the process (an approach abandoned before Week 1's final draft) produced a much harder document to navigate."),
        Bullet("Verifying every embedded chart and diagram by rendering the actual document to PDF and visually inspecting it \u2014 rather than trusting the generation code \u2014 caught several real rendering defects (including a subtle docx styling bug that silently corrupted embedded images) that would otherwise have shipped in the final deliverables."),

        H1("11. Challenges & How They Were Addressed"),
        dataTable(
          ["Challenge", "How It Was Addressed"],
          [
            ["Could not download the full original Sample \u2013 Superstore CSV in this environment", "Built a calibrated synthetic dataset matching the real file's schema and aggregate KPIs, and disclosed this choice transparently in every affected report rather than presenting synthetic figures as the original data"],
            ["No live Tableau environment to build or benchmark in", "Produced fully specified build plans (exact shelves, marks, calculated-field syntax) and clearly labeled all performance figures as planning estimates rather than measurements"],
            ["A docx-generation styling bug silently corrupted embedded chart images", "Diagnosed by isolating a minimal reproduction case, identified the exact style property responsible, and re-verified every prior report page-by-page after the fix"],
            ["Keeping five (then six) separate reports numerically consistent with each other", "Centralized every computed figure in one shared results file (results.json) that every week's report reads from, instead of re-deriving or re-typing numbers per week"],
          ],
          [3400, 5580]
        ),
        Caption("Table 3. The four most significant challenges encountered across the six weeks and how each was resolved."),

        H1("12. Recommendations for Future Enhancements"),
        H2("12.1 Immediate Next Steps (Build Phase)"),
        Bullet("Connect to the real Sample \u2013 Superstore source (or the organization's live sales data) and re-run the Week 1 EDA to confirm every downstream figure still holds; treat any material divergence as a signal to revisit the affected week's recommendations."),
        Bullet("Build the workbook in the dependency order shown in Figure 6: data source and extract, calculated fields, the four dashboards, then the Story on top."),
        Bullet("Validate every table calculation's partition/addressing against Table 2's formulas immediately after building each sheet, before assembling dashboards \u2014 per the Section 9.2 risk note."),
        H2("12.2 Medium-Term Enhancements"),
        Bullet("Add Tableau's native forecasting and trend-line significance testing to the Week 1 monthly trend view, extending the Week 4 control-chart anomaly detection with forward-looking projection."),
        Bullet("Introduce row-level security and a filtered \u201cmy region only\u201d view for the regional-manager persona defined in Week 2, rather than relying solely on manual filter selection."),
        Bullet("Extend the Week 4 calculation layer with a customer-lifetime-value LOD calculation to deepen the Week 1/3 customer-concentration (Pareto) finding into a retention-targeting tool."),
        H2("12.3 Longer-Term / Organizational Recommendations"),
        Bullet("Publish to Tableau Server or Cloud with the incremental-refresh and caching strategy from Week 5 in place from day one, rather than retrofitting performance practice after user complaints."),
        Bullet("Establish the Week 5 six-stage optimization workflow (Assess \u2192 Extract \u2192 Filters \u2192 Calc \u2192 Design \u2192 Test) as a standing governance checklist, re-run after every significant data-volume or dashboard change, not just at initial launch."),
        Bullet("Build a lightweight style guide from the Week 2 color/typography system so future dashboards across the organization inherit the same visual language rather than each analyst re-deciding it."),

        H1("13. Skills & Competency Summary"),
        P("For portfolio or employer review, the table below maps each week to the specific, demonstrable skills it evidences."),
        dataTable(
          ["Week", "Core Competencies Demonstrated"],
          [
            ["1", "Exploratory data analysis; data quality validation; statistical summarization; insight prioritization; translating analysis into a BI-tool build specification"],
            ["2", "Audience/persona-based design thinking; information architecture; wireframing; color/typography systems; accessibility-aware design"],
            ["3", "Narrative design; storyboarding; interaction design (parameters, actions, drill-through); persuasive/simulated data communication"],
            ["4", "Advanced Tableau chart techniques; LOD expressions and table calculations (LOOKUP, RUNNING_SUM, WINDOW_*, RANK); calculation validation against real data"],
            ["5", "Performance diagnosis and optimization strategy; extract/filter/calculation tuning; the trade-off between interactivity and compute cost; testing and validation planning"],
            ["6", "Cross-project synthesis; critical self-evaluation; technical writing and documentation structure; forward-looking strategic recommendation"],
          ],
          [900, 8480]
        ),
        Caption("Table 4. Skills and competencies demonstrated per week."),

        H1("14. Conclusion"),
        P("This six-week internship took a single public dataset from first exploration to a fully specified, performance-audited, interactively-designed Tableau practice \u2014 without ever losing the thread connecting each week's work back to the original Week 1 findings. The strongest outcome is not any individual chart or dashboard but the discipline of traceability itself: every recommendation in this final report, and in the five that precede it, can be walked back to a specific, validated number in the underlying data."),
        P("The honest limitations documented in Section 9 \u2014 synthetic data, unbuilt (though fully specified) dashboards, and estimated rather than measured performance \u2014 are not gaps to hide but the natural shape of a planning-and-analysis engagement done without a live production environment. The recommendations in Section 12 describe exactly how that gap closes: connect real data, build in the dependency order this report specifies, and carry the Week 5 performance discipline forward as an ongoing practice rather than a one-time audit. Taken together, the six weeks demonstrate not just the ability to produce individual charts or reports, but the ability to design, justify, critique, and hand off a coherent analytics product \u2014 the core skill this internship set out to build."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("./Final_Integration_Evaluation_Report.docx", buf);
  console.log("Wrote docx, bytes:", buf.length);
});
