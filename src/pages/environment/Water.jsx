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

export default function Water() {
  const { environmentalMetrics, environmentalInsights, loading } =
    useContext(SimulationContext);

  const [withdrawalValues, setWithdrawalValues] = useState([]);
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
    const withdrawals = (environmentalMetrics?.waterUse || []).concat(
      Array(12 - (environmentalMetrics?.waterUse?.length || 0)).fill(0)
    );
    const production = (environmentalMetrics?.production || []).concat(
      Array(12 - (environmentalMetrics?.production?.length || 0)).fill(0)
    );

    const intensity = withdrawals.map((w, i) => {
      const p = production[i] || 1;
      return parseFloat((w / p).toFixed(2));
    });

    setWithdrawalValues(withdrawals);
    setProductionValues(production);
    setIntensityValues(intensity);

    const insights =
      environmentalInsights && environmentalInsights.length > 0
        ? environmentalInsights.slice(0, 5)
        : [];

    setTopInsights(insights);
  }, [environmentalMetrics, environmentalInsights]);

  const withdrawalData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Water Withdrawal (kL)",
        data: withdrawalValues,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14,165,233,0.2)",
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
        label: "Water Intensity (kL / tonne)",
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
    doc.text("AfricaESG.AI Water Performance Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;
    doc.text("Water Withdrawal & Production:", 14, y);
    y += 8;

    monthlyLabels.forEach((label, idx) => {
      const line = `${label}: Withdrawal ${
        withdrawalValues[idx] || 0
      } kL, Production ${productionValues[idx] || 0} tonnes, Intensity ${
        intensityValues[idx] || 0
      } kL/tonne`;
      const lines = doc.splitTextToSize(line, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("AI Mini Report on Water Performance:", 14, y);
    y += 8;

    (topInsights.length > 0
      ? topInsights
      : ["No AI insights available for water performance."]
    ).forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, 180);
      doc.setFont("helvetica", "normal");
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save("AfricaESG_WaterReport.pdf");
  };

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900">
              Water Performance
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Track water withdrawal and intensity trends across your key
              facilities and production lines.
            </p>
          </div>

          {/* Only download button, no back arrow */}
          <button
            onClick={handleDownloadReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm md:text-base font-medium transition-transform hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" />
            Download Water Report
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section: Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Withdrawal vs Production Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Water Withdrawal vs Production
              </h2>
              <div className="h-64 sm:h-72">
                <Line
                  data={withdrawalData}
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

            {/* Water Intensity Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Water Intensity (kL / tonne)
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
              AI Mini Report on Water Performance
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
