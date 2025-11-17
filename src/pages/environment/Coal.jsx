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
import { SimulationContext } from "../../context/SimulationContext";
import { jsPDF } from "jspdf";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function Coal() {
  const { environmentalMetrics, environmentalInsights, loading } =
    useContext(SimulationContext);

  const [coalUseValues, setCoalUseValues] = useState([]);
  const [emissionValues, setEmissionValues] = useState([]);
  const [intensityValues, setIntensityValues] = useState([]);
  const [topInsights, setTopInsights] = useState([]);

  const monthlyLabels = [
    "Jan-24", "Feb-24", "Mar-24", "Apr-24", "May-24", "Jun-24",
    "Jul-24", "Aug-24", "Sep-24", "Oct-24", "Nov-24", "Dec-24",
  ];

  useEffect(() => {
    const coalUse = (environmentalMetrics?.coalUse || []).concat(
      Array(12 - (environmentalMetrics?.coalUse?.length || 0)).fill(0)
    );
    const emissions = (environmentalMetrics?.co2Emissions || []).concat(
      Array(12 - (environmentalMetrics?.co2Emissions?.length || 0)).fill(0)
    );

    const intensity = coalUse.map((c, i) => {
      const e = emissions[i] || 1;
      return parseFloat((e / (c || 1)).toFixed(2));
    });

    setCoalUseValues(coalUse);
    setEmissionValues(emissions);
    setIntensityValues(intensity);

    const insights =
      environmentalInsights && environmentalInsights.length > 0
        ? environmentalInsights.slice(0, 5)
        : [];

    setTopInsights(insights);
  }, [environmentalMetrics, environmentalInsights]);

  const coalData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Coal Consumption (tonnes)",
        data: coalUseValues,
        borderColor: "#374151",
        backgroundColor: "rgba(55,65,81,0.2)",
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: "CO₂ Emissions (tCO₂e)",
        data: emissionValues,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.2)",
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const intensityData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Carbon Intensity (tCO₂e / tonne coal)",
        data: intensityValues,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
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
    doc.text("AfricaESG.AI Coal Emissions Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;
    doc.text("Coal Consumption & CO₂ Emissions:", 14, y);
    y += 8;

    monthlyLabels.forEach((label, idx) => {
      const line = `${label}: Coal ${coalUseValues[idx] || 0} tonnes, Emissions ${
        emissionValues[idx] || 0
      } tCO₂e, Intensity ${intensityValues[idx] || 0} tCO₂e/t coal`;

      const lines = doc.splitTextToSize(line, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("AI Mini Report on Coal Emissions:", 14, y);
    y += 8;

    (topInsights.length > 0
      ? topInsights
      : ["No AI insights available for coal emissions."]
    ).forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save("AfricaESG_CoalReport.pdf");
  };

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900">
              Coal Consumption & Emissions
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Understand the relationship between coal usage and associated
              carbon emissions across your operations.
            </p>
          </div>

          {/* Removed back arrow, kept only download */}
          <button
            onClick={handleDownloadReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md 
              flex items-center gap-2 text-sm md:text-base font-medium transition-all hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" />
            Download Coal Report
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">

            {/* Coal vs Emissions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Coal Consumption vs CO₂ Emissions
              </h2>

              <div className="h-64 sm:h-72">
                <Line
                  data={coalData}
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

            {/* Intensity */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Carbon Intensity (tCO₂e / tonne coal)
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

          {/* Right: AI Insights */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              AI Mini Report on Coal Emissions
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
