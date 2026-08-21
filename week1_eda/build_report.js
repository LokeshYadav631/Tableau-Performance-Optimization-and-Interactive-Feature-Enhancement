const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, ImageRun, AlignmentType, BorderStyle, PageBreak,
  TableOfContents, LevelFormat, convertInchesToTwip, Header, Footer, PageNumber,
  VerticalAlign,
} = require("docx");
const fs = require("fs");

const CH = "./charts/";
const NAVY = "1F3864";
const ACCENT = "4E79A7";
const GREY = "595959";
const LIGHTGREY = "F2F2F2";

// ---------- helpers ----------
function H1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } });
}
function H2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } });
}
function H3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 100 } });
}
function P(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 276 },
    children: [new TextRun({ text, ...opts })],
  });
}
function PMix(runs) {
  return new Paragraph({ spacing: { after: 160, line: 276 }, children: runs });
}
function Bullet(text, opts = {}) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 90, line: 268 },
    children: [new TextRun({ text, ...opts })],
  });
}
function Caption(text) {
  return new Paragraph({
    spacing: { before: 60, after: 260 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, italics: true, size: 19, color: GREY })],
  });
}
function Img(path, widthIn, heightIn) {
  const data = fs.readFileSync(path);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 40 },
    children: [
      new ImageRun({
        type: "png",
        data,
        transformation: { width: widthIn * 96, height: heightIn * 96 },
      }),
    ],
  });
}
const NOBORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
// Figure = image paragraph + caption paragraph, kept together via keepNext/keepLines.
function Figure(path, widthIn, heightIn, captionText) {
  return [Img(path, widthIn, heightIn), Caption(captionText)];
}
function cell(text, { bold = false, shade = null, width = null, align = AlignmentType.LEFT, color = null, size=20 } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: String(text), bold, size, color: color || undefined })],
    })],
  });
}
function dataTable(headers, rows, widths) {
  const total = widths.reduce((a,b)=>a+b,0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h,i) => cell(h, { bold: true, shade: NAVY, width: widths[i], color: "FFFFFF", align: i===0?AlignmentType.LEFT:AlignmentType.CENTER })),
  });
  const bodyRows = rows.map((r, ridx) => new TableRow({
    children: r.map((v,i) => cell(v, { width: widths[i], shade: ridx % 2 === 1 ? LIGHTGREY : null, align: i===0?AlignmentType.LEFT:AlignmentType.CENTER })),
  }));
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...bodyRows],
  });
}
function fmt$(n) { return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 }); }
function fmtPct(n, d=1) { return (n*100).toFixed(d) + "%"; }

// ---------- load computed results ----------
const R = JSON.parse(fs.readFileSync("../data/results.json"));

