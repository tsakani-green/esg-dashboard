// src/pages/EnvironmentalCategory.jsx
import React, { useContext, useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FaFilePdf,
  FaLeaf,
  FaCloud,
  FaRecycle,
} from "react-icons/fa";
import { jsPDF } from "jspdf";
import { SimulationContext } from "../context/SimulationContext";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const API_BASE_URL = "https://esg-backend-beige.vercel.app";

// --- Helper: status badge where LOWER is better (e.g. emissions) ---
const getStatusLowerBetter = (value, target) => {
  if (value == null || target == null) {
    return { label: "No benchmark", color: "bg-gray-100 text-gray-600" };
  }

  if (value <= target) {
    return { label: "On track", color: "bg-emerald-50 text-emerald-700" };
  }
  if (value <= target * 1.2) {
    return { label: "Watch", color: "bg-amber-50 text-amber-700" };
  }
  return { label: "Off track", color: "bg-red-50 text-red-700" };
};

// --- Helper: derive suggested actions from AI insights text ---
const deriveActionsFromInsights = (insights) => {
  const text = insights.join(" ").toLowerCase();
  const actions = new Set();

  if (text.includes("energy") || text.includes("efficiency")) {
    actions.add("Prioritise energy-efficiency projects");
    actions.add("Review high-usage facilities");
  }
  if (text.includes("carbon") || text.includes("emissions")) {
    actions.add("Update decarbonisation roadmap");
    actions.add("Model carbon tax exposure");
  }
  if (text.includes("renewable") || text.includes("solar") || text.includes("wind")) {
    actions.add("Assess additional renewable capacity");
  }
  if (text.includes("waste") || text.includes("recycling") || text.includes("landfill")) {
    actions.add("Strengthen waste segregation and recycling");
    actions.add("Review hazardous waste controls");
  }
  if (text.includes("water")) {
    actions.add("Assess water efficiency at high-usage sites");
  }

  if (actions.size === 0 && insights.length > 0) {
    actions.add("Convert insights into 3–5 environmental projects");
  }

  return Array.from(actions);
};

