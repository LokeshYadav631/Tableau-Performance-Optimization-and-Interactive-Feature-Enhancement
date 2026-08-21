const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, ImageRun, AlignmentType, BorderStyle, PageBreak,
  LevelFormat, Header, Footer, PageNumber, VerticalAlign,
} = require("docx");
const fs = require("fs");

const CH = "./mockups/";
const NAVY = "1F3864";
const ACCENT = "4E79A7";
const GREY = "595959";
const LIGHTGREY = "F2F2F2";
const RED = "E15759";
const ORANGE = "F28E2B";
const GREEN = "59A14F";

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
function sevColor(s) { return s === "High" ? RED : s === "Med" ? ORANGE : GREEN; }
function severityTable(headers, rows, widths, sevCol) {
  const total = widths.reduce((a,b)=>a+b,0);
  const headerRow = new TableRow({ tableHeader: true,
    children: headers.map((h,i) => cell(h, { bold: true, shade: NAVY, width: widths[i], color: "FFFFFF", align: i===0?AlignmentType.LEFT:AlignmentType.CENTER })) });
  const bodyRows = rows.map((r, ridx) => new TableRow({
    children: r.map((v,i) => i===sevCol
      ? cell(v, { width: widths[i], shade: sevColor(v), color: "FFFFFF", bold: true, align: AlignmentType.CENTER })
      : cell(v, { width: widths[i], shade: ridx % 2 === 1 ? LIGHTGREY : null, align: AlignmentType.LEFT })) }));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows: [headerRow, ...bodyRows] });
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
        new Paragraph({ spacing: { before: 2200, line: 340 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "PERFORMANCE OPTIMIZATION", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 40, line: 340 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "& INTERACTIVE FEATURE ENHANCEMENT", bold: true, size: 36, color: NAVY })] }),
        new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "A Performance & Usability Audit of the Sample \u2013 Superstore Tableau Workbook", size: 26, color: ACCENT, italics: true })] }),
        new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Week 5 Task \u2013 Data Analytics Internship Program", size: 24, color: GREY })] }),
        new Paragraph({ spacing: { before: 3200 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "A bottleneck assessment, optimization strategy, and interactivity", size: 20, color: GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "enhancement plan for the four-dashboard workbook built across Weeks 1\u20134.", size: 20, color: GREY })] }),
        new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Load-time figures in this document are illustrative estimates for planning purposes, grounded in documented Tableau performance principles \u2014 not measurements from a live server.", size: 18, color: GREY, italics: true })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ---------------- MAIN BODY ----------------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Sample \u2013 Superstore | Performance Optimization & Interactivity Plan", size: 16, color: GREY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })] })] }) },
      children: [

        H1("1. Executive Summary"),
        P("The workbook built across Weeks 1\u20134 \u2014 four dashboards (Executive Overview, Product & Profitability, Customer & Geographic, Advanced Analytics) plus a seven-scene Story \u2014 was designed for analytical depth and narrative clarity. This week's task is to audit that same design for a different concern: how it will perform and feel to use once it is a real, published, interactively-filtered workbook rather than a set of planning documents."),
        P("The assessment below identifies five concrete, high-likelihood performance bottlenecks in the current design (an unaggregated 9,994-mark scatter plot, un-set context filters, live-connection re-querying, a heavy Advanced Analytics page full of table calculations, and a crowded Customer & Geographic dashboard). For each, this report documents a specific, actionable optimization drawn from established Tableau best practice, and projects the combined impact against a conservative sub-3-second load-time target. It then proposes five interactivity enhancements \u2014 a drill-down hierarchy, a Top-N parameter, smart default filters, a global reset control, and saved bookmarks \u2014 that improve usability precisely by reducing what the workbook has to compute, not just by adding features."),

        H1("2. Assessment \u2014 Current Performance Profile"),
        H2("2.1 Assessment Methodology"),
        P("In a live Tableau environment, this assessment would begin with Tableau's built-in Performance Recording dashboard, which logs every query, calculation, layout computation, and rendering event with a timestamp and duration, making the single slowest event on each dashboard immediately visible. Since this task is scoped as a planning exercise ahead of the Week 6 build, the assessment below applies the same diagnostic questions the Performance Recorder answers \u2014 which queries run most often, which marks are most numerous, which calculations are most expensive \u2014 directly against the dashboard designs specified in Weeks 2 and 4."),
        H2("2.2 Data & Workbook Profile"),
        Bullet("Base data: 9,994 order line items \u00d7 19 fields (Sample \u2013 Superstore) \u2014 small in absolute terms, but several design choices multiply its effective cost (see below)."),
        Bullet("Workbook: 4 dashboards (~24 worksheets total) plus a 7-scene Story, sharing one data source and 5 global filters."),
        Bullet("Calculation load: 8 calculated fields from Week 4 alone, including 2 table calculations that use WINDOW_ or RANK functions, which Tableau must recompute across their full partition on every filter change."),
        H2("2.3 Bottleneck Map"),
        ...Figure(CH + "bottleneck_map.png", 6.6, 3.25, "Figure 1. Performance bottleneck map \u2014 five issues identified against the actual dashboard designs from Weeks 2 and 4, rated by likely impact."),
        H2("2.4 Detailed Findings"),
        severityTable(
          ["#", "Bottleneck", "Location", "Root Cause", "Impact"],
          [
            ["1", "Full re-query on every filter change", "Global filters (all dashboards)", "Live connection (assumed default) instead of an extract; no filter set as Context", "High"],
            ["2", "9,994 unaggregated marks", "Dashboard B \u2014 Discount vs. Profit scatter", "Chart plots every line item individually instead of a binned/sampled view", "High"],
            ["3", "5 filters applied to all sheets", "Every dashboard", "\u201cApply to all sheets using this data source\u201d recalculates every sheet on the page per change, whether or not that sheet uses the filtered field", "High"],
            ["4", "4 table calculations recomputed per interaction", "Dashboard D \u2014 Advanced Analytics", "RANK and WINDOW_AVG/STDEV must rescan their full partition (all sub-categories \u00d7 all years) on every filter or parameter change", "Med"],
            ["5", "Filled map + full detail table on one page", "Dashboard C \u2014 Customer & Geographic", "Geocoding and a large sortable table both render on first load of the same page", "Med"],
          ],
          [420, 2380, 2280, 2960, 940],
          4
        ),
        Caption("Table 1. Detailed bottleneck findings, ranked by projected impact."),

        H1("3. Optimization Strategies"),
        H2("3.1 Data & Extract Optimization"),
        Bullet("Publish a Hyper extract instead of a live connection for this workbook \u2014 the data changes on a schedule, not in real time, so there is no need to pay a live-query cost on every interaction."),
        Bullet("Aggregate the extract to the level the dashboards actually visualize (e.g., pre-aggregate to Order Date \u00d7 Category \u00d7 Region for the KPI and trend views) and keep a separate, row-level extract only for the sheets that genuinely need line-item detail (the discount scatter, the customer table)."),
        Bullet("Hide and remove unused fields before publishing \u2014 Row ID, Product Name, and Postal Code are not visualized anywhere in the current design and still cost extract size and refresh time if retained."),
        Bullet("Apply an extract filter to drop any data outside the workbook's supported date range, so the extract never carries more history than the dashboards expose."),
        H2("3.2 Filter Optimization"),
        Bullet("Set Region and Date Range as Context Filters on every dashboard \u2014 this materializes a smaller temporary table once per context change, so the remaining filters and every calculation run against a pre-shrunk data pool instead of the full 9,994 rows each time."),
        Bullet("Replace the Discount % range filter with a parameter feeding a calculated field where practical \u2014 parameters are single values with no member list to query, so they avoid the \u201cshow relevant values\u201d cost a range filter incurs on a live connection."),
        Bullet("Scope each filter to only the sheets that use its field, instead of the current \u201call sheets using this data source\u201d setting, so an interaction on Dashboard D does not force Dashboard A's KPI tiles to recompute in the background."),
        Bullet("Use \u201cOnly Relevant Values\u201d sparingly \u2014 it is convenient but forces a query against the full data source to populate every filter's member list; fixed lists are cheaper wherever the dimension's members are stable (e.g., Category, Region, Segment)."),
        H2("3.3 Calculation Optimization"),
        Bullet("Materialize the [Sales Target], [Waterfall Running Total], and similar Week 4 fields as extract-time calculations where their logic allows it, so Tableau computes them once at extract refresh rather than on every view render."),
        Bullet("Narrow the partition on the [Profit Rank] and [UCL]/[LCL] table calculations to only the dimensions actually needed (Sub-Category by Year; Month) rather than leaving them addressed against the full data source by default."),
        Bullet("Avoid row-level string or date calculations inside frequently-filtered views \u2014 push any such logic into the extract or a prep step instead of recalculating it per query."),
        Bullet("Consolidate near-duplicate calculated fields (e.g., a single parameterized [Margin] field reused across dashboards) rather than maintaining separate near-identical calculations per sheet, which is easy to drift out of sync and each adds its own compute cost."),
        H2("3.4 Visual & Dashboard Design Optimization"),
        Bullet("Replace the raw 9,994-point discount scatter with a binned density/hexbin view or a filtered Top-N sample for the default state, with the full scatter available only after a user opts in (e.g., via a \u201cshow all points\u201d toggle) \u2014 mark count is one of the single biggest levers on render time."),
        Bullet("Cap dashboards at 6\u20138 worksheets each; Dashboard A already sits at the top of this range, so any future addition should go on Dashboard D or a new page rather than growing Dashboard A further."),
        Bullet("Use fewer, purpose-built dashboard actions rather than one action per possible interaction \u2014 each additional action is a potential chain reaction across every sheet on the page."),
        Bullet("Favor \u201cRun on Select\u201d over \u201cRun on Hover\u201d for filter/highlight actions; hover actions fire on every mouse movement across a mark and are measurably more expensive at scale."),
        Bullet("Compress and correctly size any background images or custom shapes used in the dashboards; oversized image assets are a common, easily-fixed source of slow initial dashboard load."),
        H2("3.5 Publishing & Server-Side Optimization"),
        Bullet("Schedule extract refreshes for off-peak hours and use incremental refresh (new/changed rows only) once the data source is append-only by Order Date, rather than a full extract rebuild on every refresh."),
        Bullet("Enable and monitor the Tableau Server cache; keep default filter/parameter states consistent across users where possible so more sessions can share a cached query result."),
        Bullet("Set the workbook's default view to open on the lightest dashboard (Executive Overview, KPI tiles first) rather than the heaviest, since first-open latency shapes a user's whole impression of performance."),

        H1("4. Projected Impact \u2014 Before / After Benchmark"),
        P("The chart below is a planning estimate, not a measured benchmark \u2014 it applies documented, typical Tableau performance-optimization impact ranges (commonly 40\u201370% load-time reduction from extract + filter + mark-count optimization, per Tableau's own performance guidance) to the specific bottlenecks identified in Section 2, to give a directional sense of where effort will pay off most."),
        ...Figure(CH + "benchmark_chart.png", 6.4, 3.3, "Figure 2. Projected load-time impact by dashboard \u2014 Dashboard B (the scatter-heavy Product & Profitability page) has the most to gain from mark-count and filter optimization."),
        P("Every dashboard is projected to land under the commonly cited 3-second threshold for perceived-instant response after optimization, with Dashboard B \u2014 the current worst performer due to its unaggregated scatter plot \u2014 seeing the largest relative improvement."),

        H1("5. Enhanced Interactivity Design"),
        P("The proposed interactivity enhancements are deliberately chosen to improve usability by reducing what the workbook computes on each interaction, not by adding more compute on top of an already heavy design."),
        ...Figure(CH + "drilldown_interactivity.png", 6.6, 3.5, "Figure 3. Drill-down hierarchy (Category \u2192 Sub-Category \u2192 Product) and four supporting interactivity controls."),
        H2("5.1 Drill-Down Hierarchy"),
        P("Replacing three separate sub-category, and product-level sheets with a single hierarchy-enabled sheet lets a user double-click to drill from Category (3 members) to Sub-Category (17) to Product (1,850+) in place, rendering only the currently-relevant level's marks instead of pre-rendering all three levels at once."),
        H2("5.2 Top-N Parameter"),
        P("A user-facing parameter lets a reader cap the sub-category and product views to the Top 5, Top 10, or All, directly reducing the number of marks Tableau renders \u2014 a usability improvement (less visual clutter) that is simultaneously a performance optimization (fewer marks to compute and draw)."),
        H2("5.3 Smart Default Filters"),
        P("Dashboards currently default to showing all four years of history on open. Defaulting instead to the latest complete quarter \u2014 with a clearly visible \u201cShow all history\u201d control to opt back out \u2014 means the first, most common view most users see is already working against a smaller data pool."),
        H2("5.4 Global Reset Button"),
        P("A single button, present on every dashboard, that clears all filters, parameters, and highlight selections back to the smart defaults above. This avoids the common failure mode where a user accumulates several filters across a session, only some of which they remember setting, degrading both their experience and (since more specific filter combinations are less likely to be cache-hits) the workbook's effective performance."),
        H2("5.5 Saved Bookmarks / Custom Views"),
        P("Letting a returning user save and reload a named filter/parameter state (e.g., \u201cMy Region \u2013 Q4\u201d) means they do not need to manually rebuild a multi-step filter state on every visit, which both improves their experience and reduces the number of incremental filter-change queries the server has to serve per session."),

        H1("6. Optimization Workflow & Governance"),
        P("The five optimization areas in Section 3 are not a one-time pass \u2014 they are organized here as a repeatable six-stage process to run initially and again after any significant change to the data or the dashboards."),
        ...Figure(CH + "optimization_workflow.png", 6.6, 1.75, "Figure 4. Optimization workflow \u2014 a six-stage process from initial assessment through validation, re-run after each publish or major data-volume change."),
        P("Governance recommendation: assign ownership of the Assess and Test stages to whoever publishes updates to the workbook, so performance regressions are caught before a change reaches end users rather than reported after the fact."),

        H1("7. Testing & Validation Plan"),
        Bullet("Re-run Tableau's Performance Recording dashboard after implementing each of the five Section 3 strategy groups individually, to attribute improvement to the correct change rather than only measuring a single before/after pair."),
        Bullet("Validate against a concrete target: every dashboard should load in under 3 seconds and respond to a filter change in under 1 second on the extract, consistent with the projections in Figure 2."),
        Bullet("Test with cold cache (first load of the day) as well as warm cache, since the two can differ substantially and only cold-cache performance is visible to a genuinely new user."),
        Bullet("Have at least one reviewer unfamiliar with the workbook complete a scripted task (e.g., \u201cfind the lowest-margin state in the South region\u201d) on both the before and after versions, timing task completion in addition to raw load time \u2014 usability and raw speed do not always move together."),

        H1("8. Conclusion"),
        P("This assessment ties every proposed optimization directly back to a specific, identified bottleneck in the actual four-dashboard workbook designed across Weeks 1\u20134, rather than offering generic Tableau advice. The data + filter + calculation + design changes in Section 3 target a projected 60\u201370% load-time reduction across all five dashboard pages, while the interactivity enhancements in Section 5 improve usability specifically by reducing what must be computed \u2014 aligning performance and user experience as one workstream rather than two competing ones. The six-stage workflow in Section 6 and the validation plan in Section 7 give this a repeatable process, so performance stays a maintained property of the workbook rather than a one-time fix."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("./Performance_Optimization_Interactivity_Plan.docx", buf);
  console.log("Wrote docx, bytes:", buf.length);
});
