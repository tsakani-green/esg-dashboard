// src/pages/EnvironmentalCategory.jsx
import React, { useContext, useState } from "react";
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
import { FaFilePdf, FaLeaf, FaCloud, FaTrash } from "react-icons/fa";
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

const EnvironmentalCategory = () => {
  const { environmentalMetrics, environmentalInsights, loading } =
    useContext(SimulationContext);

  const [emissionsMode, setEmissionsMode] = useState("absolute"); // 'absolute' | 'intensity'

  // ----- Derive labels from series length -----
  const co2Array = environmentalMetrics?.co2Emissions || [100, 80, 50, 20];
  const productionArray = environmentalMetrics?.production || null;

  const periods =
    co2Array && co2Array.length > 0
      ? co2Array.map((_, idx) => `Period ${idx + 1}`)
      : ["Period 1", "Period 2", "Period 3", "Period 4"];

  const wasteLabels =
    environmentalMetrics?.waste &&
    environmentalMetrics.waste.length > 0 &&
    environmentalMetrics.waste.length === periods.length
      ? periods
      : ["Stream 1", "Stream 2", "Stream 3", "Stream 4"];

  // ----- Energy chart -----
  const energyData = {
    labels: periods,
    datasets: [
      {
        data: environmentalMetrics?.energyUsage || [50, 30, 10, 10],
        backgroundColor: ["#16a34a", "#f59e0b", "#22c55e", "#3b82f6"],
        hoverOffset: 6,
      },
    ],
  };

  // ----- Emissions chart: Absolute vs Intensity -----
  const emissionsSeries =
    emissionsMode === "absolute"
      ? co2Array
      : co2Array.map((val, idx) => {
          const prod = productionArray?.[idx];
          if (!prod || prod === 0) return 0;
          // tCO₂e per unit of output
          return Number((val / prod).toFixed(3));
        });

  const emissionsLabel =
    emissionsMode === "absolute"
      ? "Carbon Emissions (tCO₂e)"
      : "Emissions Intensity (tCO₂e per unit of output)";

  const emissionsData = {
    labels: periods,
    datasets: [
      {
        label: emissionsLabel,
        data: emissionsSeries,
        backgroundColor: "#16a34a",
        borderRadius: 4,
        barThickness: 18,
      },
    ],
  };

  // ----- Waste chart -----
  const wasteData = {
    labels: wasteLabels,
    datasets: [
      {
        label: "Waste (tonnes)",
        data: environmentalMetrics?.waste || [50, 80, 35, 70],
        backgroundColor: ["#16a34a", "#f59e0b", "#ef4444", "#3b82f6"],
        borderRadius: 4,
        barThickness: 18,
      },
    ],
  };

  const insights = environmentalInsights || [];

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

  const KpiCard = ({ icon, label, value, unit, helper }) => (
    <div className="flex items-center gap-3 rounded-2xl bg-white border border-emerald-100 shadow-sm px-4 py-3 h-full">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shrink-0">
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-xs text-slate-500 uppercase tracking-wide">
          {label}
        </div>
        <div className="text-lg font-semibold text-slate-900">
          {value != null ? value.toLocaleString() : "N/A"}
          {unit && value != null ? ` ${unit}` : ""}
        </div>
        {helper && (
          <p className="text-[11px] text-slate-500 mt-0.5">{helper}</p>
        )}
      </div>
    </div>
  );

  const totalEnergy = Array.isArray(environmentalMetrics?.energyUsage)
    ? environmentalMetrics.energyUsage.reduce((a, b) => a + b, 0)
    : null;

  const avgEmissions =
    Array.isArray(co2Array) && co2Array.length > 0
      ? Math.round(
          co2Array.reduce((a, b) => a + b, 0) / co2Array.length || 0
        )
      : null;

  const totalWaste = Array.isArray(environmentalMetrics?.waste)
    ? environmentalMetrics.waste.reduce((a, b) => a + b, 0)
    : null;

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight flex items-center gap-2">
              <FaLeaf className="text-green-700" />
              <span>Environmental Performance</span>
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

        {/* KPI summary row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            icon={<FaLeaf size={16} />}
            label="Total Energy (periods)"
            value={totalEnergy}
            unit="kWh"
            helper="Sum of reported energy use across all periods."
          />
          <KpiCard
            icon={<FaCloud size={16} />}
            label="Average CO₂ emissions"
            value={avgEmissions}
            unit="tCO₂e"
            helper="Average emissions across reported periods."
          />
          <KpiCard
            icon={<FaTrash size={16} />}
            label="Total waste"
            value={totalWaste}
            unit="tonnes"
            helper="Combined waste across all streams."
          />
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Charts Section */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Energy */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
                Energy Use by Period
              </h2>
              <p className="text-xs text-gray-500 text-center mb-3">
                Distribution of energy consumption across reporting periods.
              </p>
              <div className="flex-1 h-56 sm:h-64">
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
            </div>

            {/* Emissions with toggle */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  CO₂ Emissions & Intensity
                </h2>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Switch between absolute emissions and emissions intensity per
                unit of production.
              </p>

              {/* Toggle */}
              <div className="flex justify-center mb-3">
                <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-xs shadow-inner">
                  <button
                    className={`px-3 py-1 rounded-full transition-all ${
                      emissionsMode === "absolute"
                        ? "bg-green-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setEmissionsMode("absolute")}
                  >
                    Absolute
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full transition-all ${
                      emissionsMode === "intensity"
                        ? "bg-green-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setEmissionsMode("intensity")}
                  >
                    Intensity
                  </button>
                </div>
              </div>

              <div className="flex-1 h-56 sm:h-64">
                <Bar
                  data={emissionsData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: {
                        grid: { color: "#e5e7eb" },
                        beginAtZero: true,
                        title: {
                          display: true,
                          text:
                            emissionsMode === "absolute"
                              ? "tCO₂e"
                              : "tCO₂e per unit",
                          font: { size: 11 },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Waste */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 md:col-span-2 flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
                Waste Streams (tonnes)
              </h2>
              <p className="text-xs text-gray-500 text-center mb-3">
                Comparative view of key waste streams by tonnage.
              </p>
              <div className="flex-1 h-48 sm:h-56">
                <Bar
                  data={wasteData}
                  options={{
                    indexAxis: "y",
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        beginAtZero: true,
                        grid: { color: "#e5e7eb" },
                        title: {
                          display: true,
                          text: "Tonnes",
                          font: { size: 11 },
                        },
                      },
                      y: { grid: { display: false } },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col lg:sticky lg:top-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              AI Mini Report – Environmental (LIVE)
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">
              Live AI insights from AfricaESG.AI based on your environmental
              metrics (energy, emissions, waste).
            </p>

            {loading ? (
              <p className="text-gray-500 italic">Fetching live AI insights…</p>
            ) : insights.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed max-h-[650px] overflow-y-auto">
                {insights.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No AI insights available for environmental metrics.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalCategory;
