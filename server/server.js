// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import OpenAI from "openai";
import { EsgRun } from "./models/EsgRun.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// ---- MongoDB (optional) ----
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

// ---- OpenAI client ----
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---- shared ESG data (unchanged) ----
const mockData = {
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

// helper to call OpenAI
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

// ---- 1. Dashboard route ----
app.get("/api/esg-data", async (req, res) => {
  let insights = [
    "Renewable energy share could be increased to reduce exposure to carbon tax.",
    "Supplier diversity is below typical ESG benchmarks; consider targeted supplier development in SMMEs.",
    "Customer satisfaction is strong but should be maintained through continuous feedback loops.",
    "Human capital metrics are high; you can link this to lower incident rates and improved productivity.",
    "Ensure supply chain ESG screening is extended to high-risk suppliers and geographies.",
  ];

  const systemPrompt =
    "You are an ESG analyst. Given combined ESG metrics (Environmental, Social, Governance), " +
    "produce concise executive-level insights. Return 5 bullet points, each on its own line, without numbering.";

  const aiInsights = await generateInsightsFromOpenAI(systemPrompt, mockData);
  if (aiInsights.length) {
    insights = aiInsights;
  }

  // save run ONLY if Mongo is connected
  if (mongoConnected) {
    try {
      await EsgRun.create({
        user: req.query.user || "anonymous",
        summary: mockData.summary,
        metrics: mockData.metrics,
        environmentalMetrics: mockData.environmentalMetrics,
        socialMetrics: mockData.socialMetrics,
        governanceMetrics: mockData.governanceMetrics,
        insights,
      });
    } catch (err) {
      console.error("MongoDB save error:", err.message);
    }
  }

  res.json({ mockData, insights });
});

// ---- 2. Environmental-only endpoint ----
app.get("/api/environmental-insights", async (req, res) => {
  const metrics = mockData.environmentalMetrics;

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
  if (aiInsights.length) {
    insights = aiInsights;
  }

  res.json({ metrics, insights });
});

// ---- 3. Social-only endpoint ----
app.get("/api/social-insights", async (req, res) => {
  const metrics = mockData.socialMetrics;

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
  if (aiInsights.length) {
    insights = aiInsights;
  }

  res.json({ metrics, insights });
});

// ---- 4. Governance-only endpoint ----
app.get("/api/governance-insights", async (req, res) => {
  const metrics = mockData.governanceMetrics;

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
  if (aiInsights.length) {
    insights = aiInsights;
  }

  res.json({ metrics, insights });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
