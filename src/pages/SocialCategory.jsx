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
import { useNavigate } from "react-router-dom";
import { SimulationContext } from "../context/SimulationContext";
import { jsPDF } from "jspdf";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const SocialCategory = () => {
  const { socialMetrics, socialInsights, loading } =
    useContext(SimulationContext);
  const navigate = useNavigate();

  const topInsights =
    socialInsights && socialInsights.length > 0 ? socialInsights : [];

  const supplierData = {
    labels: ["EME", "Large", "Medium", "SMME"],
    datasets: [
      {
        label: "Supplier Count",
        data: [
          socialMetrics?.supplierDiversity || 0,
          Math.floor(Math.random() * 50 + 10),
          Math.floor(Math.random() * 30 + 5),
          Math.floor(Math.random() * 25 + 5),
        ],
        backgroundColor: ["#16a34a", "#22c55e", "#f59e0b", "#3b82f6"],
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const humanCapitalData = {
    labels: ["Black", "White", "Asian", "Other"],
    datasets: [
      {
        data: [
          socialMetrics?.employeeEngagement || 0,
          100 - (socialMetrics?.employeeEngagement || 0),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 5),
        ],
        backgroundColor: ["#16a34a", "#22c55e", "#f59e0b", "#3b82f6"],
        hoverOffset: 6,
      },
    ],
  };

  const engagementData = {
    labels: ["Stakeholder Surveys", "Supplier Survey", "CSI"],
    datasets: [
      {
        label: "Community Engagement",
        data: [
          socialMetrics?.communityPrograms || 0,
          Math.floor(Math.random() * 40 + 20),
          Math.floor(Math.random() * 50 + 30),
        ],
        backgroundColor: ["#16a34a", "#22c55e", "#f59e0b"],
        borderRadius: 4,
        barThickness: 14,
      },
    ],
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AfricaESG.AI Social Mini Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Social Metrics:", 14, y);
    y += 8;

    Object.entries(socialMetrics || {}).forEach(([key, value]) => {
      const lines = doc.splitTextToSize(`${key}: ${value}`, 180);
      doc.setFont("helvetica", "normal");
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("AI Mini Report – Social:", 14, y);
    y += 8;

    (topInsights.length > 0
      ? topInsights
      : ["No AI insights available for social metrics."]
    ).forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, 180);
      doc.setFont("helvetica", "normal");
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save("AfricaESG_SocialMiniReport.pdf");
  };

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 w-full gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">
              Social Performance
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Track supplier diversity, human capital and community engagement
              across your social ESG profile.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm md:text-base font-semibold transition-transform hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" /> Download Report
          </button>
        </div>

        {/* Charts & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Supplier Distribution
              </h2>
              <div className="h-48">
                <Bar data={supplierData} options={{ responsive: true }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Human Capital
              </h2>
              <div className="h-48">
                <Pie data={humanCapitalData} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Community Engagement
              </h2>
              <div className="h-48">
                <Bar data={engagementData} />
              </div>
            </div>
          </div>

          {/* AI Report */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              AI Mini Report – Social
            </h2>

            {loading ? (
              <p className="text-gray-500 italic">Loading AI insights...</p>
            ) : topInsights.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed max-h-[600px] overflow-y-auto">
                {topInsights.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No AI insights available for social metrics.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocialCategory;
