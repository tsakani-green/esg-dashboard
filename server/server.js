// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import OpenAI from "openai";
import multer from "multer";
import xlsx from "xlsx";
import { EsgRun } from "./models/EsgRun.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// ---------- MongoDB (optional) ----------
let mongoConnected = false;

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      mongoConnected = true;
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      console.log("Continuing without MongoDB (data will not be saved).");
    });
} else {
  console.log("No MONGO_URI provided, skipping MongoDB connection.");
}

// ---------- OpenAI client ----------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------- initial (demo) ESG data ----------
const baseMockData = {
  summary: {
    environmental: {
      totalEnergyConsumption: 25000000,
      renewableEnergyShare: 32,
      carbonEmissions: 250000,
    },
    social: {
      supplierDiversity: 3,
      customerSatisfaction: 85,
      humanCapital: 92,
    },
    governance: {
      corporateGovernance: "Compliant",
      iso9001Compliance: "Yes",
      businessEthics: "High",
    },
  },
  metrics: {
    carbonTax: 12500000,
    taxAllowances: 4500000,
    carbonCredits: 18000,
    energySavings: 3200000,
  },
  environmentalMetrics: {
    energyUsage: [40, 30, 20, 10],
    emissions: [100, 80, 50, 10],
    waste: [50, 80, 35, 70],
    co2Emissions: [
      22000, 21000, 20000, 19500, 19000, 18500,
      18000, 17500, 17000, 16800, 16600, 16500,
    ],
    production: [
      110000, 112000, 115000, 120000, 118000, 119000,
      121000, 122000, 123000, 124000, 125000, 126000,
    ],
  },
  socialMetrics: {
    supplierDiversity: 3,
    employeeEngagement: 70,
    communityPrograms: 40,
  },
  governanceMetrics: {
    corporateGovernance: "Compliant",
    dataPrivacy: "Compliant",
    isoCompliance: "ISO 9001 Certified",
  },
};

// this is what the whole platform uses
let currentData = baseMockData;
let currentInsights = [];

