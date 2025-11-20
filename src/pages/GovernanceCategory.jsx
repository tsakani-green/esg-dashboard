// src/pages/GovernanceCategory.jsx
import React, { useContext, useEffect, useState } from "react";
import {
  FaFilePdf,
  FaBalanceScale,
  FaShieldAlt,
  FaUserShield,
  FaTruck,
} from "react-icons/fa";
import { jsPDF } from "jspdf";
import { SimulationContext } from "../context/SimulationContext";

// ✅ Same base URL style as Dashboard
const API_BASE_URL = "https://esg-backend-beige.vercel.app";

const GovernanceCategory = () => {
  const { governanceMetrics, governanceInsights, loading: contextLoading } =
    useContext(SimulationContext);

  // Governance summary coming directly from /api/esg-data (updated on upload)
  const [governanceSummary, setGovernanceSummary] = useState(null);

  // LIVE AI governance insights from backend
  const [liveGovInsights, setLiveGovInsights] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  // Fallback if backend insights not available
  const fallbackInsights = governanceInsights || [];

  // --- Load governance summary (from /api/esg-data) ---
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/esg-data`);
        const data = await res.json();
        setGovernanceSummary(data?.mockData?.summary?.governance || null);
      } catch (err) {
        console.error("Error fetching governance summary:", err);
        setGovernanceSummary(null);
      }
    };

    fetchSummary();
  }, []);

  // --- Load LIVE governance insights (from /api/governance-insights) ---
  useEffect(() => {
    const fetchLiveGovInsights = async () => {
      setLiveLoading(true);
      setLiveError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/governance-insights`);
        const data = await res.json();

        if (Array.isArray(data.insights)) {
          setLiveGovInsights(data.insights.slice(0, 10)); // top 10, just in case
        } else {
          setLiveGovInsights([]);
        }
      } catch (err) {
        console.error("Live governance AI error:", err);
        setLiveError("Failed to load live AI governance insights.");
        setLiveGovInsights([]);
      }

      setLiveLoading(false);
    };

    fetchLiveGovInsights();
  }, []);

  // Helpers
  const metricsVal = (field, fallback = "N/A") =>
    governanceMetrics && governanceMetrics[field] != null
      ? governanceMetrics[field]
      : fallback;

  const summaryVal = (field, fallback = "N/A") =>
    governanceSummary && governanceSummary[field] != null
      ? governanceSummary[field]
      : fallback;

  // Badge style helper
  const valueBadgeClass = (value) => {
    if (!value && value !== 0) {
      return "bg-gray-100 text-gray-500 border border-gray-200";
    }
    const v = String(value).toLowerCase();

    if (
      v.includes("yes") ||
      v.includes("compliant") ||
      v.includes("iso") ||
      v.includes("aligned") ||
      v.includes("high")
    ) {
      return "bg-emerald-50 text-emerald-800 border border-emerald-200";
    }
    if (v.includes("no") || v.includes("incident") || v.includes("risk")) {
      return "bg-red-50 text-red-700 border border-red-200";
    }
    return "bg-amber-50 text-amber-800 border border-amber-200";
  };

  // Build the sections using REAL fields from uploaded ESG data
  const governanceSections = [
    {
      key: "corporate",
      title: "Corporate Governance",
      description:
        "Board governance, reporting standards and governance-related training.",
      icon: <FaBalanceScale className="text-orange-600" />,
      accent: "bg-orange-500",
      rows: [
        {
          metric: "Reporting Standard / Framework",
          value:
            summaryVal(
              "corporateGovernance",
              metricsVal("corporateGovernance")
            ) || "Compliant",
        },
        {
          metric: "ISO 9001 Compliance",
          value: summaryVal("iso9001Compliance", metricsVal("isoCompliance")),
        },
        {
          metric: "Governance Trainings Delivered",
          value: summaryVal("totalGovernanceTrainings"),
        },
        {
          metric: "Environmental Trainings Delivered",
          value: summaryVal("totalEnvironmentalTrainings"),
        },
      ],
    },
    {
      key: "ethics",
      title: "Business Ethics & Compliance",
      description:
        "Code of ethics, corruption risk and overall compliance performance.",
      icon: <FaShieldAlt className="text-emerald-600" />,
      accent: "bg-emerald-500",
      rows: [
        {
          metric: "Business Ethics Rating",
          value: summaryVal("businessEthics"),
        },
        {
          metric: "Compliance Findings (No.)",
          value: summaryVal("totalComplianceFindings"),
        },
        {
          metric: "Code of Ethics / Anti-Bribery Policy",
          value: metricsVal("codeOfEthics", "Yes/No"),
        },
      ],
    },
    {
      key: "privacy",
      title: "Data Privacy & Cyber Security",
      description:
        "Data protection controls and information security policies.",
      icon: <FaUserShield className="text-sky-600" />,
      accent: "bg-sky-500",
      rows: [
        {
          metric: "Data Privacy Status",
          value: metricsVal("dataPrivacy", "Compliant"),
        },
        {
          metric: "Information Security Policy",
          value: metricsVal("informationSecurityPolicy", "Yes/No"),
        },
      ],
    },
    {
      key: "supply-chain",
      title: "Supply Chain Governance",
      description:
        "Supplier ESG compliance and audit coverage across the value chain.",
      icon: <FaTruck className="text-amber-600" />,
      accent: "bg-amber-500",
      rows: [
        {
          metric: "% Suppliers Meeting ESG / Sustainability Criteria",
          value: metricsVal("supplierSustainabilityCompliance"),
        },
        {
          metric: "% Audited Suppliers Completed",
          value: metricsVal("supplierAuditsCompleted"),
        },
        {
          metric: "Supplier ESG Compliance",
          value: metricsVal("supplierEsgCompliance"),
        },
      ],
    },
  ];

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AfricaESG.AI Governance Mini Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    // Governance sections (from uploaded data)
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Governance Metrics (from latest ESG upload):", 14, y);
    y += 8;

    governanceSections.forEach((section) => {
      doc.setFont("helvetica", "bold");
      doc.text(section.title, 14, y);
      y += 6;

      section.rows.forEach((row) => {
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(
          `${row.metric}: ${row.value ?? "N/A"}`,
          180
        );
        doc.text(lines, 14, y);
        y += lines.length * 6;
      });

      y += 4;
    });

    // AI mini report (prefer live, then fallback)
    const reportInsights =
      liveGovInsights.length > 0 ? liveGovInsights : fallbackInsights;
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("AI Mini Report – Governance:", 14, y);
    y += 8;

    (reportInsights.length > 0
      ? reportInsights
      : ["No AI insights available."]
    ).forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, 180);
      doc.setFont("helvetica", "normal");
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save("AfricaESG_GovernanceMiniReport.pdf");
  };

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-900 tracking-tight">
              Governance Performance
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
              Corporate governance, ethics, data privacy and supply chain
              governance – populated from your latest ESG upload and enhanced
              with live AI insights.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-sm md:text-base font-semibold transition-transform hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" />
            <span>Generate Report (PDF)</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Governance cards grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {governanceSections.map((section) => (
                <div
                  key={section.key}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full"
                >
                  {/* Accent bar */}
                  <div className={`${section.accent} h-1.5 w-full`} />

                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                        {section.icon}
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                          {section.title}
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 space-y-2 border-t border-gray-100 pt-3">
                      {section.rows.map((row) => (
                        <div
                          key={row.metric}
                          className="flex items-start justify-between gap-3"
                        >
                          <p className="text-xs sm:text-sm text-gray-700 pr-2">
                            {row.metric}
                          </p>
                          <span
                            className={`whitespace-nowrap inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${valueBadgeClass(
                              row.value
                            )}`}
                          >
                            {row.value ?? "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights – right column */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col lg:sticky lg:top-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              AI Mini Report – Governance
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">
              Live AI insights from the backend, with fallback to simulation
              context if needed.
            </p>

            {/* Loading state */}
            {liveLoading || contextLoading ? (
              <p className="text-gray-500 italic mb-2">
                Fetching AI insights…
              </p>
            ) : null}

            {/* Error state */}
            {liveError ? (
              <p className="text-red-500 text-sm mb-2">{liveError}</p>
            ) : null}

            {/* Insights display: prefer live API, then fallback */}
            {liveGovInsights.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed max-h-[650px] overflow-y-auto">
                {liveGovInsights.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            ) : fallbackInsights.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed max-h-[650px] overflow-y-auto">
                {fallbackInsights.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No AI insights available for governance metrics.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceCategory;
