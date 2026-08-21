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
    children: r.map((v,i) => cell(v, { width: widths[i], shade: ridx % 2 === 1 ? LIGHTGREY : null, align: i===0?AlignmentType.LEFT:AlignmentType.CENTER })) }));
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
          children: [new TextRun({ text: "DASHBOARD PLANNING", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 40, line: 340 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "& DESIGN STRATEGY", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "A Tableau Dashboard Blueprint for the Sample \u2013 Superstore Dataset", size: 28, color: ACCENT, italics: true })] }),
        new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Week 2 Task \u2013 Data Analytics Internship Program", size: 24, color: GREY })] }),
        new Paragraph({ spacing: { before: 3200 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Conceptualization, layout strategy, and interaction design for a", size: 20, color: GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "three-dashboard Tableau workbook, built on the Week 1 EDA findings.", size: 20, color: GREY })] }),
        new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "This document is a planning blueprint: layouts are wireframe mock-ups, not the built dashboard.", size: 18, color: GREY, italics: true })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ---------------- MAIN BODY ----------------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Sample \u2013 Superstore | Dashboard Planning & Design Strategy", size: 16, color: GREY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })] })] }) },
      children: [

        H1("1. Executive Summary"),
        P("This report is the design blueprint for a three-dashboard Tableau workbook built on the Sample \u2013 Superstore dataset analyzed in Week 1. Rather than building the workbook itself, this week's task is to plan it: who it is for, what story it needs to tell, how the views are arranged, how they interact, and why each design choice was made."),
        P("The plan proposes three linked dashboards \u2014 an Executive Overview, a Product & Profitability Deep-Dive, and a Customer & Geographic Analysis \u2014 connected by global filters and click-to-filter actions, so a single workbook can serve an executive glancing at KPIs and an analyst drilling into a specific state or sub-category without switching tools. Every chart placement, color choice, and interaction described below is tied directly back to a finding from the Week 1 EDA (e.g., the discount-profit relationship, the underperforming Tables/Machines sub-categories, the December seasonal peak), so the dashboard is designed to surface exactly the insights the data supports."),

        H1("2. Dashboard Objectives & Target Audience"),
        H2("2.1 Business Objectives"),
        P("The dashboard workbook is designed to answer four recurring business questions identified in the Week 1 analysis:"),
        Bullet("Are we growing, and is that growth profitable? (overall KPI health, trend over time)"),
        Bullet("Where is profit being won or lost across products and regions? (category, sub-category, and geographic profitability)"),
        Bullet("Is our discounting strategy helping or hurting margin? (discount-vs-profit relationship)"),
        Bullet("Which customers, states, and products deserve the most attention right now? (concentration, outliers, loss-makers)"),

        H2("2.2 Target Audience & Personas"),
        P("Three primary personas were used to guide the layout decisions below. Each has a different amount of time to spend and a different depth of question:"),
        dataTable(
          ["Persona", "Primary Goal", "Time Budget", "Primary Dashboard"],
          [
            ["VP of Sales / Executive", "Fast read on overall health vs. target and last year", "< 30 seconds", "A \u2013 Executive Overview"],
            ["Category / Product Manager", "Diagnose which sub-categories and discount levels are hurting margin", "5\u201310 minutes", "B \u2013 Product & Profitability"],
            ["Regional / Account Manager", "Identify top and at-risk customers and states in their territory", "5\u201310 minutes", "C \u2013 Customer & Geographic"],
          ],
          [2400, 3200, 1700, 1680]
        ),
        Caption("Table 1. Target personas and how each maps to a dashboard in the workbook."),
        P("Designing for three distinct time budgets is the main reason the workbook is split into three dashboards rather than one dense screen: an executive should never have to scroll or filter to get the headline answer, while a manager needs room to explore without leaving the tool."),

        H1("3. Data Story & Key Metrics"),
        P("Each visual element in the workbook is chosen because it carries forward a specific, already-validated finding from the Week 1 EDA \u2014 the dashboard is not a generic template, it is purpose-built around what the data has already shown to matter."),
        dataTable(
          ["Week 1 Finding", "Metric(s)", "Dashboard View"],
          [
            ["Overall sales/profit health and YoY growth", "Total Sales, Total Profit, Margin, CAGR", "A: KPI tiles + trend line"],
            ["Discounts above ~30% flip margin negative (corr = -0.66)", "Discount, Profit, Profit Margin", "B: discount-band bars + scatter"],
            ["Machines & Tables sub-categories run at a loss", "Profit by Sub-Category", "A & B: sub-category profit bars"],
            ["December is a clear seasonal peak", "Sales by Month", "A: seasonality panel"],
            ["West leads on margin; Central/South trail", "Sales, Profit, Margin by Region", "A & C: region bars + state map"],
            ["Top 20% of customers drive ~40% of sales", "Cumulative % of Sales by Customer", "C: Pareto curve"],
            ["Furniture underperforms relative to its sales size", "Sales vs. Profit by Category", "A & B: category bar chart"],
          ],
          [3620, 2700, 2660]
        ),
        Caption("Table 2. Traceability from Week 1 findings to specific dashboard views \u2014 nothing on the dashboard is there without a data-driven reason."),

        H1("4. Dashboard Architecture & Data Story Arc"),
        P("The workbook is structured as one landing dashboard (Executive Overview) with two purpose-built drill-down dashboards, connected through both direct click actions and always-available top navigation tabs. Global filters (date range, region, category, segment, discount) persist across all three views via Tableau filter actions, so a filter set on the Overview stays applied when the reader drills into Product or Customer detail."),
        ...Figure(CH + "diag_architecture.png", 6.5, 3.7, "Figure 1. Dashboard architecture and navigation map \u2014 how the three dashboards connect."),
        P("The reading order mirrors a standard BI narrative arc \u2014 Overview, Diagnose, Explore, Act \u2014 with Dashboard A covering the first two stages and Dashboards B and C supporting the deeper two:"),
        ...Figure(CH + "diag_story_arc.png", 6.5, 2.6, "Figure 2. Data story arc \u2014 the intended reading path through the workbook."),

        H1("5. Dashboard A \u2014 Executive Overview"),
        H2("5.1 Purpose & Audience"),
        P("A single-screen, no-scroll view answering \u201cHow is the business doing?\u201d for a time-constrained executive. Every number on this screen should be interpretable in under 30 seconds without touching a filter."),
        H2("5.2 Layout Wireframe"),
        ...Figure(CH + "wf1_executive_overview.png", 6.5, 3.7, "Figure 3. Wireframe A \u2014 Executive Overview. KPI row up top, trend and regional context in the middle band, geographic and segment detail along the bottom."),
        H2("5.3 Panel-by-Panel Rationale"),
        dataTable(
          ["Panel", "Chart Type", "Why This View"],
          [
            ["KPI row (Sales, Profit, Margin, Orders, Avg. Discount)", "Big-number tiles w/ YoY delta", "Answers \u201chow are we doing\u201d instantly, before any interaction; delta arrows give trend direction at a glance."],
            ["Profit by Sub-Category", "Sorted horizontal bar, red/green", "Immediately surfaces the Machines/Tables loss-makers \u2014 the single most actionable finding from Week 1 \u2014 without requiring a click."],
            ["Monthly Sales & Profit Trend", "Dual-axis line", "Shows growth trajectory and the Dec seasonal peak in one glance; dual axis keeps Sales and Profit comparable despite different scales."],
            ["Sales by Region", "Bar, labeled with margin %", "Puts the region-level margin gap (West 12% vs. South 9%) directly on the chart rather than requiring a tooltip hover."],
            ["Seasonality by month", "Bar, 12 columns", "Compact, single-glance confirmation of the December peak for inventory/staffing planning."],
            ["Sales & Profit by State (map)", "Filled map, color = margin", "Geographic pattern recognition is faster on a map than a sorted list; serves as the entry point into Dashboard C."],
            ["Discount vs. Profit", "Scatter, red = loss", "Gives the executive a one-glance gut check on discounting risk before drilling into Dashboard B for the full analysis."],
            ["Segment Mix", "Pie", "Simple composition check; kept small since segment differences were found to be minor in Week 1."],
          ],
          [2400, 1900, 4680]
        ),
        Caption("Table 3. Rationale for every panel on the Executive Overview dashboard."),

        H1("6. Dashboard B \u2014 Product & Profitability Deep-Dive"),
        H2("6.1 Purpose & Audience"),
        P("Reached by clicking any category or sub-category on Dashboard A, this view is built for a product/category manager who needs to understand exactly which products and discount levels are driving the margin problem, and why."),
        H2("6.2 Layout Wireframe"),
        ...Figure(CH + "wf2_product_deepdive.png", 6.5, 3.75, "Figure 4. Wireframe B \u2014 Product & Profitability Deep-Dive. A 3\u00d72 grid pairs each summary chart with its supporting diagnostic chart."),
        H2("6.3 Panel-by-Panel Rationale"),
        dataTable(
          ["Panel", "Chart Type", "Why This View"],
          [
            ["Sales vs. Profit by Category", "Grouped bar", "Anchors the page with the same category comparison from Dashboard A, now as the entry point for a full breakdown."],
            ["Profit by Sub-Category (sorted)", "Horizontal bar, click-to-filter", "The primary diagnostic chart; clicking a sub-category filters every other panel on the page to that sub-category."],
            ["Avg. Margin by Discount Band", "Bar, 5 bands", "Converts the abstract -0.66 correlation into a concrete, actionable threshold (\u224830% discount) a manager can set as a policy cap."],
            ["Discount vs. Profit (scatter)", "Scatter, line-item detail", "Shows the underlying spread behind the banded view \u2014 confirms the band chart isn't hiding high-variance outliers."],
            ["Profit Distribution by Category (box plot)", "Box-and-whisker", "Surfaces the outlier line items (Section 5.9 of the Week 1 report) that the aggregate bars alone would hide."],
            ["Correlation Heatmap", "Highlight table", "Gives a quantitative anchor for the qualitative patterns shown elsewhere on the page."],
          ],
          [2400, 1900, 4680]
        ),
        Caption("Table 4. Rationale for every panel on the Product & Profitability Deep-Dive dashboard."),

        H1("7. Dashboard C \u2014 Customer & Geographic Analysis"),
        H2("7.1 Purpose & Audience"),
        P("Reached by clicking a state or region on Dashboard A, this view is built for a regional or account manager who needs to identify which customers and states in their territory are worth the most attention \u2014 both the best accounts to protect and the underperforming states to investigate."),
        H2("7.2 Layout Wireframe"),
        ...Figure(CH + "wf3_customer_geo.png", 6.5, 3.75, "Figure 5. Wireframe C \u2014 Customer & Geographic Analysis. A large map anchors the top of the page; supporting detail and a sortable table sit below."),
        H2("7.3 Panel-by-Panel Rationale"),
        dataTable(
          ["Panel", "Chart Type", "Why This View"],
          [
            ["Sales & Profit Map by State", "Filled/symbol map, size=sales, color=margin", "The largest panel on the page \u2014 geographic patterns are the primary lens for this dashboard, so the map gets the most screen real estate."],
            ["Sales by Segment", "Pie (compact)", "Kept small and secondary since Week 1 found little variation in margin across segments."],
            ["Top / Bottom 10 States by Profit", "Diverging bar", "Directly actionable list \u2014 the states an account manager should prioritize this week."],
            ["Customer Sales Concentration (Pareto)", "Cumulative line", "Communicates the ~40% revenue concentration finding and supports a tiered account-management conversation."],
            ["Sales by Ship Mode", "Bar + avg. days label", "Secondary operational context; helps a manager sanity-check fulfillment cost against a customer's order pattern."],
            ["Customer Detail Table", "Sortable/searchable grid", "Gives the power user a way to search a named account directly rather than relying purely on visual exploration."],
          ],
          [2400, 1900, 4680]
        ),
        Caption("Table 5. Rationale for every panel on the Customer & Geographic Analysis dashboard."),

        H1("8. Interaction & Filter Design"),
        H2("8.1 Global Filters"),
        P("Five filters are pinned to the top of every dashboard and configured as Tableau \u201capply to all sheets using this data source\u201d so a single change updates the entire workbook, not just the current view:"),
        Bullet("Date Range \u2014 relative or custom range over Order Date."),
        Bullet("Region \u2014 multi-select, drives the map and regional bar charts."),
        Bullet("Category \u2014 multi-select, links Dashboards A and B."),
        Bullet("Segment \u2014 multi-select (Consumer / Corporate / Home Office)."),
        Bullet("Discount % \u2014 range slider, isolates specific discount bands for the profitability analysis."),
        H2("8.2 Click-to-Filter Actions"),
        P("Beyond the pinned filters, each dashboard uses Tableau dashboard actions so exploration feels direct rather than menu-driven \u2014 clicking a mark in one chart filters or highlights the related marks in every other chart on the page:"),
        ...Figure(CH + "diag_interaction_flow.png", 6.5, 3.3, "Figure 6. Worked example of a filter action \u2014 clicking the West region on the map cascades to every other panel on the page."),
        Bullet("Region map click \u2192 filters all Dashboard A panels and navigates to Dashboard C pre-filtered to that region."),
        Bullet("Sub-category bar click (Dashboard B) \u2192 filters the discount-band, scatter, and box-plot panels on the same page."),
        Bullet("Customer Pareto point hover (Dashboard C) \u2192 highlights that customer's location on the state map without filtering other panels (hover = highlight, click = filter, to avoid accidental navigation)."),
        Bullet("A persistent \u201cReset Filters\u201d button on every dashboard returns all views to their unfiltered state in one click."),
        H2("8.3 Navigation"),
        P("Top navigation tabs are always visible so a reader can move directly between Dashboard B and Dashboard C without returning to the Overview, in addition to the direct drill-down actions described above."),

        H1("9. Visual Design System"),
        H2("9.1 Color Palette"),
        P("Color is used functionally, not decoratively: blue/orange distinguish the two primary measures (Sales vs. Profit), green/red are reserved exclusively for positive/negative profit so that color always means the same thing anywhere it appears in the workbook, and navy/grey handle chrome (headers, filters, captions) so they never compete with the data."),
        ...Figure(CH + "diag_color_palette.png", 6.3, 2.25, "Figure 7. Dashboard color system and intended use for each color."),
        H2("9.2 Typography & Layout Principles"),
        Bullet("One sans-serif family (Tableau's default Calibri/Segoe-equivalent) throughout; bold weight reserved for panel titles and KPI numbers only."),
        Bullet("KPI numbers sized largest on the page (the executive's eye should land there first), chart titles second, axis/legend text smallest."),
        Bullet("Consistent panel padding and alignment to a grid so charts of different types still read as one coherent screen rather than a collage."),
        Bullet("Every panel gets a short italic caption or subtitle stating the grain or filter state of the data (e.g., \u201csorted, red = loss\u201d, \u201cline-item detail\u201d) so a reader never has to guess what they're looking at."),
        H2("9.3 Accessibility Considerations"),
        Bullet("Red/green loss/profit encoding is paired with position (sorted bar crossing zero) and value labels, not color alone, so the pattern still reads for colorblind users."),
        Bullet("Minimum text size of 8pt for any label that carries data (not just decorative text)."),
        Bullet("High-contrast navy-on-white and white-on-navy text pairings throughout; no grey-on-color text combinations."),

        H1("10. Integration Rationale \u2014 One Coherent Story"),
        P("The three dashboards are designed to function as chapters of a single narrative rather than as independent reports. Dashboard A establishes the headline numbers and flags two things worth investigating \u2014 a sub-category profit problem and a discounting problem \u2014 without yet explaining either. Dashboard B exists purely to answer the \u201cwhy\u201d behind the profit problem the Overview surfaces: it takes the same Sub-Category Profit chart shown on Dashboard A and pairs it with the discount-band and outlier views needed to explain it. Dashboard C answers the parallel \u201cwho and where\u201d question, taking the same regional pattern shown on the Overview's map down to the state and customer level."),
        P("This repetition-with-elaboration pattern \u2014 the same core chart appears simplified on Dashboard A and expanded with supporting detail on B or C \u2014 is intentional: it gives the reader a visual anchor so they always know how the detail view relates back to the summary they started from, rather than arriving at an unfamiliar screen after a click."),
        P("Consistent color encoding, consistent filter placement, and the persistent top navigation reinforce that all three screens are one workbook rather than three unrelated dashboards \u2014 a reader who learns the color and filter conventions on the Overview does not have to relearn them on the deep-dive pages."),

        H1("11. Build Roadmap for Week 3"),
        P("This plan is the blueprint the Week 3 build phase will implement directly in Tableau. Recommended build order:"),
        Bullet("1. Connect to the Superstore data source and build calculated fields first: [Profit Margin], [Discount Band], and the running-total field needed for the Pareto curve."),
        Bullet("2. Build Dashboard A's individual sheets first (KPI tiles, sub-category bars, trend line, region bars, seasonality, map, scatter, segment pie), then assemble the dashboard container and add the global filters."),
        Bullet("3. Build Dashboard B and C sheets, reusing the calculated fields from step 1."),
        Bullet("4. Wire up dashboard actions (filter, highlight, navigate) per the interaction map in Section 8, then add the top navigation tabs and Reset Filters buttons."),
        Bullet("5. Apply the color system and typography rules from Section 9 consistently across all three dashboards as a final pass, then test every click-path in Figure 1 end-to-end."),

        H1("12. Conclusion"),
        P("This blueprint translates the Week 1 exploratory findings into a concrete, three-dashboard Tableau design: an Executive Overview for a 30-second read, a Product & Profitability Deep-Dive for diagnosing the discount and sub-category issues, and a Customer & Geographic Analysis for identifying where and with whom to act. Every panel, color, and interaction is justified against a specific data finding or audience need, giving the Week 3 build phase a clear, fully-reasoned specification to implement rather than a blank canvas."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("./Dashboard_Planning_Design_Strategy.docx", buf);
  console.log("Wrote docx, bytes:", buf.length);
});
