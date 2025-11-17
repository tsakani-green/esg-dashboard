import React, { useContext } from "react";
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
import { FaFilePdf } from "react-icons/fa";
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

  const energyData = {
    labels: ["Solar", "Diesel", "Electricity", "Coal"],
    datasets: [
      {
        data: environmentalMetrics?.energyUsage || [50, 30, 10, 10],
        backgroundColor: ["#16a34a", "#f59e0b", "#22c55e", "#3b82f6"],
        hoverOffset: 6,
      },
    ],
  };

  const emissionsData = {
    labels: ["Coal", "Electricity", "Diesel", "Solar"],
    datasets: [
      {
        label: "Carbon Emissions (tCO₂e)",
        data: environmentalMetrics?.emissions || [100, 80, 50, 20],
        backgroundColor: "#16a34a",
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const wasteData = {
    labels: ["Plastic", "Food", "Toxic Liquids", "General"],
    datasets: [
      {
        label: "Waste (tonnes)",
        data: environmentalMetrics?.waste || [50, 80, 35, 70],
        backgroundColor: ["#16a34a", "#f59e0b", "#ef4444", "#3b82f6"],
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const insights =
    environmentalInsights && environmentalInsights.length > 0
      ? environmentalInsights
      : [];

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
    doc.text("AI Mini Report:", 14, y);
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

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">
              Environmental Performance
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Energy mix, carbon emissions and waste streams across your
              operations, powered by AfricaESG.AI.
            </p>
          </div>

          {/* Removed Back/Forward Arrows */}
          <button
            onClick={handleDownloadReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm md:text-base font-semibold transition-transform hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" />{" "}
            Download Report
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Energy Mix (MWh)
              </h2>
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
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Carbon Emissions (tCO₂e)
              </h2>
              <div className="h-56 sm:h-64">
                <Bar
                  data={emissionsData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { color: "#e5e7eb" }, beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 md:col-span-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Waste Streams (tonnes)
              </h2>
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
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col lg:sticky lg:top-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              AI Mini Report – Environmental
            </h2>

            {loading ? (
              <p className="text-gray-500 italic">Loading AI insights...</p>
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
