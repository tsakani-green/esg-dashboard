import React, { useContext } from "react";
import { FaFilePdf } from "react-icons/fa";
import { SimulationContext } from "../context/SimulationContext";
import { jsPDF } from "jspdf";

const GovernanceCategory = () => {
  const { governanceMetrics, governanceInsights, loading } =
    useContext(SimulationContext);

  const topInsights =
    governanceInsights && governanceInsights.length > 0
      ? governanceInsights
      : [];

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AfricaESG.AI Governance Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Governance Metrics:", 14, y);
    y += 8;

    if (governanceMetrics) {
      Object.entries(governanceMetrics).forEach(([key, value]) => {
        const lines = doc.splitTextToSize(`${key}: ${value}`, 180);
        doc.setFont("helvetica", "normal");
        doc.text(lines, 14, y);
        y += lines.length * 6;
      });
    }

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("AI Insights:", 14, y);
    y += 8;

    (topInsights.length > 0
      ? topInsights
      : ["No AI insights available for governance."]
    ).forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, 180);
      doc.setFont("helvetica", "normal");
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save("AfricaESG_GovernanceReport.pdf");
  };

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 w-full gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">
              Governance Performance
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Monitor governance structures, compliance posture and ethical
              controls across your ESG framework.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm md:text-base font-semibold transition-transform hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" /> Download Governance Report
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Governance Metrics */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
              Governance Metrics
            </h2>

            <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Corporate Governance
                </h3>
                <p>
                  Corporate Governance:{" "}
                  {governanceMetrics?.corporateGovernance || "N/A"}
                </p>
                <p>
                  Data Privacy: {governanceMetrics?.dataPrivacy || "N/A"}
                </p>
                <p>
                  ISO Compliance: {governanceMetrics?.isoCompliance || "N/A"}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Business Ethics & Compliance
                </h3>
                <p>ESG Integration: Yes</p>
                <p>Supply Chain: No</p>
                <p>Audit Compliance: Yes</p>
              </section>
            </div>
          </div>

          {/* AI Mini Report */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              AI Mini Report on Governance
            </h2>

            {loading ? (
              <p className="text-gray-500 italic">Loading AI insights...</p>
            ) : topInsights.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed max-h-[600px] overflow-y-auto">
                {topInsights.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No AI insights available for governance.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default GovernanceCategory;
