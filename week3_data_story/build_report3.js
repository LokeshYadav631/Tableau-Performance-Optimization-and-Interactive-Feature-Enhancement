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
          children: [new TextRun({ text: "CRAFTING AN INTERACTIVE", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 40, line: 340 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "DATA STORY", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "\u201cBeyond the Top Line\u201d \u2014 A Guided Tableau Narrative on Sample \u2013 Superstore", size: 27, color: ACCENT, italics: true })] }),
        new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Week 3 Task \u2013 Data Analytics Internship Program", size: 24, color: GREY })] }),
        new Paragraph({ spacing: { before: 3200 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "A seven-scene visual narrative plan, with storyboard, narrative arc,", size: 20, color: GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "and interactive-element design, built on the Week 1 EDA and Week 2 dashboard plan.", size: 20, color: GREY })] }),
        new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "This document plans the story; the mock-ups below are storyboard sketches, not the built Tableau Story.", size: 18, color: GREY, italics: true })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ---------------- MAIN BODY ----------------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Sample \u2013 Superstore | Interactive Data Story Plan", size: 16, color: GREY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })] })] }) },
      children: [

        H1("1. Executive Summary"),
        P("Where Week 1 explored the Sample \u2013 Superstore data broadly and Week 2 planned an open-ended, three-dashboard workbook for self-service exploration, this week's task is different in kind: it asks for a single, curated, sequential narrative \u2014 a guided path with a beginning, a turning point, and an ending, built using Tableau's Story Points feature layered on top of the dashboards already designed."),
        P("The story is called \u201cBeyond the Top Line,\u201d and its message is simple: Superstore's sales growth looks like an unqualified success story, but a closer look shows that growth is not translating into proportional profit \u2014 and the reason is a specific, fixable discounting pattern. The plan below sequences seven scenes that walk a senior-leadership audience from the reassuring headline number to the uncomfortable root cause to a concrete, simulate-it-yourself recommendation, then hands off into the free-exploration dashboards from Week 2 for anyone who wants to keep digging."),

        H1("2. Data Story Concept"),
        H2("2.1 Key Message"),
        P("\u201cSuperstore's revenue growth is real, but a discounting pattern above ~30% is quietly erasing the profit that growth should be producing \u2014 fixing it is a targeted, low-risk policy change, not a strategy overhaul.\u201d"),
        H2("2.2 Target Audience"),
        P("The story is written for a senior leadership / executive-sponsor audience (e.g., the VP of Sales persona from Week 2) who will see this once, likely in a meeting or a single unhurried read, and who needs to leave with one clear decision to consider \u2014 not a menu of twelve charts to interpret unaided. This is the key difference from Week 2's dashboards, which were built for repeat, self-directed use by three different personas; this story is built for one persona, one sitting, one takeaway."),
        H2("2.3 Supporting Insights (the evidence chain)"),
        Bullet("Sales grew at a ~15.1% compound annual rate over four years \u2014 the growth story is genuine, not a setup to be debunked."),
        Bullet("Profit grew more slowly than sales across the same period, so the margin is quietly thinning even as the top line looks healthy."),
        Bullet("Two sub-categories \u2014 Machines and Tables \u2014 operate at a net loss despite meaningful sales volume."),
        Bullet("The line-item correlation between discount rate and profit margin is -0.66; margins flip from solidly positive to negative right around the 30% discount mark."),
        Bullet("The effect is not evenly spread: Central and South regions run thinner margins than West and East, consistent with heavier regional discounting."),
        Bullet("On the positive side, the top 20% of customers already generate about 40% of revenue \u2014 a concentrated, protectable base to build the recommendation around."),
        H2("2.4 Why a Story (and Not Just a Dashboard)"),
        P("The Week 2 dashboards are optimized for exploration: a reader can ask their own question and find their own answer. A story is optimized for the opposite case \u2014 making sure a reader who asks no questions at all still leaves with the right one. Because the discount finding is counter-intuitive (discounting is usually assumed to drive volume and, therefore, be good for business), it needs to be walked to deliberately rather than left for a reader to stumble onto amid a dashboard of eight other panels."),

        H1("3. Narrative Arc & Structure"),
        P("The seven scenes follow a classic tension-and-resolution arc: a reassuring hook, a rising complication, a climax at the root-cause insight, then a controlled resolution into regional consequence, a positive counterpoint, and a concrete call to action."),
        ...Figure(CH + "narrative_arc.png", 6.6, 3.1, "Figure 1. Narrative arc \u2014 engagement and tension rise to a climax at Scene 4 (the discount-threshold insight), then resolve toward a concrete recommendation."),
        P("Placing the climax at Scene 4 of 7 (rather than at the very end) is a deliberate choice: it leaves three full scenes afterward to convert the insight into consequence, opportunity, and action, rather than ending the story on the complication itself."),

        H1("4. Visual Narrative Plan \u2014 Scene by Scene"),
        P("The storyboard below sequences the seven scenes as they will appear in the Tableau Story. Each thumbnail shows the chart type planned for that scene and the headline it supports; the detailed table that follows explains the narrative role, the visualization, and the on-screen caption for each."),
        ...Figure(CH + "storyboard_strip.png", 6.6, 2.0, "Figure 2. Storyboard \u2014 seven-scene sequence with headline and chart type for each story point."),
        dataTable(
          ["#", "Scene / Narrative Role", "Visualization", "Caption Shown to Reader"],
          [
            ["1", "The Hook \u2014 open on the reassuring number", "Monthly sales trend line (upward)", "\u201cSales have grown ~15% a year, every year, since 2015.\u201d"],
            ["2", "The Gap \u2014 introduce the tension", "Dual-axis sales vs. profit trend", "\u201cBut profit hasn't kept pace \u2014 the gap between the two lines is widening.\u201d"],
            ["3", "The Complication \u2014 name the problem", "Sub-category profit bar (sorted, red/green)", "\u201cTwo sub-categories, Machines and Tables, are actually losing money.\u201d"],
            ["4", "The Insight / Climax \u2014 explain why", "Discount vs. profit scatter + discount-band bars", "\u201cThe pattern is discounting: margins turn negative once discount passes ~30%.\u201d"],
            ["5", "The Consequence \u2014 show where it lands", "Region map, colored by margin", "\u201cThe effect isn't even \u2014 Central and South carry the thinnest margins.\u201d"],
            ["6", "The Turn \u2014 a reason for optimism", "Customer Pareto curve", "\u201cThe base to protect is concentrated: 20% of customers already drive ~40% of sales.\u201d"],
            ["7", "The Resolution / Ask \u2014 make it actionable", "Recommendation summary + what-if parameter", "\u201cCap discounts near 30%, protect the top accounts, and fix two sub-categories. Try it yourself \u2192\u201d"],
          ],
          [420, 2760, 2900, 2900]
        ),
        Caption("Table 1. Scene-by-scene visual narrative plan."),
        P("Each scene reuses a chart already validated in the Week 1 EDA (and, for Scenes 1, 3, and 5, a panel already designed in the Week 2 dashboards) \u2014 the story doesn't introduce new analysis, it resequences existing, trustworthy visuals into a deliberate order with a point of view."),

        H1("5. Interactive Elements"),
        P("A Tableau Story is not a slideshow: every scene remains a live, interactive Tableau worksheet. The interactivity map below shows which interactive mechanism is active on which scene, and why."),
        ...Figure(CH + "interactivity_map.png", 6.6, 3.0, "Figure 3. Interactivity map \u2014 which interactive element is active in each of the seven scenes."),
        H2("5.1 Story-Point Navigation"),
        P("A navigator bar (previous / next plus clickable scene markers) runs beneath every scene, letting a reader move at their own pace, replay a scene, or jump directly back to Scene 4 to re-examine the core insight after seeing its regional consequence in Scene 5 \u2014 supporting non-linear re-reading without breaking the intended default order."),
        H2("5.2 Annotated Callouts"),
        P("Each scene carries one auto-appearing annotation that points directly at the mark the scene is about (e.g., an arrow and label on the ~30% discount point in Scene 4) so the reader's attention lands on the intended detail immediately rather than having to search a busy chart for it."),
        H2("5.3 Hover Tooltips"),
        P("Standard Tableau tooltips remain active on Scenes 1\u20136, surfacing exact figures (e.g., the precise margin at a given discount band) for a reader who wants to verify a number without derailing the main narrative flow."),
        H2("5.4 Click-to-Highlight"),
        P("On Scenes 3, 5, and 6, clicking a mark (a sub-category, a state, a point on the Pareto curve) highlights that selection using the same color across the scene's own supporting chart, previewing the cross-filtering behavior the reader will get in full once they reach the Week 2 dashboards."),
        H2("5.5 What-If Parameter \u2014 the \u201cDiscount Cap\u201d Slider"),
        P("The single most important interactive element in the story lives in Scene 4: a parameter-driven slider lets the reader set a hypothetical discount cap (0\u201380%) and watch a calculated field re-color the discount-band bars and re-estimate total profit in real time. This turns the story's central claim from an assertion into something the reader proves to themselves."),
        ...Figure(CH + "whatif_parameter_mock.png", 6.4, 2.85, "Figure 4. What-if parameter mock-up \u2014 dragging the Discount Cap slider from 80% to 30% grey out the loss-making bands and updates the simulated profit total."),
        P("Implementation note: this requires one Tableau parameter ([Discount Cap]) and one calculated field (an IF/THEN that zeroes out or excludes line items with Discount > [Discount Cap] from the profit calculation), both reused from the Week 2 calculated-field plan."),
        H2("5.6 Drill-Through to the Week 2 Dashboards"),
        P("Scene 7 ends with an explicit \u201cExplore the full data \u2192\u201d button that drills through into the Week 2 Executive Overview dashboard, with all filters cleared \u2014 the formal handoff from a guided, opinionated narrative to open, self-directed exploration for any reader who wants to go further."),

        H1("6. How Interactivity Supports the Narrative"),
        P("Every interactive element above is tied to a specific narrative need rather than added for novelty:"),
        Bullet("Navigation supports pacing \u2014 a senior audience can move quickly through the familiar hook and slow down at the unfamiliar insight."),
        Bullet("Annotations remove ambiguity \u2014 in a single-viewing context there is no time for a reader to hunt for the point of a chart."),
        Bullet("Tooltips serve the skeptical reader \u2014 anyone who wants to check a number can, without a separate report."),
        Bullet("Click-to-highlight previews the payoff \u2014 it signals that richer exploration exists, priming the reader for the Scene 7 handoff."),
        Bullet("The what-if parameter converts belief into proof \u2014 the central recommendation is something the reader tests themselves rather than takes on faith, which is the single strongest lever for making a counter-intuitive finding land."),
        Bullet("The drill-through closes the loop \u2014 the story never dead-ends; it always has somewhere further to go for a reader who wants it."),

        H1("7. From Story to Exploration \u2014 the Handoff Design"),
        P("This narrative is designed to sit on top of, not replace, the Week 2 dashboard plan. The relationship between the two artifacts is intentionally simple: the story is the front door and the recommended path through the data; the three dashboards are the rooms a reader can wander into afterward. Concretely, Scene 1's trend chart is a simplified version of the Executive Overview's trend panel; Scene 4's discount analysis is a simplified version of the Product & Profitability Deep-Dive; Scene 5's map is a simplified version of the Customer & Geographic Analysis map \u2014 so a reader who drills through in Scene 7 always lands on a dashboard view they've already been visually introduced to."),

        H1("8. Build Roadmap for Week 4"),
        P("This plan is the shot list the Week 4 build phase will implement directly in Tableau Story Points. Recommended build order:"),
        Bullet("1. Build the [Discount Cap] parameter and its supporting calculated field first, since Scene 4 depends on it and it can be tested independently."),
        Bullet("2. Build each scene as its own worksheet/dashboard, reusing sheets from the Week 2 workbook wherever a scene simplifies an existing panel (Scenes 1, 3, 4, 5, 6)."),
        Bullet("3. Assemble the seven worksheets into a Tableau Story, in the order fixed in Table 1."),
        Bullet("4. Add the per-scene annotations and captions from Table 1 as text callouts on each story point."),
        Bullet("5. Wire the Scene 7 drill-through action to the Week 2 Executive Overview dashboard with filters cleared, and test the full seven-scene path end-to-end with someone unfamiliar with the analysis to confirm the story lands without narration."),

        H1("9. Conclusion"),
        P("This plan turns the Week 1 findings and Week 2 dashboard architecture into a single, deliberate seven-scene narrative built for a one-time, high-stakes read rather than repeat exploration. By sequencing familiar growth metrics into an unfamiliar profit story, anchoring the climax on a provable discount threshold, and letting the reader test that threshold themselves with a what-if parameter, the story is designed to leave a senior audience with one clear, self-verified recommendation \u2014 and a direct path into the full dashboards from Week 2 for anyone who wants to keep exploring."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("./Interactive_Data_Story_Plan.docx", buf);
  console.log("Wrote docx, bytes:", buf.length);
});
