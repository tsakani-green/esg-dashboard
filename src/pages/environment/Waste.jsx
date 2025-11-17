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

export default function Waste() {
  const { environmentalMetrics, environmentalInsights, loading } =
    useContext(SimulationContext);

  const [wasteValues, setWasteValues] = useState([]);
  const [productionValues, setProductionValues] = useState([]);
  const [intensityValues, setIntensityValues] = useState([]);
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
    // Adjust field names to match your backend shape if needed
    const waste = (environmentalMetrics?.waste || []).concat(
      Array(12 - (environmentalMetrics?.waste?.length || 0)).fill(0)
    );
    const production = (environmentalMetrics?.production || []).concat(
      Array(12 - (environmentalMetrics?.production?.length || 0)).fill(0)
    );
    const intensity = waste.map((w, i) => {
      const p = production[i] || 1;
      return parseFloat((w / p).toFixed(2));
    });

    setWasteValues(waste);
    setProductionValues(production);
    setIntensityValues(intensity);

    const insights =
      environmentalInsights && environmentalInsights.length > 0
        ? environmentalInsights.slice(0, 5)
        : [];

    setTopInsights(insights);
  }, [environmentalMetrics, environmentalInsights]);

  const wasteData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Waste Generated (tonnes)",
        data: wasteValues,
        borderColor: "#f97316",
        backgroundColor: "rgba(249,115,22,0.2)",
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: "Production Output (Tonnes)",
        data: productionValues,
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
        label: "Waste Intensity (tonnes / tonne product)",
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
    doc.text("AfricaESG.AI Waste Performance Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;
    doc.text("Waste Generated & Production:", 14, y);
    y += 8;

    monthlyLabels.forEach((label, idx) => {
      const line = `${label}: Waste ${wasteValues[idx] || 0} tonnes, Production ${
        productionValues[idx] || 0
      } tonnes, Intensity ${intensityValues[idx] || 0} t/t product`;
      const lines = doc.splitTextToSize(line, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("AI Mini Report on Waste Performance:", 14, y);
    y += 8;

    (topInsights.length > 0
      ? topInsights
      : ["No AI insights available for waste performance."]
    ).forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, 180);
      doc.setFont("helvetica", "normal");
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save("AfricaESG_WasteReport.pdf");
  };

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900">
              Waste Performance
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Monitor waste generation and intensity to support circularity and
              zero-waste initiatives.
            </p>
          </div>

          {/* Only download button, no back arrow */}
          <button
            onClick={handleDownloadReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm md:text-base font-medium transition-transform hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" />
            Download Waste Report
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section: Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waste vs Production Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Waste Generated vs Production
              </h2>
              <div className="h-64 sm:h-72">
                <Line
                  data={wasteData}
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

            {/* Waste Intensity Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Waste Intensity (t / t product)
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              AI Mini Report on Waste Performance
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
