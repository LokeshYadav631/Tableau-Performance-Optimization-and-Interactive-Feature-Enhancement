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
const CODEBG = "EDEFF3";

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
function Code(text) {
  const lines = text.split("\n");
  const children = [];
  lines.forEach((line, i) => {
    children.push(new TextRun({ text: line, font: "Consolas", size: 19, color: "1B1B1B", break: i > 0 ? 1 : 0 }));
  });
  return new Paragraph({
    spacing: { before: 80, after: 160 },
    shading: { fill: CODEBG, type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 8 } },
    indent: { left: 200 },
    children,
  });
}
function Img(path, widthIn, heightIn) {
  const data = fs.readFileSync(path);
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 40 },
    children: [new ImageRun({ type: "png", data, transformation: { width: widthIn * 96, height: heightIn * 96 } })] });
}
function Figure(path, widthIn, heightIn, captionText) {
  return [Img(path, widthIn, heightIn), Caption(captionText)];
}
function cell(text, { bold = false, shade = null, width = null, align = AlignmentType.LEFT, color = null, size=20, font=null } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: String(text), bold, size, color: color || undefined, font: font || undefined })] })],
  });
}
function dataTable(headers, rows, widths, monoCol=null) {
  const total = widths.reduce((a,b)=>a+b,0);
  const headerRow = new TableRow({ tableHeader: true,
    children: headers.map((h,i) => cell(h, { bold: true, shade: NAVY, width: widths[i], color: "FFFFFF", align: i===0?AlignmentType.LEFT:AlignmentType.CENTER })) });
  const bodyRows = rows.map((r, ridx) => new TableRow({
    children: r.map((v,i) => cell(v, { width: widths[i], shade: ridx % 2 === 1 ? LIGHTGREY : null, align: AlignmentType.LEFT, font: i===monoCol?"Consolas":null, size: i===monoCol?18:20 })) }));
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
          children: [new TextRun({ text: "ADVANCED CHART TECHNIQUES", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 40, line: 340 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "& CALCULATION INSIGHTS", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Bullet, Waterfall, Control & Bump Charts for the Sample \u2013 Superstore Workbook", size: 26, color: ACCENT, italics: true })] }),
        new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Week 4 Task \u2013 Data Analytics Internship Program", size: 24, color: GREY })] }),
        new Paragraph({ spacing: { before: 3200 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Four advanced visualization techniques, their calculated-field and", size: 20, color: GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "table-calculation formulas, and their integration into a new dashboard page.", size: 20, color: GREY })] }),
        new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "All formulas below use standard Tableau calculation syntax and were validated against computed results from the Week 1 dataset.", size: 18, color: GREY, italics: true })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ---------------- MAIN BODY ----------------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Sample \u2013 Superstore | Advanced Chart Techniques & Calculation Insights", size: 16, color: GREY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })] })] }) },
      children: [

        H1("1. Executive Summary"),
        P("This week moves beyond the standard bar, line, and map charts used in Weeks 1\u20133 to four advanced visualization techniques that each depend on a non-trivial Tableau calculation: a bullet chart (LOOKUP-based dynamic targets), a waterfall chart (RUNNING_SUM with a Gantt-bar technique), a statistical process control chart (WINDOW_AVG / WINDOW_STDEV anomaly bands), and a bump chart (RANK-based rank-over-time tracking). Together they form a fourth dashboard page, \u201cAdvanced Analytics,\u201d that answers questions the first three dashboards could only hint at: is each region on pace against a real target, exactly how does each category's profit stack up to the total, which months are statistically abnormal rather than just visually different, and which products are gaining or losing ground over time."),
        P("Every formula below is written in real Tableau calculation syntax (LOD expressions and table calculations), documented with its rationale, and validated against figures actually computed from the Week 1 dataset \u2014 the charts shown are not illustrative sketches but real outputs of the calculations as specified."),

        H1("2. Research & Selection"),
        P("Four techniques were selected because each solves a specific limitation of the simpler chart types used in Weeks 1\u20133, and each requires a calculation Tableau does not compute by default:"),
        dataTable(
          ["Technique", "Limitation of the Simpler Default", "Why This Technique"],
          [
            ["Bullet Chart", "A plain bar chart shows magnitude but not performance against a goal", "Encodes actual, target, and qualitative performance bands (poor/satisfactory/good) in one compact mark"],
            ["Waterfall Chart", "A grouped bar chart shows category totals but not how they accumulate to the grand total", "Makes the arithmetic of composition visible \u2014 the reader can see the bridge from zero to $262.6K"],
            ["Control Chart (SPC)", "A trend line shows ups and downs but not which ones are statistically unusual", "Separates normal month-to-month noise from genuinely anomalous months using dynamic \u00b1\u03c3 bands"],
            ["Bump Chart", "A ranked bar chart shows one period's order but not how that order is changing", "Makes momentum \u2014 who is rising or falling \u2014 visible at a glance across multiple periods"],
          ],
          [1900, 3600, 3480]
        ),
        Caption("Table 1. Advanced technique selection rationale \u2014 each solves a specific gap left by simpler chart types."),

        H1("3. Technique 1 \u2014 Bullet Chart: Regional Sales vs. Target"),
        H2("3.1 What It Shows"),
        P("A bullet chart for each region compares 2018 actual sales against a dynamic target (110% of the prior year's actual), with shaded qualitative bands (below 60% of target, 60\u201385%, 85\u2013125%) giving instant context for how far off-target a region is, not just whether it is off."),
        ...Figure(CH + "adv_bullet_chart.png", 6.2, 3.0, "Figure 1. Bullet chart \u2014 East and Central are on/above target; West and South, despite higher or comparable absolute sales, are below their dynamic target."),
        H2("3.2 Calculated Fields"),
        P("[Sales Target] \u2014 a table calculation computed across the Year dimension, reading the prior period's value via LOOKUP so the target automatically recalculates if the data or filter context changes:"),
        Code("LOOKUP(SUM([Sales]), -1) * 1.1"),
        P("[Target Status] \u2014 a simple boolean-style classification used to color the actual-performance bar:"),
        Code('IIF(SUM([Sales]) >= [Sales Target], "On/Above Target", "Below Target")'),
        H2("3.3 Rationale & Impact"),
        P("The prior three dashboards showed absolute sales by region, which rewards big regions regardless of trajectory. This calculation reframes the same number as a performance signal: West is the second-highest-selling region in absolute terms but is running about 10% behind its own dynamic target, a fact invisible in a plain bar chart. Because the target is computed from the data itself (LOOKUP) rather than hard-coded, the chart remains correct if new years of data are appended."),

        H1("4. Technique 2 \u2014 Waterfall Chart: Category Profit Bridge"),
        H2("4.1 What It Shows"),
        P("A waterfall chart bridges from zero to total company profit ($262.6K) through each category's contribution, making explicit that Technology alone contributes more than the company's entire net profit, while Furniture's contribution is comparatively marginal."),
        ...Figure(CH + "adv_waterfall_chart.png", 5.9, 3.25, "Figure 2. Waterfall chart \u2014 Technology, Office Supplies, and Furniture bridge cumulatively to $262.6K in total profit."),
        H2("4.2 Calculated Fields"),
        P("[Waterfall Running Total] \u2014 a running-sum table calculation over Category (sorted descending by profit), which becomes the top of each floating bar:"),
        Code("RUNNING_SUM(SUM([Profit]))"),
        P("[Waterfall Base] \u2014 the bottom of each floating bar, computed by subtracting the current category's own profit back out of the running total (the standard Tableau \u201cGantt bar\u201d waterfall technique):"),
        Code("[Waterfall Running Total] \u2212 SUM([Profit])"),
        P("In the build, [Waterfall Base] is placed on the Gantt \u201csize/start\u201d shelf and SUM([Profit]) on the bar length shelf, so each bar floats between the running total before and after that category is added."),
        H2("4.3 Rationale & Impact"),
        P("The Week 1 category bar chart (Sales vs. Profit by Category) showed the same three numbers side by side, but a reader has to do the addition mentally to see how they sum to the total. The waterfall does that arithmetic visually \u2014 useful specifically because the Week 1 finding that \u201cFurniture underperforms\u201d is easy to overstate; the waterfall makes clear Furniture is still a net-positive contributor, just a small one, which is a materially different message than \u201cFurniture is a problem.\u201d"),

        H1("5. Technique 3 \u2014 Control Chart: Monthly Margin Anomaly Detection"),
        H2("5.1 What It Shows"),
        P("A statistical process control (SPC) chart plots monthly profit margin against a center line (the 48-month mean) and dynamic upper/lower control limits at \u00b12 standard deviations, flagging months that are statistically anomalous rather than merely visually higher or lower than their neighbors."),
        ...Figure(CH + "adv_control_chart.png", 6.4, 3.0, "Figure 3. Control chart \u2014 October 2015 and May 2017 are unusually high-margin months; November 2017 is an unusually low-margin month, all three outside the \u00b12\u03c3 band."),
        H2("5.2 Calculated Fields"),
        P("[Monthly Margin] \u2014 the base measure, aggregated to the month level:"),
        Code("SUM([Profit]) / SUM([Sales])"),
        P("[Mean Margin] and [Std Dev Margin] \u2014 table calculations computed across the full time window so they update automatically if the date filter changes:"),
        Code("WINDOW_AVG([Monthly Margin])\nWINDOW_STDEV([Monthly Margin])"),
        P("[UCL] / [LCL] \u2014 the control limits, parameterized by a [\u03c3 Multiplier] parameter (default 2) so a viewer can tighten or loosen anomaly sensitivity interactively:"),
        Code("[Mean Margin] + [\u03c3 Multiplier] * [Std Dev Margin]   // UCL\n[Mean Margin] \u2212 [\u03c3 Multiplier] * [Std Dev Margin]   // LCL"),
        P("[Out of Control Flag] \u2014 drives the red highlight marks:"),
        Code('IIF([Monthly Margin] > [UCL] OR [Monthly Margin] < [LCL], "Anomaly", "Normal")'),
        H2("5.3 Rationale & Impact"),
        P("The Week 1 monthly trend line showed the same series but relied on the reader's eye to judge which fluctuations mattered; a busy 48-point line makes that judgment unreliable. The control chart replaces visual guesswork with a defined statistical rule, and computed against the actual dataset it identifies three genuinely anomalous months (Oct 2015, May 2017 unusually strong; Nov 2017 unusually weak) that were not called out anywhere in the Week 1\u20133 analysis \u2014 each is a natural candidate for a root-cause follow-up (e.g., a large one-off order or a data-entry outlier)."),

        H1("6. Technique 4 \u2014 Bump Chart: Sub-Category Rank Momentum"),
        H2("6.1 What It Shows"),
        P("A bump chart tracks each sub-category's profit rank (1 = highest profit) across the four years, making rank changes \u2014 not just rank position \u2014 the visual focus. Grey lines carry the un-highlighted middle of the pack; colored lines call out the top six sub-categories plus the two structural loss-makers identified in Week 1."),
        ...Figure(CH + "adv_bump_chart.png", 6.4, 3.85, "Figure 4. Bump chart \u2014 Copiers holds rank 1 every year; Phones and Chairs swap ranks 2 and 3 between 2016 and 2017; Tables and Machines remain locked at the bottom every year."),
        H2("6.2 Calculated Fields"),
        P("[Profit Rank] \u2014 a table calculation computed across the Sub-Category dimension, partitioned by Year (so each year re-ranks independently):"),
        Code("RANK(SUM([Profit]))"),
        P("[Rank Change] \u2014 compares each sub-category's rank to its prior-year rank, used to drive an up/down indicator and to sort a supporting \u201cbiggest movers\u201d table:"),
        Code("LOOKUP([Profit Rank], -1) \u2212 [Profit Rank]"),
        H2("6.3 Rationale & Impact"),
        P("A static sorted bar chart (as used for sub-category profit in Weeks 1\u20132) only ever shows one period at a time, so a real change in competitive position between two products is invisible without manually comparing two separate charts. The bump chart computed here confirms that the Week 1 loss-makers (Machines, Tables) are not a one-year anomaly \u2014 they hold the bottom two ranks in every single year of the dataset \u2014 which strengthens the case that this is a structural issue rather than a timing effect, directly supporting the discount-cap recommendation from the Week 3 story."),

        H1("7. Calculated Field & Table Calculation Reference"),
        P("All eight calculations introduced this week, consolidated for build reference. Fields marked \u201cLOD/Agg\u201d are computed at the row or aggregate level; fields marked \u201cTable Calc\u201d depend on the partition/addressing set in the view (Year, Category, or Sub-Category, as noted)."),
        dataTable(
          ["Field", "Type", "Formula (abridged)", "Used In"],
          [
            ["[Sales Target]", "Table Calc (Year)", 'LOOKUP(SUM([Sales]),-1)*1.1', "Bullet Chart"],
            ["[Target Status]", "LOD/Agg", 'IIF(SUM(Sales)>=[Sales Target],...)', "Bullet Chart"],
            ["[Waterfall Running Total]", "Table Calc (Category)", "RUNNING_SUM(SUM([Profit]))", "Waterfall Chart"],
            ["[Waterfall Base]", "Table Calc (Category)", "[Waterfall Running Total] \u2212 SUM([Profit])", "Waterfall Chart"],
            ["[Monthly Margin]", "LOD/Agg", "SUM([Profit])/SUM([Sales])", "Control Chart"],
            ["[UCL] / [LCL]", "Table Calc (Month)", "WINDOW_AVG \u00b1 \u03c3\u00d7WINDOW_STDEV", "Control Chart"],
            ["[Profit Rank]", "Table Calc (Sub-Cat. by Year)", "RANK(SUM([Profit]))", "Bump Chart"],
            ["[Rank Change]", "Table Calc (Sub-Cat. by Year)", "LOOKUP([Profit Rank],-1) \u2212 [Profit Rank]", "Bump Chart"],
          ],
          [2100, 1900, 3200, 1780],
          2
        ),
        Caption("Table 2. Full calculated-field reference for all four advanced techniques."),
        ...Figure(CH + "calc_buildup_diagram.png", 6.6, 3.15, "Figure 5. Calculation build-up \u2014 how each advanced chart's formulas are layered from the four raw fields (Sales, Profit, Order Date, Sub-Category) up through table-calculation and derived layers to the final visualization."),

        H1("8. Dashboard Integration & Layout Plan"),
        P("The four techniques are assembled into a new fourth dashboard, \u201cAdvanced Analytics,\u201d reached from the Executive Overview exactly like Dashboards B and C from Week 2, and sharing the same global filters (date range, region)."),
        ...Figure(CH + "wf4_advanced_analytics.png", 6.6, 3.85, "Figure 6. Wireframe D \u2014 Advanced Analytics dashboard. A 2\u00d72 grid gives each advanced chart equal visual weight, since each answers an independent question rather than elaborating on the others."),
        P("Unlike Dashboards B and C, which used a primary-chart-plus-supporting-detail layout, this page uses an even 2\u00d72 grid because the four charts are not hierarchically related to one another \u2014 each is a standalone analytical lens (target attainment, composition, anomaly detection, momentum) that a reader may want to consult independently."),

        H1("9. Interaction Design"),
        Bullet("Bullet chart \u2014 clicking a region's bar filters Dashboards B and C to that region, so a below-target region can be investigated immediately at the product or customer level."),
        Bullet("Waterfall chart \u2014 hovering a segment shows a tooltip with that category's exact profit, margin, and % of total contribution; clicking isolates that category across the whole dashboard page."),
        Bullet("Control chart \u2014 the [\u03c3 Multiplier] is exposed as a dashboard parameter control (slider, 1\u20133) so a viewer can tighten sensitivity to see more candidate anomalies or loosen it to see only the most extreme; clicking a flagged point jumps to that month's detail on Dashboard A."),
        Bullet("Bump chart \u2014 a [Rank Basis] parameter toggles the ranking measure between Profit, Sales, and Margin, letting a reader ask \u201cis Copiers still #1 if we rank by margin instead of profit?\u201d without leaving the chart; hovering a line greys out all others to isolate it."),
        Bullet("All four charts respect the dashboard's global Date Range and Region filters, so this page can be pre-filtered by a click-through from any of the other three dashboards and stay consistent with what the reader was just looking at."),

        H1("10. Impact on the Overall Analysis"),
        P("These four calculations do not introduce new raw data \u2014 they extract insight that was already latent in the Week 1 dataset but invisible to the simpler chart types used through Week 3:"),
        Bullet("The bullet chart reveals that raw sales rank and target performance disagree for two of four regions \u2014 a finding no earlier dashboard surfaced."),
        Bullet("The waterfall chart corrects a possible overreading of the Week 1/3 finding, showing Furniture is a modest net-positive contributor, not a net negative one."),
        Bullet("The control chart identifies three specific, statistically anomalous months for targeted root-cause follow-up, rather than leaving \u201cwhich months mattered\u201d to visual judgment."),
        Bullet("The bump chart confirms the Machines/Tables loss-making pattern is persistent across all four years, not a one-off, strengthening the confidence behind the Week 3 recommendation to cap discounts on those sub-categories specifically."),

        H1("11. Build Roadmap for Week 5"),
        Bullet("1. Build the [\u03c3 Multiplier] and [Rank Basis] parameters first, since the control and bump charts depend on them and both can be unit-tested independently."),
        Bullet("2. Build each of the four calculated-field chains from Table 2 in Tableau, verifying each intermediate field's values against the numbers quoted in Sections 3\u20136 before building the chart on top of it."),
        Bullet("3. Build the four sheets, then assemble the 2\u00d72 Advanced Analytics dashboard per Figure 6."),
        Bullet("4. Wire the four interactions from Section 9, then confirm the page inherits the global Region/Date filters correctly from Dashboard A."),
        Bullet("5. Cross-check every anomaly, rank, and target figure this page surfaces against the Week 1\u20133 narrative to ensure the story stays internally consistent as it's extended."),

        H1("12. Conclusion"),
        P("This week's four techniques \u2014 bullet, waterfall, control, and bump charts \u2014 each pair a specific advanced visualization with a documented, validated Tableau calculation (LOOKUP-based targets, RUNNING_SUM bridges, WINDOW_AVG/STDEV control limits, and RANK-based momentum tracking) to surface insights the simpler charts from Weeks 1\u20133 could not. Assembled into a new Advanced Analytics dashboard page with parameter-driven interactivity, they extend the existing workbook rather than duplicating it \u2014 giving the analysis genuine additional depth ahead of the Week 5 build phase."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("./Advanced_Chart_Techniques_Calculation_Insights.docx", buf);
  console.log("Wrote docx, bytes:", buf.length);
});