// ---------- Helpers ----------

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  const s = String(value).replace(",", "."); // SA decimal comma
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// build ESG JSON from the Excel rows (your headers)
function buildEsgFromRows(rows) {
  const n = rows.length || 1;

  let totalGrid = 0;
  let totalSolar = 0;
  let totalDiesel = 0;
  let totalLpg = 0;
  let totalProcess = 0;

  let totalWaterMunicipal = 0;
  let totalWaterBore = 0;
  let totalWasteGen = 0;
  let totalRecycled = 0;

  let totalWomen = 0;
  let totalYouth = 0;
  let totalTrainingHours = 0;
  let totalSafetyInc = 0;
  let totalLostTime = 0;

  let totalGovernanceTrainings = 0;
  let totalEnvironmentalTrainings = 0;
  let totalComplianceFindings = 0;

  const energyUsage = [];
  const emissionsSeries = [];
  const wasteSeries = [];
  const co2Series = [];
  const productionSeries = [];

  rows.forEach((row) => {
    const grid = toNumber(row["Grid Electr"] ?? row["Grid Electricity"]);
    const solar = toNumber(row["Onsite Sol"] ?? row["Onsite Solar"]);
    const diesel = toNumber(row["Diesel (L)"]);
    const lpg = toNumber(row["LPG (kg)"]);
    const processGas = toNumber(row["Process G"] ?? row["Process Gas"]);

    const waterMu = toNumber(row["Water Mu"]);
    const waterBor = toNumber(row["Water Bor"]);
    const wasteGen = toNumber(row["Waste Ge"] ?? row["Waste Gen"]);
    const hazardousWaste = toNumber(row["Hazardou:"]);
    const recycledW = toNumber(row["Recycled W"]);

    const production = toNumber(row["Production"]);

    const womenPct = toNumber(row["Women (%)"]);
    const youthPct = toNumber(row["Youth (%)"]);
    const trainingHrs = toNumber(row["Employee Training H"]);
    const safetyInc = toNumber(row["Safety Inc"]);
    const lostTime = toNumber(row["Lost Time"]);
    const govTrain = toNumber(row["Governan"]);
    const envTrain = toNumber(row["Environm"]);
    const complianceFindings = toNumber(row["Compliance Findings (No.)"]);

    totalGrid += grid;
    totalSolar += solar;
    totalDiesel += diesel;
    totalLpg += lpg;
    totalProcess += processGas;

    totalWaterMunicipal += waterMu;
    totalWaterBore += waterBor;
    totalWasteGen += wasteGen;
    totalRecycled += recycledW;

    totalWomen += womenPct;
    totalYouth += youthPct;
    totalTrainingHours += trainingHrs;
    totalSafetyInc += safetyInc;
    totalLostTime += lostTime;
    totalGovernanceTrainings += govTrain;
    totalEnvironmentalTrainings += envTrain;
    totalComplianceFindings += complianceFindings;

    // simple derived series for charts
    const rowEnergy =
      grid +
      solar +
      processGas +
      diesel * 0.01 + // rough factors just for demo
      lpg * 0.01;

    const rowCo2 =
      diesel * 0.00268 +
      lpg * 0.0015 +
      grid * 0.0009 +
      processGas * 0.0018;

    energyUsage.push(Math.round(rowEnergy));
    emissionsSeries.push(Math.round(wasteGen + hazardousWaste));
    wasteSeries.push(Math.round(wasteGen));
    co2Series.push(Number(rowCo2.toFixed(1)));
    productionSeries.push(Math.round(production));
  });

  const totalEnergy =
    totalGrid + totalSolar + totalDiesel + totalLpg + totalProcess;
  const totalWater = totalWaterMunicipal + totalWaterBore;
  const totalCo2Tonnes = co2Series.reduce((a, b) => a + b, 0);

  const renewableShare =
    totalEnergy > 0 ? (totalSolar / totalEnergy) * 100 : 0;

  const avgWomen = totalWomen / n;
  const avgYouth = totalYouth / n;

  const summary = {
    environmental: {
      totalEnergyConsumption: Math.round(totalEnergy),
      renewableEnergyShare: Number(renewableShare.toFixed(1)),
      carbonEmissions: Math.round(totalCo2Tonnes),
      totalWaterUse: Math.round(totalWater),
      totalWaste: Math.round(totalWasteGen),
    },
    social: {
      supplierDiversity: 3, // still static – you can wire real fields later
      customerSatisfaction: 85,
      humanCapital: 92,
      avgWomenRepresentation: Number(avgWomen.toFixed(1)),
      avgYouthRepresentation: Number(avgYouth.toFixed(1)),
      totalTrainingHours,
      totalSafetyIncidents: totalSafetyInc,
      totalLostTimeIncidents: totalLostTime,
    },
    governance: {
      corporateGovernance: "Compliant",
      iso9001Compliance: "Yes",
      businessEthics: "High",
      totalGovernanceTrainings,
      totalEnvironmentalTrainings,
      totalComplianceFindings,
    },
  };

  const metrics = {
    carbonTax: Math.round(totalCo2Tonnes * 150), // dummy factor
    taxAllowances: Math.round(totalEnergy * 0.05),
    carbonCredits: Math.round(totalCo2Tonnes * 0.1),
    energySavings: Math.round(totalEnergy * 0.08),
  };

  const environmentalMetrics = {
    energyUsage,
    emissions: emissionsSeries,
    waste: wasteSeries,
    co2Emissions: co2Series,
    production: productionSeries,
  };

  const socialMetrics = {
    supplierDiversity: summary.social.supplierDiversity,
    employeeEngagement: 70,
    communityPrograms: 40,
  };

  const governanceMetrics = {
    corporateGovernance: summary.governance.corporateGovernance,
    dataPrivacy: "Compliant",
    isoCompliance: summary.governance.iso9001Compliance,
  };

  return {
    summary,
    metrics,
    environmentalMetrics,
    socialMetrics,
    governanceMetrics,
  };
}

// OpenAI helper
async function generateInsightsFromOpenAI(systemPrompt, payload) {
  let insights = [];

  try {
    const resp = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            "Here is ESG data in JSON:\n" + JSON.stringify(payload, null, 2),
        },
      ],
    });

    const output = resp.output?.[0];
    const text =
      output?.content?.find((c) => c.type === "output_text")?.text ??
      output?.content?.[0]?.text ??
      "";

    insights = text
      .split("\n")
      .map((line) => line.replace(/^[-•\d.\s]+/, "").trim())
      .filter((line) => line.length > 0)
      .slice(0, 5);
  } catch (err) {
    console.error("OpenAI error:", err.message);
  }

  return insights;
}

// ---------- Routes ----------

// 1) Main ESG data for dashboard / context
app.get("/api/esg-data", async (req, res) => {
  let insights = currentInsights;

  // if no insights yet, generate once from currentData
  if (!insights || insights.length === 0) {
    const systemPrompt =
      "You are an ESG analyst. Given combined ESG metrics (Environmental, Social, Governance), " +
      "produce concise executive-level insights. Return 5 bullet points, each on its own line, without numbering.";
    insights = await generateInsightsFromOpenAI(systemPrompt, currentData);
    currentInsights = insights;
  }

  // optionally save run
  if (mongoConnected) {
    try {
      await EsgRun.create({
        user: req.query.user || "anonymous",
        summary: currentData.summary,
        metrics: currentData.metrics,
        environmentalMetrics: currentData.environmentalMetrics,
        socialMetrics: currentData.socialMetrics,
        governanceMetrics: currentData.governanceMetrics,
        insights,
      });
    } catch (err) {
      console.error("MongoDB save error:", err.message);
    }
  }

  res.json({ mockData: currentData, insights });
});