const EnvironmentalCategory = () => {
  const {
    environmentalMetrics,
    environmentalInsights: ctxEnvInsights,
    loading: ctxLoading,
  } = useContext(SimulationContext);

  // LIVE AI insights from backend
  const [insights, setInsights] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // --- Fetch live environmental insights from backend ---
  useEffect(() => {
    const loadInsights = async () => {
      try {
        setAiLoading(true);
        setAiError(null);

        const res = await fetch(`${API_BASE_URL}/api/environmental-insights`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const incoming =
          Array.isArray(data.insights) && data.insights.length > 0
            ? data.insights
            : [];

        if (incoming.length > 0) {
          setInsights(incoming.slice(0, 6));
        } else if (Array.isArray(ctxEnvInsights)) {
          // fallback to SimulationContext insights
          setInsights(ctxEnvInsights.slice(0, 6));
        } else {
          setInsights([]);
        }

        setAiLoading(false);
      } catch (err) {
        console.error("Error loading environmental insights:", err);
        if (Array.isArray(ctxEnvInsights)) {
          setInsights(ctxEnvInsights.slice(0, 6));
        } else {
          setInsights([]);
        }
        setAiError("Failed to load live AI insights.");
        setAiLoading(false);
      }
    };

    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Derive simple KPIs from metrics ---
  const energyUsageSeries = environmentalMetrics?.energyUsage || [];
  const co2Series = environmentalMetrics?.co2Emissions || [];
  const wasteSeries = environmentalMetrics?.waste || [];

  const energyTotal =
    energyUsageSeries.length > 0
      ? energyUsageSeries.reduce((sum, v) => sum + v, 0)
      : null;

  const co2Latest =
    co2Series.length > 0 ? co2Series[co2Series.length - 1] : null;

  const co2Total =
    co2Series.length > 0 ? co2Series.reduce((sum, v) => sum + v, 0) : null;

  const wasteTotal =
    wasteSeries.length > 0
      ? wasteSeries.reduce((sum, v) => sum + v, 0)
      : null;

  // Simple internal benchmark thresholds (illustrative)
  const co2LatestTarget = 19000; // tCO₂e (per latest month)
  const co2TotalTarget = 220000; // annual tCO₂e
  const wasteTarget = 220; // total waste index / tonnes

  const co2LatestStatus = getStatusLowerBetter(co2Latest, co2LatestTarget);
  const co2TotalStatus = getStatusLowerBetter(co2Total, co2TotalTarget);
  const wasteStatus = getStatusLowerBetter(wasteTotal, wasteTarget);

  // derive labels from series length
  const periods =
    energyUsageSeries && energyUsageSeries.length > 0
      ? energyUsageSeries.map((_, idx) => `Period ${idx + 1}`)
      : ["Period 1", "Period 2", "Period 3", "Period 4"];

  const wasteLabels =
    wasteSeries &&
    wasteSeries.length > 0 &&
    wasteSeries.length === periods.length
      ? periods
      : ["Stream 1", "Stream 2", "Stream 3", "Stream 4"];

  const energyData = {
    labels: periods,
    datasets: [
      {
        data: energyUsageSeries.length > 0 ? energyUsageSeries : [50, 30, 10, 10],
        backgroundColor: ["#16a34a", "#f59e0b", "#22c55e", "#3b82f6"],
        hoverOffset: 6,
      },
    ],
  };

  const emissionsData = {
    labels: periods.slice(0, co2Series.length || 4),
    datasets: [
      {
        label: "Carbon emissions (tCO₂e)",
        data: co2Series.length > 0 ? co2Series : [100, 80, 50, 20],
        backgroundColor: "#16a34a",
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const wasteData = {
    labels: wasteLabels,
    datasets: [
      {
        label: "Waste (tonnes / index)",
        data: wasteSeries.length > 0 ? wasteSeries : [50, 80, 35, 70],
        backgroundColor: ["#16a34a", "#f59e0b", "#ef4444", "#3b82f6"],
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const actionChips = deriveActionsFromInsights(insights);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AfricaESG.AI Environmental Mini Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Environmental Metrics:", 14, y);
    y += 8;

    Object.entries(environmentalMetrics || {}).forEach(([key, value]) => {
      const lines = doc.splitTextToSize(
        `${key}: ${JSON.stringify(value)}`,
        180
      );
      doc.setFont("helvetica", "normal");
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("AI Mini Report (LIVE AI):", 14, y);
    y += 8;

    (insights.length > 0 ? insights : ["No AI insights available."]).forEach(
      (note) => {
        const lines = doc.splitTextToSize(`• ${note}`, 180);
        doc.setFont("helvetica", "normal");
        doc.text(lines, 14, y);
        y += lines.length * 6;
      }
    );

    doc.save("AfricaESG_EnvironmentalMiniReport.pdf");
  };

  // KPI card component
  const KpiCard = ({ icon, label, value, unit, status, hint }) => (
    <div className="flex flex-col justify-between rounded-2xl bg-white/80 backdrop-blur border border-emerald-100 shadow-sm px-4 py-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            {icon}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            {label}
          </div>
        </div>
        {status && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}
          >
            {status.label}
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-slate-900 leading-tight">
        {value != null ? value.toLocaleString() : "N/A"}
        {unit && value != null ? ` ${unit}` : ""}
      </div>
      {hint && (
        <div className="text-[11px] text-slate-500 mt-1 leading-snug">
          {hint}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">
              Environmental Performance
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
              Energy intensity, emissions and waste streams across your
              operations – populated from your latest ESG upload and enhanced
              with live AI insights.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-sm md:text-base font-semibold transition-transform hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" />
            <span>Download Report (PDF)</span>
          </button>
        </div>

        {/* KPI row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            icon={<FaLeaf size={16} />}
            label="Total energy use (index)"
            value={energyTotal}
            unit=""
            status={null}
            hint="Sum of reported energy-usage indices across the period."
          />
          <KpiCard
            icon={<FaCloud size={16} />}
            label="Latest CO₂ emissions"
            value={co2Latest}
            unit="tCO₂e"
            status={co2LatestStatus}
            hint="Most recent reporting period’s tCO₂e emissions vs internal benchmark."
          />
          <KpiCard
            icon={<FaRecycle size={16} />}
            label="Total waste"
            value={wasteTotal}
            unit="(index)"
            status={wasteStatus}
            hint="Aggregate waste volume across the measured streams."
          />
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Charts Section */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Energy pie */}
            <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
                Energy use by period
              </h2>
              <p className="text-xs text-gray-500 text-center mb-3">
                Relative energy use across reporting periods or major sites.
              </p>
              <div className="h-56 sm:h-64">
                <Pie
                  data={energyData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                    },
                  }}
                />
              </div>

              {/* Table breakdown */}
              {energyUsageSeries.length > 0 && (
                <table className="mt-4 w-full text-xs text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-1">Period</th>
                      <th className="text-right py-1">Energy index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {energyUsageSeries.map((val, idx) => (
                      <tr
                        key={idx}
                        className="border-b last:border-b-0 border-slate-50"
                      >
                        <td className="py-1">Period {idx + 1}</td>
                        <td className="py-1 text-right">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* CO₂ emissions bar */}
            <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
                CO₂ emissions (tCO₂e)
              </h2>
              <p className="text-xs text-gray-500 text-center mb-3">
                Trend in reported carbon emissions over time.
              </p>
              <div className="h-56 sm:h-64">
                <Bar
                  data={emissionsData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { color: "#e5e7eb" } },
                    },
                  }}
                />
              </div>

              {/* Simple YTD vs target summary */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2">
                <div>
                  <div className="font-semibold text-slate-700">
                    YTD emissions
                  </div>
                  <div>
                    {co2Total != null
                      ? `${co2Total.toLocaleString()} tCO₂e`
                      : "N/A"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-700">
                    Benchmark
                  </div>
                  <div>{co2TotalTarget.toLocaleString()} tCO₂e</div>
                </div>
              </div>
            </div>

            {/* Waste bar (full width on md) */}
            <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-200 md:col-span-2 flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
                Waste streams (tonnes / index)
              </h2>
              <p className="text-xs text-gray-500 text-center mb-3">
                Comparison of waste volumes across key streams or locations.
              </p>
              <div className="h-48 sm:h-56">
                <Bar
                  data={wasteData}
                  options={{
                    indexAxis: "y",
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { beginAtZero: true, grid: { color: "#e5e7eb" } },
                      y: { grid: { display: false } },
                    },
                  }}
                />
              </div>

              {wasteSeries.length > 0 && (
                <table className="mt-4 w-full text-xs text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-1">Stream</th>
                      <th className="text-right py-1">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteSeries.map((val, idx) => (
                      <tr
                        key={idx}
                        className="border-b last:border-b-0 border-slate-50"
                      >
                        <td className="py-1">{wasteLabels[idx] || `Stream ${idx + 1}`}</td>
                        <td className="py-1 text-right">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white/95 backdrop-blur p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col lg:sticky lg:top-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              AI Mini Report – Environmental (LIVE)
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">
              Live AI insights from AfricaESG.AI based on your energy, carbon
              and waste metrics.
            </p>

            {aiLoading || ctxLoading ? (
              <p className="text-gray-500 italic mb-2">
                Fetching live AI insights…
              </p>
            ) : aiError ? (
              <p className="text-red-500 text-xs sm:text-sm mb-2">
                {aiError}
              </p>
            ) : null}

            {insights.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed max-h-[320px] overflow-y-auto pr-1">
                {insights.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No AI insights available for environmental metrics.
              </p>
            )}

            {actionChips.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs sm:text-sm text-gray-500 mb-2">
                  Suggested next steps based on these insights:
                </p>
                <div className="flex flex-wrap gap-2">
                  {actionChips.map((chip) => (
                    <span
                      key={chip}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-100"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalCategory;
