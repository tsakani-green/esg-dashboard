// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFilePdf,
  FaCloud,
  FaLeaf,
  FaCoins,
  FaCloud as FaCloudIcon,
  FaIndustry,
  FaLightbulb,
} from "react-icons/fa";
import CategoryCard from "../components/CategoryCard";
import KpiCard from "../components/KpiCard";
import { jsPDF } from "jspdf";
import { SimulationContext } from "../context/SimulationContext";

// Base KPI structure for category cards
const initialKpis = [
  {
    category: "Environmental",
    color: "green",
    metrics: [
      { title: "Energy", unit: "kWh", value: 25000000 },
      { title: "Water", unit: "kL", value: 150000 },
      { title: "Carbon Emissions", unit: "tonnes", value: 250000 },
      { title: "Waste", unit: "tonnes", value: 5000 },
      { title: "Renewable Energy", unit: "kWh", value: 8000000 },
      { title: "Carbon Offsets", unit: "tonnes", value: 15000 },
    ],
  },
  {
    category: "Social",
    color: "blue",
    metrics: [
      { title: "Supplier Diversity & Inclusion", unit: "%", value: 3 },
      { title: "Customer Satisfaction", unit: "%", value: 85 },
      { title: "Human Capital", unit: "%", value: 92 },
      { title: "Community Engagement", unit: "%", value: 75 },
    ],
  },
  {
    category: "Governance",
    color: "orange",
    metrics: [
      { title: "Corporate Governance", unit: "Compliant", value: "Yes" },
      { title: "ISO 9001 Compliance", unit: "Compliant", value: "Yes" },
      {
        title: "Business Ethics & Transparency",
        unit: "Compliant",
        value: "Yes",
      },
      {
        title: "Data Privacy & Cyber Security",
        unit: "Compliant",
        value: "Yes",
      },
      { title: "ESG Integration", unit: "Compliant", value: "Yes" },
      { title: "Supply Chain", unit: "Compliant", value: "No" },
    ],
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    environmentalInsights,
    socialInsights,
    governanceInsights,
    refreshAll,
    loading,
    error,
  } = useContext(SimulationContext);

  // --- ESG Summary ---
  const [esgSummary, setEsGSummary] = useState({
    environmental: "Loading...",
    social: "Loading...",
    governance: "Loading...",
  });

  // Category KPI cards
  const [kpis, setKpis] = useState(initialKpis);

  // --- KPI headline States ---
  const [carbonTax, setCarbonTax] = useState(0);
  const [prevCarbonTax, setPrevCarbonTax] = useState(null);

  const [taxAllowances, setTaxAllowances] = useState(0);
  const [prevTaxAllowances, setPrevTaxAllowances] = useState(null);

  const [carbonCredits, setPrevCarbonCredits] = useState(0);
  const [prevCarbonCredits, setPrevPrevCarbonCredits] = useState(null);

  const [energySavings, setEnergySavings] = useState(0);
  const [prevEnergySavings, setPrevEnergySavings] = useState(null);

  // --- % change indicator ---
  const renderIndicator = (current, previous) => {
    if (previous === null || previous === undefined) return null;

    const diff = current - previous;
    let pctChange;

    if (previous === 0) {
      pctChange = current === 0 ? 0 : 100;
    } else {
      pctChange = (diff / previous) * 100;
    }

    const pctLabel = `${diff > 0 ? "+" : ""}${pctChange.toFixed(1)}%`;

    if (diff > 0) {
      return (
        <div className="flex items-center gap-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="text-green-600"
          >
            <path
              d="M4 16 L12 8 L20 16"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[11px] text-green-700 font-semibold">
            {pctLabel}
          </span>
        </div>
      );
    }

    if (diff < 0) {
      return (
        <div className="flex items-center gap-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="text-red-600"
          >
            <path
              d="M4 8 L12 16 L20 8"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[11px] text-red-600 font-semibold">
            {pctLabel}
          </span>
        </div>
      );
    }

    return (
      <span className="text-[11px] text-gray-500 font-semibold">
        0.0%
      </span>
    );
  };

  const safeNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // ---------- helper: apply backend payload (numbers + category cards) ----------
  const applyBackendPayload = (data) => {
    if (!data || !data.mockData) return;

    const { mockData } = data;
    const summary = mockData.summary || {};
    const metrics = mockData.metrics || {};
    const envMetrics = mockData.environmentalMetrics || {};
    const socMetrics = mockData.socialMetrics || {};
    const govMetrics = mockData.governanceMetrics || {};

    // ESG summary text
    setEsGSummary({
      environmental: summary.environmental
        ? `Energy: ${summary.environmental.totalEnergyConsumption?.toLocaleString()} kWh, Renewable Share: ${
            summary.environmental.renewableEnergyShare ?? 0
          }%, Carbon Emissions: ${
            summary.environmental.carbonEmissions?.toLocaleString() ?? 0
          } tonnes`
        : "Data unavailable",
      social: summary.social
        ? `Supplier Diversity: ${
            summary.social.supplierDiversity ?? 0
          }%, Customer Satisfaction: ${
            summary.social.customerSatisfaction ?? 0
          }%, Human Capital: ${summary.social.humanCapital ?? 0}%`
        : "Data unavailable",
      governance: summary.governance
        ? `Corporate Governance: ${
            summary.governance.corporateGovernance || "N/A"
          }, ISO 9001 Compliance: ${
            summary.governance.iso9001Compliance || "N/A"
          }, Business Ethics: ${summary.governance.businessEthics || "N/A"}`
        : "Data unavailable",
    });

    // Headline KPIs – keep previous for trend display
    setPrevCarbonTax((prev) => (prev === null ? metrics.carbonTax || 0 : prev));
    setPrevTaxAllowances((prev) =>
      prev === null ? metrics.taxAllowances || 0 : prev
    );
    setPrevPrevCarbonCredits((prev) =>
      prev === null ? metrics.carbonCredits || 0 : prev
    );
    setPrevEnergySavings((prev) =>
      prev === null ? metrics.energySavings || 0 : prev
    );

    setCarbonTax(metrics.carbonTax || 0);
    setTaxAllowances(metrics.taxAllowances || 0);
    setPrevCarbonCredits(metrics.carbonCredits || 0);
    setEnergySavings(metrics.energySavings || 0);

    // ---- dynamically rebuild Category KPIs from uploaded data ----
    const updatedKpis = initialKpis.map((cat) => {
      if (cat.category === "Environmental" && summary.environmental) {
        const totalEnergy = safeNumber(
          summary.environmental.totalEnergyConsumption,
          cat.metrics[0].value
        );
        const totalWater = safeNumber(
          summary.environmental.totalWaterUse,
          cat.metrics[1].value
        );
        const carbonEmissions = safeNumber(
          summary.environmental.carbonEmissions,
          cat.metrics[2].value
        );
        const totalWaste = safeNumber(
          summary.environmental.totalWaste,
          cat.metrics[3].value
        );
        const renewableShare = safeNumber(
          summary.environmental.renewableEnergyShare,
          0
        );
        const renewableEnergyKwh = Math.round(
          (totalEnergy * renewableShare) / 100
        );
        const carbonOffsetsTonnes = safeNumber(
          metrics.carbonCredits,
          cat.metrics[5].value
        );

        return {
          ...cat,
          metrics: [
            { ...cat.metrics[0], value: totalEnergy },
            { ...cat.metrics[1], value: totalWater },
            { ...cat.metrics[2], value: carbonEmissions },
            { ...cat.metrics[3], value: totalWaste },
            { ...cat.metrics[4], value: renewableEnergyKwh },
            { ...cat.metrics[5], value: carbonOffsetsTonnes },
          ],
        };
      }

      if (cat.category === "Social" && summary.social) {
        const supplierDiv = safeNumber(
          summary.social.supplierDiversity,
          cat.metrics[0].value
        );
        const custSat = safeNumber(
          summary.social.customerSatisfaction,
          cat.metrics[1].value
        );
        const humanCap = safeNumber(
          summary.social.humanCapital,
          cat.metrics[2].value
        );
        const communityEng = safeNumber(
          socMetrics.communityPrograms,
          cat.metrics[3].value
        );

        return {
          ...cat,
          metrics: [
            { ...cat.metrics[0], value: supplierDiv },
            { ...cat.metrics[1], value: custSat },
            { ...cat.metrics[2], value: humanCap },
            { ...cat.metrics[3], value: communityEng },
          ],
        };
      }

      if (cat.category === "Governance" && summary.governance) {
        const corpGov = summary.governance.corporateGovernance || "Yes";
        const iso = summary.governance.iso9001Compliance || "Yes";
        const ethics = summary.governance.businessEthics || "High";
        const dataPrivacy = govMetrics.dataPrivacy || "Compliant";

        return {
          ...cat,
          metrics: [
            { ...cat.metrics[0], value: corpGov },
            { ...cat.metrics[1], value: iso },
            {
              ...cat.metrics[2],
              value: ethics === "High" ? "Yes" : String(ethics),
            },
            { ...cat.metrics[3], value: dataPrivacy ? "Yes" : "No" },
            cat.metrics[4],
            cat.metrics[5],
          ],
        };
      }

      return cat;
    });

    setKpis(updatedKpis);
  };

  // ---------- upload handler (Excel + JSON) ----------
  const handleUpload = async (file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/api/esg-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(`Upload failed: ${data.error || "Unknown error"}`);
        return;
      }

      // apply latest numbers from upload
      applyBackendPayload(data);

      // refresh ENV / SOCIAL / GOV live AI insights (this calls OpenAI)
      await refreshAll();

      alert("ESG data uploaded, processed, and live AI insights refreshed.");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload ESG data. Please try again.");
    }
  };

  // ---------- initial load (numbers from backend) ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/esg-data");
        const data = await res.json();
        applyBackendPayload(data);
      } catch (err) {
        console.error("Error fetching ESG data:", err);
        setEsGSummary({
          environmental: "Data unavailable",
          social: "Data unavailable",
          governance: "Data unavailable",
        });
      }
    };

    fetchData();
  }, []);

  // --------- LIVE AI insights used for dashboard mini report ---------
  const dashboardInsights = {
    environmental: environmentalInsights || [],
    social: socialInsights || [],
    governance: governanceInsights || [],
  };

  // ---------- PDF generation ----------
  const handleGenerateReport = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AfricaESG.AI Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;
    doc.text("ESG Summary:", 14, y);
    y += 8;
    Object.entries(esgSummary).forEach(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const lines = doc.splitTextToSize(`${label}: ${value}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    y += 10;
    doc.text("AI Mini Report on ESG Summary (LIVE AI):", 14, y);
    y += 8;

    Object.entries(dashboardInsights).forEach(([category, notes]) => {
      doc.setFont("helvetica", "bold");
      doc.text(
        `${category.charAt(0).toUpperCase() + category.slice(1)} Insights:`,
        14,
        y
      );
      y += 6;

      doc.setFont("helvetica", "normal");
      (notes || []).forEach((note) => {
        const lines = doc.splitTextToSize(`• ${note}`, 180);
        doc.text(lines, 14, y);
        y += lines.length * 6;
      });
      y += 4;
    });

    doc.save("AfricaESG_Report.pdf");
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">
              AfricaESG.AI Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              ESG performance overview with AI-enabled insights on carbon tax,
              energy savings, and strategic ESG levers.
            </p>
            {loading && (
              <p className="mt-1 text-xs text-gray-500">
                Fetching live AI insights…
              </p>
            )}
            {error && (
              <p className="mt-1 text-xs text-red-500">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerateReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium transition-all hover:scale-105"
            >
              <FaFilePdf className="text-white text-lg" />
              Download ESG Report
            </button>

            <label
              htmlFor="upload-file"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium cursor-pointer transition-all hover:scale-105"
            >
              <FaCloud className="text-white text-lg" />
              Upload ESG Data
            </label>
            <input
              id="upload-file"
              type="file"
              accept=".json,.xlsx,.xls"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files[0])}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* ESG Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <FaLeaf className="text-green-700 text-2xl" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  ESG Summary
                </h2>
              </div>
              <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                <p>
                  <strong>Environmental:</strong> {esgSummary.environmental}
                </p>
                <p>
                  <strong>Social:</strong> {esgSummary.social}
                </p>
                <p>
                  <strong>Governance:</strong> {esgSummary.governance}
                </p>
              </div>
            </div>

            {/* ESG Categories + KPIs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                ESG Performance Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {kpis.map((category) => (
                  <CategoryCard
                    key={category.category}
                    category={category}
                    onClick={() =>
                      navigate(`/${category.category.toLowerCase()}`)
                    }
                  />
                ))}
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <KpiCard
                  icon={<FaCoins />}
                  title="Carbon Tax (2024/2025)"
                  value={`R ${carbonTax.toLocaleString()}`}
                  indicator={renderIndicator(carbonTax, prevCarbonTax)}
                />

                <KpiCard
                  icon={<FaCloudIcon />}
                  title="Applicable Tax Allowances"
                  value={`R ${taxAllowances.toLocaleString()}`}
                  indicator={renderIndicator(
                    taxAllowances,
                    prevTaxAllowances
                  )}
                />

                <KpiCard
                  icon={<FaIndustry />}
                  title="Carbon Credits Generated"
                  value={`${carbonCredits.toLocaleString()} tonnes`}
                  indicator={renderIndicator(
                    carbonCredits,
                    prevCarbonCredits
                  )}
                />

                <KpiCard
                  icon={<FaLightbulb />}
                  title="Energy Savings"
                  value={`${energySavings.toLocaleString()} kWh`}
                  indicator={renderIndicator(
                    energySavings,
                    prevEnergySavings
                  )}
                />
              </div>
            </div>
          </div>

          {/* AI Mini Report (LIVE AI ONLY) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              AI Mini Report on ESG Summary
            </h2>

            {loading && (
              <p className="text-gray-500 italic mb-2">
                Fetching live AI insights…
              </p>
            )}

            <div className="text-gray-700 text-sm sm:text-base max-h-[700px] overflow-y-auto space-y-4">
              <div>
                <h3 className="font-semibold text-green-700 mb-1">
                  Environmental
                </h3>
                {dashboardInsights.environmental.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {dashboardInsights.environmental.map((note, index) => (
                      <li key={`env-${index}`}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  !loading && (
                    <p className="text-gray-500 italic">
                      No AI insights generated yet for Environmental.
                    </p>
                  )
                )}
              </div>

              <div>
                <h3 className="font-semibold text-blue-700 mb-1">Social</h3>
                {dashboardInsights.social.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {dashboardInsights.social.map((note, index) => (
                      <li key={`soc-${index}`}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  !loading && (
                    <p className="text-gray-500 italic">
                      No AI insights generated yet for Social.
                    </p>
                  )
                )}
              </div>

              <div>
                <h3 className="font-semibold text-orange-700 mb-1">
                  Governance
                </h3>
                {dashboardInsights.governance.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {dashboardInsights.governance.map((note, index) => (
                      <li key={`gov-${index}`}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  !loading && (
                    <p className="text-gray-500 italic">
                      No AI insights generated yet for Governance.
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
