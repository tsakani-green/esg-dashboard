// server/routes/environmental.js
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import { EsgRun } from "../models/EsgRun.js";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get("/api/environmental-insights", async (req, res) => {
  const mockMetrics = {
    energyUsage: [40, 30, 20, 10],
    emissions: [100, 80, 50, 10],
    waste: [50, 80, 35, 70],
  };

  let insights = [
    "Renewable energy share could be increased to reduce carbon exposure.",
    "Carbon emissions are high from coal; consider cleaner energy sources.",
    "Waste management requires immediate attention to reduce environmental footprint.",
  ];

  try {
    const response = await openai.responses.create({
      model: "gpt-5.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are an ESG analyst. Provide 5 concise bullet point insights specifically about environmental metrics: energy usage, carbon emissions, and waste. Each point should be clear and actionable.",
        },
        {
          role: "user",
          content: "Here are environmental metrics:\n" + JSON.stringify(mockMetrics, null, 2),
        },
      ],
    });

    const output = response.output[0];
    const text =
      output.content?.find((c) => c.type === "output_text")?.text ??
      output.content?.[0]?.text ??
      "";

    const parsed = text
      .split("\n")
      .map((line) => line.replace(/^[-•\d.\s]+/, "").trim())
      .filter((line) => line.length > 0)
      .slice(0, 5);

    if (parsed.length) insights = parsed;

    // Save run to MongoDB
    await EsgRun.create({
      user: req.query.user || "anonymous",
      environmentalMetrics: mockMetrics,
      insights,
    });
  } catch (err) {
    console.error("Error generating environmental AI insights:", err.message);
  }

  res.json({ insights, metrics: mockMetrics });
});

export default router;
