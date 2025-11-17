import React, { useContext, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FaFilePdf } from "react-icons/fa";
import { jsPDF } from "jspdf";
import { SimulationContext } from "../../context/SimulationContext";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function Carbon() {
  const { environmentalMetrics, environmentalInsights, loading } =
    useContext(SimulationContext);

  const [emissionDataValues, setEmissionDataValues] = useState([]);
  const [productionDataValues, setProductionDataValues] = useState([]);
  const [carbonIntensityValues, setCarbonIntensityValues] = useState([]);
  const [topInsights, setTopInsights] = useState([]);

  const monthlyLabels = [
    "Jan-24",
    "Feb-24",
    "Mar-24",
    "Apr-24",
    "May-24",
    "Jun-24",
    "Jul-24",
    "Aug-24",
    "Sep-24",
    "Oct-24",
    "Nov-24",
    "Dec-24",
  ];

  useEffect(() => {
    const emissions = (environmentalMetrics?.co2Emissions || []).concat(
      Array(12 - (environmentalMetrics?.co2Emissions?.length || 0)).fill(0)
    );
    const production = (environmentalMetrics?.production || []).concat(
      Array(12 - (environmentalMetrics?.production?.length || 0)).fill(0)
    );
    const intensity = emissions.map((e, i) => {
      const p = production[i] || 1;
      return parseFloat((e / p).toFixed(2));
    });

    setEmissionDataValues(emissions);
    setProductionDataValues(production);
    setCarbonIntensityValues(intensity);

    const insights =
      environmentalInsights && environmentalInsights.length > 0
        ? environmentalInsights.slice(0, 5)
        : [];

    setTopInsights(insights);
  }, [environmentalMetrics, environmentalInsights]);

  const emissionData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "CO₂ Emissions (tCO₂e)",
        data: emissionDataValues,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.2)",
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: "Production Output (Tonnes)",
        data: productionDataValues,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.2)",
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const intensityData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Carbon Intensity (tCO₂e/Tonnes)",
        data: carbonIntensityValues,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AfricaESG.AI Carbon Emissions Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;
    doc.text("Monthly CO₂ Emissions & Production:", 14, y);
    y += 8;

    monthlyLabels.forEach((label, idx) => {
      const line = `${label}: Emissions ${emissionDataValues[idx] || 0} tCO₂e, Production ${
        productionDataValues[idx] || 0
      } tonnes, Intensity ${carbonIntensityValues[idx] || 0} tCO₂e/tonne`;
      const lines = doc.splitTextToSize(line, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("AI Mini Report on Carbon Performance:", 14, y);
    y += 8;

    (topInsights.length > 0
      ? topInsights
      : ["No AI insights available for this dataset."]
    ).forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, 180);
      doc.setFont("helvetica", "normal");
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save("AfricaESG_CarbonEmissionsReport.pdf");
  };

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">
              Carbon Emissions
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Track emissions trends, production output and carbon intensity
              across the 2024 period.
            </p>
          </div>

          {/* Removed Back/Forward arrows, keep only download */}
          <button
            onClick={handleDownloadReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg 
              shadow-md flex items-center gap-2 text-sm md:text-base font-medium 
              transition-all hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" />
            Download Carbon Report
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section: Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emissions vs Production Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                CO₂ Emissions vs Production
              </h2>
              <div className="h-64 sm:h-72">
                <Line
                  data={emissionData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { color: "#e5e7eb" } },
                    },
                  }}
                />
              </div>
            </div>

            {/* Carbon Intensity Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Carbon Intensity (tCO₂e / tonne)
              </h2>
              <div className="h-64 sm:h-72">
                <Line
                  data={intensityData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { color: "#e5e7eb" } },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Section: AI Insights */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              AI Mini Report on Carbon Performance
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base leading-relaxed max-h-[650px] overflow-y-auto">
              {loading ? (
                <li className="text-gray-400">Loading AI insights...</li>
              ) : topInsights.length > 0 ? (
                topInsights.map((note, index) => <li key={index}>{note}</li>)
              ) : (
                <li className="text-gray-400">
                  No AI insights available for this dataset.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
