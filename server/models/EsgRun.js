// server/models/EsgRun.js
import mongoose from "mongoose";

const EsgRunSchema = new mongoose.Schema(
  {
    user: { type: String },
    summary: {
      environmental: Object,
      social: Object,
      governance: Object,
    },
    metrics: {
      carbonTax: Number,
      taxAllowances: Number,
      carbonCredits: Number,
      energySavings: Number,
    },
    environmentalMetrics: Object,
    socialMetrics: Object,
    governanceMetrics: Object,
    insights: [String],
  },
  { timestamps: true }
);

export const EsgRun = mongoose.model("EsgRun", EsgRunSchema);