// 2) Environmental-only insights (uses latest currentData)
app.get("/api/environmental-insights", async (req, res) => {
  const metrics = currentData.environmentalMetrics;

  let insights = [
    "Increase the share of renewables to reduce emissions from coal and diesel.",
    "Track energy intensity per tonne of production to highlight efficiency gains.",
    "Prioritise waste reduction in the highest-emitting waste streams.",
    "Link carbon reduction projects to expected carbon tax savings.",
    "Investigate energy use spikes by site or process line.",
  ];

  const systemPrompt =
    "You are an ESG analyst focusing ONLY on Environmental metrics (energy, carbon, waste, etc.). " +
    "Provide 5 concise insights for operations management. Return 5 bullet points, one per line, no numbering.";

  const aiInsights = await generateInsightsFromOpenAI(systemPrompt, metrics);
  if (aiInsights.length) insights = aiInsights;

  res.json({ metrics, insights });
});

// 3) Social-only insights
app.get("/api/social-insights", async (req, res) => {
  const metrics = currentData.socialMetrics;

  let insights = [
    "Supplier diversity is low; create a targeted SMME and EME supplier development programme.",
    "Employee engagement is moderate – run pulse surveys and targeted interventions.",
    "Expand community programmes in areas with high operations-related impacts.",
    "Link community investment to measurable social outcomes and ESG reporting.",
    "Strengthen feedback channels between employees, unions, and management.",
  ];

  const systemPrompt =
    "You are an ESG analyst focusing ONLY on Social metrics (supplier diversity, employee engagement, community). " +
    "Provide 5 concise insights for HR and stakeholder teams. Return 5 bullet points, one per line, no numbering.";

  const aiInsights = await generateInsightsFromOpenAI(systemPrompt, metrics);
  if (aiInsights.length) insights = aiInsights;

  res.json({ metrics, insights });
});

// 4) Governance-only insights
app.get("/api/governance-insights", async (req, res) => {
  const metrics = currentData.governanceMetrics;

  let insights = [
    "Maintain ISO 9001 certification by aligning ESG KPIs into existing management systems.",
    "Ensure data privacy controls are regularly tested and audited.",
    "Extend ESG screening into procurement and supply chain onboarding.",
    "Strengthen board-level ESG oversight with clear roles and reports.",
    "Integrate ESG risks into enterprise risk management processes.",
  ];

  const systemPrompt =
    "You are an ESG analyst focusing ONLY on Governance metrics (policies, privacy, compliance, ISO, ethics). " +
    "Provide 5 concise insights for executives. Return 5 bullet points, one per line, no numbering.";

  const aiInsights = await generateInsightsFromOpenAI(systemPrompt, metrics);
  if (aiInsights.length) insights = aiInsights;

  res.json({ metrics, insights });
});

// ---------- Upload route (Excel OR JSON) ----------

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/esg-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalName = req.file.originalname.toLowerCase();
    let newData;

    if (originalName.endsWith(".json")) {
      // JSON upload
      const jsonString = req.file.buffer.toString("utf-8");
      const parsed = JSON.parse(jsonString);
      if (!parsed.summary || !parsed.metrics) {
        return res
          .status(400)
          .json({ error: "JSON must contain summary and metrics fields." });
      }
      newData = parsed;
    } else if (
      originalName.endsWith(".xlsx") ||
      originalName.endsWith(".xls")
    ) {
      // Excel upload – match your column headers
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

      if (!rows || rows.length === 0) {
        return res
          .status(400)
          .json({ error: "Excel sheet is empty or could not be parsed." });
      }

      newData = buildEsgFromRows(rows);
    } else {
      return res.status(400).json({
        error: "Unsupported file type. Please upload .json, .xlsx or .xls files.",
      });
    }

    // Generate fresh AI insights for the uploaded data
    const systemPrompt =
      "You are an ESG analyst. Given combined ESG metrics (Environmental, Social, Governance), " +
      "produce concise executive-level insights. Return 5 bullet points, each on its own line, without numbering.";

    const aiInsights = await generateInsightsFromOpenAI(systemPrompt, newData);

    // update the global "current" data so the entire platform uses it
    currentData = newData;
    currentInsights = aiInsights;

    res.json({
      mockData: newData,
      insights: aiInsights,
    });
  } catch (err) {
    console.error("Upload processing error:", err);
    res.status(500).json({ error: "Failed to process ESG upload." });
  }
});

// ---------- start server ----------
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