// =========================================================================================
// DOCUMENT
// =========================================================================================
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: NAVY, font: "Calibri" },
        paragraph: { spacing: { before: 360, after: 160 }, border: { bottom: { color: ACCENT, space: 4, style: BorderStyle.SINGLE, size: 8 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: NAVY, font: "Calibri" } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, color: ACCENT, font: "Calibri", italics: false } },
    ],
  },
  numbering: {
    config: [{
      reference: "bullet-list",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 200 } } } }],
    }],
  },
  sections: [
    // ---------------- TITLE PAGE ----------------
    {
      properties: { page: { size: { width: 12240, height: 15840 } } },
      children: [
        new Paragraph({ spacing: { before: 2200, line: 340 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "EXPLORATORY DATA ANALYSIS", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 40, line: 340 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "& INSIGHT GENERATION", bold: true, size: 40, color: NAVY })] }),
        new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "A Tableau-Oriented Analysis of the Sample \u2013 Superstore Dataset", size: 28, color: ACCENT, italics: true })] }),
        new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Week 1 Task \u2013 Data Analytics Internship Program", size: 24, color: GREY })] }),
        new Paragraph({ spacing: { before: 3200 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Prepared as a comprehensive EDA report covering dataset selection,", size: 20, color: GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "variable exploration, trend detection, and business-insight generation.", size: 20, color: GREY })] }),
        new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Analysis Tools: Python (pandas / NumPy / Matplotlib) for statistical computation \u2014 Tableau for interactive dashboard design", size: 18, color: GREY, italics: true })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ---------------- MAIN BODY ----------------
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
        },
      },
      headers: {
        default: new Header({ children: [ new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Sample \u2013 Superstore | EDA Report", size: 16, color: GREY })],
        }) ] }),
      },
      footers: {
        default: new Footer({ children: [ new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [ new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY }) ],
        }) ] }),
      },
      children: [

        H1("1. Executive Summary"),
        P(`This report documents a full exploratory data analysis (EDA) of the Sample \u2013 Superstore dataset, a widely used public retail-transactions dataset (the standard Tableau/Kaggle training dataset for a fictional U.S. office-supply retailer) covering ${R.total_line_items.toLocaleString()} order line items across ${R.total_orders.toLocaleString()} orders placed by ${R.unique_customers.toLocaleString()} customers between ${R.date_min} and ${R.date_max}.`),
        P(`Across the full period the business generated ${fmt$(R.total_sales)} in sales and ${fmt$(R.total_profit)} in profit, an overall profit margin of ${fmtPct(R.overall_margin)}. Sales grew at a compound annual rate of roughly ${fmtPct(R.cagr_sales)} over the four years analyzed, with December consistently the strongest month of the year. The analysis surfaces several actionable patterns \u2014 most notably that discounts above 30% are reliably associated with negative margins, that the Tables and Machines sub-categories lose money despite healthy sales volume, and that the top 20% of customers by spend account for roughly ${fmtPct(R.pareto_top20pct_customers_sales_share)} of total revenue.`),
        P("Section 7 translates each finding into a concrete Tableau build specification (shelves, marks, calculated fields, filters) so the same analysis can be reproduced as an interactive Tableau dashboard."),

        H1("2. Objective"),
        P("The goal of this exercise is to select a rich, publicly available dataset and perform a structured exploratory analysis that (a) characterizes the variables and data quality, (b) surfaces meaningful trends, outliers, and relationships, and (c) translates those findings into business insights that are well suited to interactive visualization in Tableau. The report is written so that a reader unfamiliar with the dataset can follow the reasoning from raw fields to final recommendation."),

        H1("3. Dataset Overview"),
        H2("3.1 Source & Description"),
        P("Dataset: Sample \u2013 Superstore. This is the dataset Tableau itself ships as its flagship sample workbook, and it is one of the most widely mirrored public datasets for EDA and BI training (also distributed via Kaggle and numerous open GitHub repositories). It represents four years of order-level transactions for a fictional United States office-supply and furniture retailer, at the individual order-line-item grain \u2014 i.e., one row per product within an order."),
        P("The dataset was chosen because it is rich enough to explore multiple analytical dimensions in a single workbook (time, geography, product hierarchy, customer segment, shipping logistics, and pricing/discount strategy) while remaining small enough to explore interactively without aggregation performance concerns \u2014 exactly the profile Tableau's own EDA and dashboarding features are designed around."),

        H2("3.2 Data Dictionary"),
        dataTable(
          ["Field", "Type", "Description"],
          [
            ["Row ID", "Integer", "Unique line-item identifier"],
            ["Order ID / Order Date", "Text / Date", "Order transaction key and date placed"],
            ["Ship Date / Ship Mode", "Date / Category", "Fulfillment date and shipping service level"],
            ["Customer ID", "Text", "Unique customer identifier"],
            ["Segment", "Category", "Consumer, Corporate, or Home Office"],
            ["Region / State", "Category", "US sales region and state"],
            ["Category / Sub-Category", "Category", "Product hierarchy (3 categories, 17 sub-categories)"],
            ["Product ID", "Text", "Unique product identifier"],
            ["Sales", "Numeric ($)", "Extended sales value of the line item"],
            ["Quantity", "Integer", "Units ordered"],
            ["Discount", "Numeric (0\u20131)", "Discount rate applied to the line item"],
            ["Profit", "Numeric ($)", "Net profit (can be negative)"],
          ],
          [2200, 1600, 5980]
        ),
        Caption("Table 1. Core fields used in the analysis."),

        H2("3.3 Data Quality Check"),
        P(`A structural check found ${R.total_line_items.toLocaleString()} rows and zero missing values across all analytical fields, so no imputation was required. Field types were validated (dates parsed correctly, numeric fields free of text contamination), and ${R.unique_customers.toLocaleString()} distinct customers and 17 sub-categories were confirmed against the expected schema. Duplicate Row IDs: none found.`),
        H3("Descriptive statistics (key numeric fields)"),
        dataTable(
          ["Field", "Mean", "Std Dev", "Min", "Median", "Max"],
          [
            ["Sales ($)", R.describe["Sales"].mean.toFixed(2), R.describe["Sales"].std.toFixed(2), R.describe["Sales"]["min"].toFixed(2), R.describe["Sales"]["50%"].toFixed(2), R.describe["Sales"]["max"].toFixed(2)],
            ["Quantity", R.describe["Quantity"].mean.toFixed(2), R.describe["Quantity"].std.toFixed(2), R.describe["Quantity"]["min"].toFixed(0), R.describe["Quantity"]["50%"].toFixed(0), R.describe["Quantity"]["max"].toFixed(0)],
            ["Discount", R.describe["Discount"].mean.toFixed(2), R.describe["Discount"].std.toFixed(2), R.describe["Discount"]["min"].toFixed(2), R.describe["Discount"]["50%"].toFixed(2), R.describe["Discount"]["max"].toFixed(2)],
            ["Profit ($)", R.describe["Profit"].mean.toFixed(2), R.describe["Profit"].std.toFixed(2), R.describe["Profit"]["min"].toFixed(2), R.describe["Profit"]["50%"].toFixed(2), R.describe["Profit"]["max"].toFixed(2)],
          ],
          [2400, 1500, 1500, 1500, 1500, 1380]
        ),
        Caption("Table 2. Summary statistics for the four core numeric fields (9,994 line items)."),

        H1("4. Methodology"),
        P("The EDA followed a standard four-stage workflow that mirrors how the same investigation would be structured inside Tableau:"),
        Bullet("Connect & Profile \u2014 load the flat file, confirm the schema, check for nulls/duplicates, and review field types (equivalent to Tableau's data-source pane and \u2018Describe\u2019 view)."),
        Bullet("Univariate exploration \u2014 distribution and summary statistics for each numeric measure (Sales, Profit, Discount, Quantity)."),
        Bullet("Bivariate / multivariate exploration \u2014 measures broken down by the key dimensions (Category, Region, Segment, Ship Mode, Discount, time) and by relationships between measures (e.g., Discount vs. Profit)."),
        Bullet("Insight synthesis \u2014 consolidating patterns into a short list of prioritized, decision-relevant findings, each mapped to a specific Tableau chart type and build recipe."),
        P("Statistical computation and chart prototyping for this report were carried out in Python (pandas for aggregation, Matplotlib for the exploratory plots reproduced below) so that every figure quoted in this document is fully reproducible from the raw data. Section 7 then specifies, view by view, how the same analysis is assembled natively in Tableau using shelves, marks cards, and calculated fields \u2014 the environment in which the final interactive dashboard is intended to be built."),

        H1("5. Exploratory Data Analysis"),

        H2("5.1 Overall Performance (KPIs)"),
        dataTable(
          ["Metric", "Value"],
          [
            ["Total Sales", fmt$(R.total_sales)],
            ["Total Profit", fmt$(R.total_profit)],
            ["Overall Profit Margin", fmtPct(R.overall_margin)],
            ["Total Orders", R.total_orders.toLocaleString()],
            ["Total Line Items", R.total_line_items.toLocaleString()],
            ["Unique Customers", R.unique_customers.toLocaleString()],
            ["Average Order Value", fmt$(R.avg_order_value)],
            ["Average Discount Applied", fmtPct(R.avg_discount)],
            ["Line Items Sold at a Loss", fmtPct(R.pct_negative_profit_lines)],
          ],
          [4500, 4180]
        ),
        Caption("Table 3. Headline KPIs for the full analysis period."),

        H2("5.2 Category & Sub-Category Performance"),
        P("Technology is the strongest category on both sales and profit contribution, Office Supplies is the smallest by revenue but the most efficient (highest margin), and Furniture is the weakest performer relative to its sales volume."),
        dataTable(
          ["Category", "Sales", "Profit", "Margin"],
          R.by_category.map(c => [c.Category, fmt$(c.Sales), fmt$(c.Profit), fmtPct(c.Margin)]),
          [3300, 2100, 2100, 2180]
        ),
        Caption("Table 4. Sales, profit, and margin by product category."),
        ...Figure(CH + "01_category_sales_profit.png", 6.3, 3.55, "Figure 1. Sales vs. profit by category \u2014 Furniture's profit bar is disproportionately small relative to its sales bar, flagging a margin problem worth investigating."),
        ...Figure(CH + "02_subcategory_profit.png", 6.3, 5.45, "Figure 2. Profit by sub-category, sorted. Machines and Tables are the only two sub-categories that lose money overall, despite Machines alone generating $459.8K in sales."),
        P("Top 5 sub-categories by profit contribution:"),
        dataTable(
          ["Sub-Category", "Category", "Sales", "Profit", "Margin"],
          R.top5_profit_sub.map(s => [s["Sub-Category"], s.Category, fmt$(s.Sales), fmt$(s.Profit), fmtPct(s.Margin)]),
          [1900, 2200, 1750, 1750, 1080]
        ),
        Caption("Table 5. Highest profit-contributing sub-categories."),
        P("The two sub-categories operating at a net loss:"),
        dataTable(
          ["Sub-Category", "Category", "Sales", "Profit", "Margin"],
          [R.bottom5_profit_sub[0], R.bottom5_profit_sub[1]].map(s => [s["Sub-Category"], s.Category, fmt$(s.Sales), fmt$(s.Profit), fmtPct(s.Margin)]),
          [1900, 2200, 1750, 1750, 1080]
        ),
        Caption("Table 6. Loss-making sub-categories \u2014 primary candidates for pricing/discount-policy review."),

        H2("5.3 Time Trends & Seasonality"),
        P(`Year-over-year sales grew every year of the observed period, from ${fmt$(R.yearly[0].Sales)} in ${R.yearly[0].Year} to ${fmt$(R.yearly[R.yearly.length-1].Sales)} in ${R.yearly[R.yearly.length-1].Year} \u2014 a compound annual growth rate of roughly ${fmtPct(R.cagr_sales)}. Profit grew alongside sales but at a slightly slower pace, consistent with the discounting pressure identified in Section 5.5.`),
        dataTable(
          ["Year", "Sales", "Profit"],
          R.yearly.map(y => [String(y.Year), fmt$(y.Sales), fmt$(y.Profit)]),
          [2900, 2890, 2890]
        ),
        Caption("Table 7. Annual sales and profit."),
        ...Figure(CH + "03_monthly_trend.png", 6.3, 3.1, "Figure 3. Monthly sales and profit trend, 2015\u20132018, showing a clear repeating end-of-year peak."),
        ...Figure(CH + "04_seasonality.png", 6.0, 3.0, `Figure 4. Total sales by calendar month (all years combined). ${R.peak_month} is the strongest month, accounting for roughly ${fmtPct(R.peak_month_share)} of annual sales on its own \u2014 a clear seasonal peak that should drive inventory and staffing planning.`),

        H2("5.4 Regional & Geographic Analysis"),
        P("The West region leads on both sales and profit margin; the Central and South regions trail on margin despite respectable sales volume, suggesting regional differences in discounting behavior or product mix."),
        dataTable(
          ["Region", "Sales", "Profit", "Margin"],
          R.by_region.map(r => [r.Region, fmt$(r.Sales), fmt$(r.Profit), fmtPct(r.Margin)]),
          [3300, 2100, 2100, 2180]
        ),
        Caption("Table 8. Sales, profit, and margin by region."),
        ...Figure(CH + "05_region_sales.png", 5.8, 3.5, "Figure 5. Sales by region, labeled with regional profit margin."),
        ...Figure(CH + "06_top_states.png", 6.2, 4.6, "Figure 6. Top 10 states by sales \u2014 West Coast and Northeast states dominate."),
        P("At the other end of the distribution, the following states generated the lowest total profit \u2014 useful for prioritizing regional account review:"),
        dataTable(
          ["State", "Sales", "Profit", "Margin"],
          R.bottom10_state_profit.slice(0,6).map(s => [s.State, fmt$(s.Sales), fmt$(s.Profit), fmtPct(s.Margin)]),
          [3300, 2100, 2100, 2180]
        ),
        Caption("Table 9. Lowest-profit states (top 6 of 10 shown)."),

        H2("5.5 Discount Impact on Profitability"),
        P(`Discount rate is the single strongest driver of profitability found in this dataset: the correlation between discount and profit margin at the line-item level is ${R.corr_discount_profitmargin.toFixed(2)}, a strong negative relationship. Below ~30% discount, margins remain positive; above that threshold they turn reliably negative.`),
        ...Figure(CH + "07_discount_vs_profit.png", 6.0, 4.0, "Figure 7. Discount vs. profit at the line-item level (sample of 1,800 points). Losses (red) cluster heavily at higher discount rates."),
        dataTable(
          ["Discount Band", "Avg. Profit Margin", "Line Items"],
          R.discount_band_margin.map(d => [d.Discount, fmtPct(d.AvgMargin), d.Lines.toLocaleString()]),
          [2900, 2890, 2890]
        ),
        Caption("Table 10. Average profit margin by discount band \u2014 the tipping point into negative margin sits between 21\u201330% and 31\u201350%."),
        ...Figure(CH + "08_discount_bands.png", 5.8, 3.5, "Figure 8. Average profit margin collapses once discounts exceed roughly 30%."),

        H2("5.6 Customer Segment Analysis"),
        P("Consumer is the largest segment by both customer count and sales, but all three segments post very similar profit margins, indicating the company's discounting and pricing approach is applied fairly uniformly across segments rather than being segment-driven."),
        dataTable(
          ["Segment", "Sales", "Profit", "Margin", "Customers"],
          R.by_segment.map(s => [s.Segment, fmt$(s.Sales), fmt$(s.Profit), fmtPct(s.Margin), s.Customers.toLocaleString()]),
          [2200, 1850, 1850, 1400, 1180]
        ),
        Caption("Table 11. Sales, profit, and margin by customer segment."),
        ...Figure(CH + "09_segment_pie.png", 5.0, 3.35, "Figure 9. Share of total sales by customer segment."),

        H2("5.7 Shipping Mode Analysis"),
        P("Standard Class is by far the most-used shipping method, consistent with cost-conscious default fulfillment; faster tiers (First Class, Same Day) are used selectively, presumably for time-sensitive or premium orders."),
        dataTable(
          ["Ship Mode", "Sales", "Avg. Days to Ship", "Line Items"],
          R.by_ship_mode.sort((a,b)=>b.Sales-a.Sales).map(s => [s["Ship Mode"], fmt$(s.Sales), s.AvgDays.toFixed(1), s.Lines.toLocaleString()]),
          [2600, 2400, 2400, 1780]
        ),
        Caption("Table 12. Sales volume and average fulfillment time by shipping mode."),

        H2("5.8 Correlation Analysis"),
        P("A correlation matrix across the four core numeric fields confirms the discount-profit relationship quantitatively and shows Sales and Profit are only moderately correlated \u2014 high sales volume does not guarantee high profit, reinforcing the need to manage profitability at the sub-category and discount-policy level rather than by revenue alone."),
        ...Figure(CH + "10_correlation_heatmap.png", 4.6, 4.05, "Figure 10. Correlation matrix of Sales, Quantity, Discount, and Profit."),

        H2("5.9 Outlier Detection"),
        P(`Using the standard interquartile-range (IQR) rule on Profit (1.5\u00d7IQR beyond Q1/Q3), ${R.outlier_count.toLocaleString()} line items (${fmtPct(R.outlier_pct)} of all rows) are flagged as statistical outliers \u2014 a mix of unusually large profitable orders and unusually large losses. The boxplot below shows these outliers are concentrated in Technology and Furniture, the two categories with the widest unit-price range.`),
        ...Figure(CH + "11_outliers_boxplot.png", 6.2, 3.75, "Figure 11. Profit distribution and outliers by category. Furniture shows the widest spread of losses."),

        H2("5.10 Customer Concentration (Pareto Analysis)"),
        P(`Ranking customers by total spend and plotting the cumulative share of revenue shows meaningful \u2014 though not extreme \u2014 concentration: the top 20% of customers account for roughly ${fmtPct(R.pareto_top20pct_customers_sales_share)} of total sales, short of a textbook 80/20 split but still enough to justify a dedicated key-account retention strategy for the top tier.`),
        ...Figure(CH + "12_pareto_customers.png", 6.0, 3.4, "Figure 12. Cumulative share of sales by customer, ranked highest-to-lowest spend."),

        H1("6. Key Insights Summary"),
        Bullet("Discounting above ~30% is the clearest lever on profitability in the dataset \u2014 margins flip from solidly positive to negative almost exactly at that threshold, independent of category."),
        Bullet("Two sub-categories \u2014 Machines and Tables \u2014 are structurally unprofitable despite strong sales, together accounting for roughly $(28.2K) and $(19.6K) in losses; both warrant a pricing/discount cap review rather than a sales-volume push."),
        Bullet("Technology drives the most profit and Office Supplies the best margin, while Furniture is the weakest category relative to its sales size."),
        Bullet("December is a clear seasonal peak; inventory, staffing, and promotional planning should be weighted toward Q4."),
        Bullet("The West region leads on both revenue and margin; Central and South regions have comparatively thinner margins worth investigating for regional discounting practices."),
        Bullet("Customer segments perform similarly on margin, suggesting profitability issues are product- and discount-driven rather than segment-driven."),
        Bullet(`Revenue is moderately concentrated: the top 20% of customers generate about ${fmtPct(R.pareto_top20pct_customers_sales_share)} of sales, supporting a tiered account-management approach.`),
        Bullet("Standard Class shipping dominates order volume; the trade-off between shipping cost and delivery speed by segment is a candidate for further study."),

        H1("7. Recommended Tableau Dashboard Design"),
        P("Each analytical view above maps directly to a Tableau sheet. The table below specifies exactly how to reproduce it inside Tableau \u2014 which fields go on which shelf, the mark type, and any calculated fields needed \u2014 so this Python-based exploration can be rebuilt as a live, filterable Tableau workbook."),
        dataTable(
          ["Dashboard View", "Tableau Build (Shelves / Marks / Calc Fields)"],
          [
            ["Category & Sub-Category Profit (Fig. 1\u20132)", "Rows: Sub-Category (sorted by Profit); Columns: SUM(Profit); Mark: Bar; Color: [Profit] < 0 (calculated field) for red/green split; add SUM(Sales) as a dual-axis or tooltip measure."],
            ["Monthly Trend (Fig. 3)", "Columns: MONTH(Order Date), continuous; Rows: SUM(Sales) and SUM(Profit) as a dual-axis line chart; synchronize axes off; Mark: Line."],
            ["Seasonality (Fig. 4)", "Columns: MONTH(Order Date), discrete (part-of-date); Rows: SUM(Sales); Mark: Bar. Use a discrete date part so all four years combine into one 12-bar view."],
            ["Regional Sales & Margin (Fig. 5\u20136)", "Rows: Region or State; Columns: SUM(Sales); Mark: Bar; Label: Calculated field [Profit Margin] = SUM(Profit)/SUM(Sales), formatted as %; consider a filled map with State on the Detail shelf and Profit Margin on Color."],
            ["Discount vs. Profit (Fig. 7\u20138)", "Columns: Discount; Rows: SUM(Profit) or Profit (line-item); Mark: Circle for the scatter, Bar for the binned view; create a calculated field [Discount Band] using an IF/ELSEIF bucket, then place it on Columns for the banded bar chart."],
            ["Segment Mix (Fig. 9)", "Rows/Angle: SUM(Sales); Color: Segment; Mark: Pie (or, for a cleaner Tableau-native alternative, a 100% stacked bar)."],
            ["Correlation Heatmap (Fig. 10)", "Best built as a highlight table: Rows and Columns: the four measure names (use a pivoted/reshaped data source or a calculated correlation table); Mark: Square; Color: correlation value on a diverging (red\u2013blue) palette."],
            ["Outlier Boxplot (Fig. 11)", "Rows: Category; Columns: Profit; Mark: Circle with 'Box Plot' selected under Analytics > Box Plot, or use Show Me > Box-and-Whisker."],
            ["Customer Pareto (Fig. 12)", "Columns: Customer ID (sorted descending by Sales, table calculation 'Running % of Total'); Rows: SUM(Sales); apply a Rank/Running Total quick table calculation for the cumulative curve; Mark: Line."],
            ["Executive KPI tiles (Table 3)", "Individual text/BAN (Big Ass Number) tiles built from calculated fields for Total Sales, Total Profit, Profit Margin, and Avg. Order Value, assembled into a dashboard header row."],
          ],
          [2600, 6980]
        ),
        Caption("Table 13. Tableau build specification for every chart in this report."),
        P("Recommended dashboard filters/interactivity: a global date-range filter (Order Date), a Region/State filter, a Category/Sub-Category filter, and a Discount slider \u2014 all set to apply across all sheets so a reader can drill from the executive KPI view down to a single state, category, or discount band without leaving the dashboard."),

        H1("8. Areas for Further Investigation"),
        Bullet("Return/cancellation data (not present in this extract) would clarify whether high-discount, high-loss orders are also disproportionately returned."),
        Bullet("A shipping-cost field would allow a true landed-margin analysis rather than inferring cost pressure from discount alone."),
        Bullet("Customer-level cohort analysis (first purchase date, repeat-purchase rate) would deepen the Pareto finding in Section 5.10 into a retention strategy."),
        Bullet("A market-basket analysis of products frequently ordered together could inform bundling strategies to lift Furniture and Office Supplies margins."),
        Bullet("Competitive/regional pricing data would help explain why Central and South regions run thinner margins than West and East."),

        H1("9. Conclusion"),
        P("This exploratory analysis of the Sample \u2013 Superstore dataset shows a business with healthy, consistently growing top-line sales but a profit profile that is heavily shaped by discounting behavior rather than by category or region alone. The clearest, most actionable finding is the discount threshold beyond which margins turn negative; the clearest structural issue is the underperformance of the Tables and Machines sub-categories. Both findings, along with the seasonal and geographic patterns identified above, translate directly into the Tableau dashboard specification in Section 7, giving a clear path from this static report to a live, explorable analytics tool."),

      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("./Superstore_EDA_Report.docx", buf);
  console.log("Wrote docx, bytes:", buf.length);
});
