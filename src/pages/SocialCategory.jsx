// src/pages/SocialCategory.jsx
import React, { useContext, useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
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
  FaUsers,
  FaHandshake,
  FaGlobeAfrica,
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

// --- Helper: status badge based on value vs target ---
const getStatus = (value, target) => {
  if (value == null || target == null) {
    return { label: "No data", color: "bg-gray-100 text-gray-600" };
  }

  const ratio = value / target;

  if (ratio >= 1) {
    return { label: "On track", color: "bg-emerald-50 text-emerald-700" };
  }
  if (ratio >= 0.8) {
    return { label: "Watch", color: "bg-amber-50 text-amber-700" };
  }
  return { label: "Off track", color: "bg-red-50 text-red-700" };
};

// --- Helper: derive simple “actions” from AI insights ---
const deriveActionsFromInsights = (insights) => {
  const text = insights.join(" ").toLowerCase();
  const actions = new Set();

  if (text.includes("supplier") || text.includes("diversity")) {
    actions.add("Review supplier panel");
    actions.add("Set diversity spend targets");
  }
  if (text.includes("engagement") || text.includes("employee")) {
    actions.add("Run engagement pulse survey");
    actions.add("Co-create action plan with HR");
  }
  if (text.includes("community") || text.includes("social investment")) {
    actions.add("Prioritise community programmes");
    actions.add("Measure community outcomes");
  }
  if (text.includes("training") || text.includes("capacity")) {
    actions.add("Roll out targeted training");
  }

  if (actions.size === 0 && insights.length > 0) {
    actions.add("Translate insights into 3–5 concrete actions");
  }

  return Array.from(actions);
};

const SocialCategory = () => {
  const {
    socialMetrics,
    socialInsights: ctxSocialInsights,
    loading,
  } = useContext(SimulationContext);

  const supplierDiversity = socialMetrics?.supplierDiversity ?? 3;
  const employeeEngagement = socialMetrics?.employeeEngagement ?? 70;
  const communityPrograms = socialMetrics?.communityPrograms ?? 40;

  // Local AI insight state (LIVE from backend)
  const [insights, setInsights] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Fetch live social insights from backend (similar to Dashboard)
  useEffect(() => {
    const loadInsights = async () => {
      try {
        setAiLoading(true);
        setAiError(null);

        const res = await fetch(`${API_BASE_URL}/api/social-insights`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const incoming =
          Array.isArray(data.insights) && data.insights.length > 0
            ? data.insights
            : [];

        if (incoming.length > 0) {
          setInsights(incoming.slice(0, 5));
        } else if (Array.isArray(ctxSocialInsights)) {
          // fallback to context if backend returns nothing
          setInsights(ctxSocialInsights.slice(0, 5));
        } else {
          setInsights([]);
        }

        setAiLoading(false);
      } catch (err) {
        console.error("Error loading social insights:", err);
        // last fallback: SimulationContext insights
        if (Array.isArray(ctxSocialInsights)) {
          setInsights(ctxSocialInsights.slice(0, 5));
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

  const diversityData = {
    labels: ["Diverse Suppliers", "Other Suppliers"],
    datasets: [
      {
        data: [supplierDiversity, Math.max(0, 100 - supplierDiversity)],
        backgroundColor: ["#16a34a", "#e5e7eb"],
        hoverOffset: 6,
      },
    ],
  };

  const engagementData = {
    labels: ["Employee Engagement", "Community Programmes"],
    datasets: [
      {
        label: "Score (%)",
        data: [employeeEngagement, communityPrograms],
        backgroundColor: ["#3b82f6", "#f59e0b"],
        borderRadius: 4,
        barThickness: 32,
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

    doc.save("AfricaESG_SocialMiniReport.pdf");
  };

  // KPI card with target + status + hint
  const KpiCard = ({ icon, label, value, unit, target, hint }) => {
    const status = target != null ? getStatus(value, target) : null;

    return (
      <div className="flex flex-col justify-between rounded-2xl bg-white/80 backdrop-blur border border-sky-100 shadow-sm px-4 py-4 h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
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
          {value != null ? value : "N/A"}
          {unit && value != null ? unit : ""}
        </div>
        {target != null && (
          <div className="text-[11px] text-slate-500 mt-0.5">
            Target: {target}
            {unit}
          </div>
        )}
        {hint && (
          <div className="text-[11px] text-slate-500 mt-1 leading-snug">
            {hint}
          </div>
        )}
      </div>
    );
  };

  // Derived action chips from insights
  const actionChips = deriveActionsFromInsights(insights);

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight">
              Social Performance
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
              Supplier diversity, employee engagement and community impact –
              populated from your latest ESG upload and enhanced with live AI
              insights.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-sm md:text-base font-semibold transition-transform hover:scale-105"
          >
            <FaFilePdf className="text-white text-base md:text-lg" />
            <span>Download Report (PDF)</span>
          </button>
        </div>

        {/* KPI summary row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            icon={<FaGlobeAfrica size={16} />}
            label="Supplier Diversity"
            value={supplierDiversity}
            unit="%"
            target={10}
            hint="Share of procurement spend with diverse suppliers."
          />
          <KpiCard
            icon={<FaUsers size={16} />}
            label="Employee Engagement"
            value={employeeEngagement}
            unit="%"
            target={80}
            hint="Overall engagement / satisfaction score."
          />
          <KpiCard
            icon={<FaHandshake size={16} />}
            label="Community Programmes"
            value={communityPrograms}
            unit="%"
            target={60}
            hint="Coverage and effectiveness of community programmes."
          />
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Charts Section */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Diversity pie */}
            <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
                Supplier Diversity (% spend)
              </h2>
              <p className="text-xs text-gray-500 text-center mb-3">
                Split of procurement spend across diverse vs other suppliers.
              </p>
              <div className="h-56 sm:h-64">
                <Pie
                  data={diversityData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              </div>

              {/* Small numeric breakdown */}
              <table className="mt-4 w-full text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-1">Category</th>
                    <th className="text-right py-1">Share of spend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="py-1">Diverse suppliers</td>
                    <td className="py-1 text-right">
                      {supplierDiversity.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">Other suppliers</td>
                    <td className="py-1 text-right">
                      {Math.max(0, 100 - supplierDiversity).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Engagement & community bar */}
            <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
                Engagement & Community scores
              </h2>
              <p className="text-xs text-gray-500 text-center mb-3">
                Comparative view of employee engagement and community programme
                strength.
              </p>
              <div className="h-56 sm:h-64">
                <Bar
                  data={engagementData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false" } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { color: "#e5e7eb" } },
                    },
                  }}
                />
              </div>

              {/* Table breakdown */}
              <table className="mt-4 w-full text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-1">Metric</th>
                    <th className="text-right py-1">Score (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="py-1">Employee engagement</td>
                    <td className="py-1 text-right">
                      {employeeEngagement.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">Community programmes</td>
                    <td className="py-1 text-right">
                      {communityPrograms.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white/95 backdrop-blur p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col lg:sticky lg:top-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              AI Mini Report – Social (LIVE)
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">
              Live AI insights from AfricaESG.AI based on your social metrics –
              diversity, engagement and community impact.
            </p>

            {aiLoading || loading ? (
              <p className="text-gray-500 italic mb-2">
                Fetching live AI insights…
              </p>
            ) : aiError ? (
              <p className="text-red-500 text-xs sm:text-sm mb-2">
                {aiError}
              </p>
            ) : null}

            {insights.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed max-h-[320px] overflow-y-auto pr-1">
                {insights.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No AI insights available for social metrics.
              </p>
            )}

            {/* Suggested actions from insights */}
            {actionChips.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs sm:text-sm text-gray-500 mb-2">
                  Suggested next steps based on these insights:
                </p>
                <div className="flex flex-wrap gap-2">
                  {actionChips.map((chip) => (
                    <span
                      key={chip}
                      className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] border border-sky-100"
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

export default SocialCategory;
