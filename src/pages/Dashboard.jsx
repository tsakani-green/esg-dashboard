// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGlobeAfrica,
  FaFileAlt,
  FaShieldAlt,
  FaRobot,
  FaLeaf,
  FaUsers,
  FaBalanceScaleLeft,
  FaExclamationTriangle,
  FaCloud,
  FaTint,
  FaTrash,
  FaIndustry,
  FaUpload,
  FaFilePdf,
} from "react-icons/fa";
import { jsPDF } from "jspdf";

const API_BASE_URL = "http://localhost:5000";

export default function Dashboard() {
  const navigate = useNavigate();

  // --- ESG Summary ---
  const [esgSummary, setEsGSummary] = useState({
    environmental: "Loading...",
    social: "Loading...",
    governance: "Loading...",
  });

  // --- KPI States (financial / carbon) ---
  const [carbonTax, setCarbonTax] = useState(0);
  const [prevCarbonTax, setPrevCarbonTax] = useState(null);

  const [taxAllowances, setTaxAllowances] = useState(0);
  const [prevTaxAllowances, setPrevTaxAllowances] = useState(null);

  const [carbonCredits, setCarbonCredits] = useState(0);
  const [prevCarbonCredits, setPrevCarbonCredits] = useState(null);

  const [energySavings, setEnergySavings] = useState(0);
  const [prevEnergySavings, setPrevEnergySavings] = useState(null);

  // Combined AI insights (for PDF download)
  const [aiInsights, setAIInsights] = useState([]);

  // AI mini report per pillar
  const [envInsights, setEnvInsights] = useState([]);
  const [socialInsights, setSocialInsights] = useState([]);
  const [govInsights, setGovInsights] = useState([]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // keep track of latest upload events (for "Recent activity")
  const [recentUploads, setRecentUploads] = useState([]);

  // --- Red flags ---
  const [redFlags, setRedFlags] = useState([]);

  // ---------- Trend indicator with better layout ----------
  const renderIndicator = (current, previous) => {
    // if no previous value, reserve space so card heights match
    if (previous === null || previous === undefined) {
      return <div className="h-5" />;
    }

    const diff = current - previous;

    let pctChange =
      previous === 0
        ? current === 0
          ? 0
          : 100
        : (diff / previous) * 100;

    const formatted = `${diff > 0 ? "+" : ""}${pctChange.toFixed(1)}%`;

    const isUp = diff > 0;
    const isDown = diff < 0;

    const color = isUp
      ? "text-emerald-600"
      : isDown
      ? "text-red-600"
      : "text-gray-500";

    return (
      <div
        className={`flex items-center gap-1 text-[11px] font-semibold ${color} h-5`}
      >
        {isUp && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            className="shrink-0"
          >
            <path
              d="M4 16 L12 8 L20 16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {isDown && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            className="shrink-0"
          >
            <path
              d="M4 8 L12 16 L20 8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {!isUp && !isDown && (
          <svg width="12" height="12" className="opacity-40 shrink-0">
            <circle cx="6" cy="6" r="3" fill="currentColor" />
          </svg>
        )}
        <span className="leading-none">{formatted}</span>
      </div>
    );
  };

  // ---------- Red flag rules ----------
  const computeRedFlags = (summary, metrics) => {
    const flags = [];

    const env = summary?.environmental ?? {};
    const soc = summary?.social ?? {};
    const gov = summary?.governance ?? {};

    // Example rule 1: low renewables
    const renewableShare =
      env.renewableEnergyShare !== undefined ? env.renewableEnergyShare : null;
    if (renewableShare !== null && renewableShare < 20) {
      flags.push(
        `Renewable energy share is only ${renewableShare}%. This is below the 20% threshold.`
      );
    }

    // Example rule 2: high carbon tax exposure
    const carbonTaxValue = metrics?.carbonTax ?? 0;
    if (carbonTaxValue > 20000000) {
      flags.push(
        `Carbon tax exposure (R ${carbonTaxValue.toLocaleString()}) is above the defined risk threshold.`
      );
    }

    // Example rule 3: low energy savings relative to energy use
    const energySavingsValue = metrics?.energySavings ?? 0;
    const totalEnergy = env.totalEnergyConsumption ?? 0;
    if (totalEnergy > 0) {
      const savingsPct = (energySavingsValue / totalEnergy) * 100;
      if (savingsPct < 5) {
        flags.push(
          `Energy savings represent only ${savingsPct.toFixed(
            1
          )}% of total energy use – consider additional efficiency projects.`
        );
      }
    }

    // Example rule 4: very low supplier diversity
    if (soc.supplierDiversity !== undefined && soc.supplierDiversity < 5) {
      flags.push(
        `Supplier diversity (${soc.supplierDiversity}%) is low – this may create concentration and social risk.`
      );
    }

    // Example rule 5: any compliance findings (if wired into summary later)
    if (gov.totalComplianceFindings && gov.totalComplianceFindings > 0) {
      flags.push(
        `There are ${gov.totalComplianceFindings} open compliance findings – review governance actions.`
      );
    }

    return flags;
  };

  // ---- upload handler (Excel + JSON) ----
  const handleUpload = async (file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      setAiLoading(true);
      setAiError(null);

      const res = await fetch(`${API_BASE_URL}/api/esg-upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let serverMessage = "";
        try {
          const errBody = await res.json();
          serverMessage = errBody.error || JSON.stringify(errBody);
        } catch {
          serverMessage = `HTTP ${res.status} ${res.statusText}`;
        }
        setAiLoading(false);
        setAiError(`Upload failed: ${serverMessage}`);
        alert(`Upload failed: ${serverMessage}`);
        return;
      }

      const data = await res.json();

      if (data.error) {
        setAiLoading(false);
        setAiError(data.error);
        alert(`Upload failed: ${data.error}`);
        return;
      }

      const { mockData, insights } = data;
      if (!mockData) {
        setAiLoading(false);
        setAiError("Invalid response from ESG upload service.");
        alert("Invalid response from server.");
        return;
      }

      const summary = mockData.summary || {};
      const metrics = mockData.metrics || {};

      setEsGSummary({
        environmental: summary.environmental
          ? `Energy: ${summary.environmental.totalEnergyConsumption.toLocaleString()} kWh · Renewables: ${summary.environmental.renewableEnergyShare}% · Carbon: ${summary.environmental.carbonEmissions.toLocaleString()} tCO₂e`
          : "Data unavailable",
        social: summary.social
          ? `Supplier diversity: ${summary.social.supplierDiversity}% · Customer satisfaction: ${summary.social.customerSatisfaction}% · Human capital: ${summary.social.humanCapital}%`
          : "Data unavailable",
        governance: summary.governance
          ? `Corporate governance: ${summary.governance.corporateGovernance} · ISO 9001: ${summary.governance.iso9001Compliance} · Ethics: ${summary.governance.businessEthics}`
          : "Data unavailable",
      });

      // update KPI baselines & current values
      setPrevCarbonTax(carbonTax);
      setPrevTaxAllowances(taxAllowances);
      setPrevCarbonCredits(carbonCredits);
      setPrevEnergySavings(energySavings);

      setCarbonTax(metrics.carbonTax || 0);
      setTaxAllowances(metrics.taxAllowances || 0);
      setCarbonCredits(metrics.carbonCredits || 0);
      setEnergySavings(metrics.energySavings || 0);

      // NEW: red flags for uploaded data
      setRedFlags(computeRedFlags(summary, metrics));

      const backendInsights = Array.isArray(insights)
        ? insights
        : insights
        ? [insights]
        : [];
      setAIInsights(backendInsights);

      const now = new Date();

      // Keep only latest 5 uploads + persist them
      setRecentUploads((prev) => {
        const newEntry = {
          name: file.name,
          type: file.name.endsWith(".json") ? "JSON" : "Excel",
          status: "Processed",
          time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        let updated = [newEntry, ...prev];
        if (updated.length > 5) {
          updated = updated.slice(0, 5);
        }

        localStorage.setItem("recentUploads", JSON.stringify(updated));
        return updated;
      });

      // refresh pillar-level AI mini report after upload
      await loadPillarInsights();

      setAiLoading(false);
      alert("ESG data uploaded and processed successfully.");
    } catch (err) {
      console.error("Upload error:", err);
      setAiLoading(false);
      setAiError("Failed to upload ESG data (network or server error).");
      alert(
        "Failed to upload ESG data. Please check the backend logs and file format."
      );
    }
  };

  // ---- main ESG data and combined insights ----
  const loadInitialData = async () => {
    try {
      setAiLoading(true);
      setAiError(null);

      const res = await fetch(`${API_BASE_URL}/api/esg-data`);
      const data = await res.json();

      const summary = data.mockData.summary;
      const metrics = data.mockData.metrics;

      setEsGSummary({
        environmental: `Energy: ${summary.environmental.totalEnergyConsumption.toLocaleString()} kWh · Renewables: ${summary.environmental.renewableEnergyShare}% · Carbon: ${summary.environmental.carbonEmissions.toLocaleString()} tCO₂e`,
        social: `Supplier diversity: ${summary.social.supplierDiversity}% · Customer satisfaction: ${summary.social.customerSatisfaction}% · Human capital: ${summary.social.humanCapital}%`,
        governance: `Corporate governance: ${summary.governance.corporateGovernance} · ISO 9001: ${summary.governance.iso9001Compliance} · Ethics: ${summary.governance.businessEthics}`,
      });

      setPrevCarbonTax(carbonTax);
      setPrevTaxAllowances(taxAllowances);
      setPrevCarbonCredits(carbonCredits);
      setPrevEnergySavings(energySavings);

      setCarbonTax(metrics.carbonTax || 0);
      setTaxAllowances(metrics.taxAllowances || 0);
      setCarbonCredits(metrics.carbonCredits || 0);
      setEnergySavings(metrics.energySavings || 0);

      const combined = Array.isArray(data.insights)
        ? data.insights
        : data.insights
        ? [data.insights]
        : [];
      setAIInsights(combined);

      // NEW: initial red flags
      setRedFlags(computeRedFlags(summary, metrics));

      setAiLoading(false);
    } catch (err) {
      console.error("Error fetching ESG data:", err);
      setEsGSummary({
        environmental: "Data unavailable",
        social: "Data unavailable",
        governance: "Data unavailable",
      });
      setAIInsights([]);
      setAiError("Failed to load ESG metrics and AI insights.");
      setAiLoading(false);
    }
  };

  // ---- pillar-level insights for AI mini report ----
  const loadPillarInsights = async () => {
    try {
      const [envRes, socRes, govRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/environmental-insights`),
        fetch(`${API_BASE_URL}/api/social-insights`),
        fetch(`${API_BASE_URL}/api/governance-insights`),
      ]);

      const envData = await envRes.json();
      const socData = await socRes.json();
      const govData = await govRes.json();

      setEnvInsights(
        Array.isArray(envData.insights) ? envData.insights.slice(0, 5) : []
      );
      setSocialInsights(
        Array.isArray(socData.insights) ? socData.insights.slice(0, 5) : []
      );
      setGovInsights(
        Array.isArray(govData.insights) ? govData.insights.slice(0, 5) : []
      );
    } catch (err) {
      console.error("Error loading pillar insights:", err);
      // silently fall back to "No AI insights generated yet…" messages
    }
  };

  // initial load
  useEffect(() => {
    loadInitialData();
    loadPillarInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load recent uploads from localStorage on first render
  useEffect(() => {
    try {
      const savedUploads = localStorage.getItem("recentUploads");
      if (savedUploads) {
        const parsed = JSON.parse(savedUploads);
        if (Array.isArray(parsed)) {
          setRecentUploads(parsed.slice(0, 5));
        }
      }
    } catch (e) {
      console.warn("Failed to parse recentUploads from localStorage", e);
    }
  }, []);

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AfricaESG.AI Overview Report", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;
    doc.text("ESG Summary:", 14, y);
    y += 8;
    Object.entries(esgSummary).forEach(([key, value]) => {
      const lines = doc.splitTextToSize(
        `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`,
        180
      );
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    y += 10;
    doc.text("AI Analyst Summary:", 14, y);
    y += 8;

    (aiInsights || []).forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save("AfricaESG_Overview_Report.pdf");
  };

  // quick helper for stat cards
  const StatCard = ({ icon, label, value, sub }) => (
    <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-3 h-full">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shrink-0">
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-xs text-slate-500 uppercase tracking-wide">
          {label}
        </div>
        <div className="text-xl font-semibold text-slate-900">{value}</div>
        {sub && (
          <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
        )}
      </div>
    </div>
  );

  // MoneyCard with red-flag highlight
  const MoneyCard = ({ icon, label, value, indicator, isFlagged }) => (
    <div
      className={`rounded-2xl border shadow-sm px-4 py-3 flex flex-col justify-between gap-2 h-full ${
        isFlagged ? "bg-red-50 border-red-300" : "bg-white border-slate-100"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shrink-0">
            {icon}
          </span>
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
            {label}
          </span>
        </div>
        {indicator}
      </div>

      <div className="flex items-baseline gap-1 text-lg font-semibold text-slate-900 whitespace-nowrap tabular-nums">
        {typeof value === "string" && value.startsWith("R ") ? (
          <>
            <span className="text-sm text-slate-500">R</span>
            <span>{value.replace(/^R\s*/, "")}</span>
          </>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Row */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">
              AfricaESG.AI Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              ESG performance overview with AI-enabled insights on carbon tax,
              energy savings, and strategic ESG levers.
            </p>
            {aiLoading && (
              <p className="mt-2 text-xs text-emerald-700 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Loading ESG metrics and AI insights…
              </p>
            )}
            {aiError && (
              <p className="mt-2 text-xs text-red-500">{aiError}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerateReport}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              <FaFilePdf />
              Download ESG Report
            </button>

            <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg cursor-pointer transition-all">
              <FaUpload />
              Upload ESG Data
              <input
                type="file"
                accept=".json,.xlsx,.xls"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0])}
              />
            </label>
          </div>
        </header>

        {/* Red Flag Panel */}
        {redFlags.length > 0 && (
          <section className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex gap-3 items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-red-800 mb-1">
                Red Flags Detected
              </h2>
              <ul className="list-disc list-inside text-xs sm:text-sm text-red-900 space-y-1">
                {redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ESG Summary + AI Mini Report */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* ESG Summary card (left, spanning 2 cols on desktop) */}
          <div className="lg:col-span-2 h-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <FaLeaf className="text-green-700 text-xl" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  ESG Summary
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                High-level ESG performance snapshot from the latest uploaded
                dataset.
              </p>

              <div className="space-y-2 text-sm text-gray-800 mt-auto">
                <p>
                  <span className="font-semibold">Environmental:</span>{" "}
                  {esgSummary.environmental}
                </p>
                <p>
                  <span className="font-semibold">Social:</span>{" "}
                  {esgSummary.social}
                </p>
                <p>
                  <span className="font-semibold">Governance:</span>{" "}
                  {esgSummary.governance}
                </p>
              </div>
            </div>
          </div>

          {/* AI Mini Report (right) */}
          <div className="h-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                AI Mini Report on ESG Summary
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                AI-generated commentary on Environmental, Social and Governance
                performance based on the latest ESG upload.
              </p>

              <div className="space-y-4 text-sm flex-1 overflow-y-auto pr-1">
                {/* Environmental insights */}
                <div>
                  <h3 className="font-semibold text-emerald-700 mb-1">
                    Environmental
                  </h3>
                  {envInsights && envInsights.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {envInsights.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No AI insights generated yet for Environmental.
                    </p>
                  )}
                </div>

                {/* Social insights */}
                <div>
                  <h3 className="font-semibold text-sky-700 mb-1">Social</h3>
                  {socialInsights && socialInsights.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {socialInsights.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No AI insights generated yet for Social.
                    </p>
                  )}
                </div>

                {/* Governance insights */}
                <div>
                  <h3 className="font-semibold text-amber-700 mb-1">
                    Governance
                  </h3>
                  {govInsights && govInsights.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {govInsights.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No AI insights generated yet for Governance.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🔁 Headline stats row MOVED here — directly before ESG Performance Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          <StatCard
            icon={<FaGlobeAfrica size={18} />}
            label="African countries supported"
            value="50+"
            sub="Regional ESG coverage"
          />
          <StatCard
            icon={<FaFileAlt size={18} />}
            label="ESG reports generated"
            value="10k+"
            sub="Automated & AI-assisted"
          />
          <StatCard
            icon={<FaShieldAlt size={18} />}
            label="Compliance accuracy"
            value="99%"
            sub="Templates for IFRS, GRI, JSE"
          />
          <StatCard
            icon={<FaRobot size={18} />}
            label="AI analyst support"
            value="24/7"
            sub="Continuous ESG monitoring"
          />
        </section>

        {/* ESG Performance Overview */}
        <section>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                ESG Performance Overview
              </h2>
              <button
                className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                onClick={() => navigate("/environmental")}
              >
                View detailed ESG metrics →
              </button>
            </div>

            {/* 3 pillar mini cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-stretch">
              {/* Environmental card */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaCloud className="text-emerald-700" />
                      <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                        Environmental
                      </span>
                    </div>
                    <button
                      className="text-[11px] text-emerald-700 font-semibold hover:underline"
                      onClick={() =>
                        navigate("/dashboard/environment/energy")
                      }
                    >
                      View details
                    </button>
                  </div>
                  <ul className="text-xs sm:text-sm text-emerald-900/90 space-y-1.5">
                    <li>
                      <span className="font-semibold">Energy</span>{" "}
                      {esgSummary.environmental.includes("Energy:")
                        ? esgSummary.environmental
                            .split("·")[0]
                            .replace("Energy:", "")
                        : ""}
                    </li>
                    <li>
                      <span className="font-semibold">Renewables</span>{" "}
                      {esgSummary.environmental.includes("Renewables:")
                        ? esgSummary.environmental
                            .split("·")[1]
                            .replace("Renewables:", "")
                        : ""}
                    </li>
                    <li>
                      <span className="font-semibold">Carbon</span>{" "}
                      {esgSummary.environmental.includes("Carbon:")
                        ? esgSummary.environmental
                            .split("·")[2]
                            .replace("Carbon:", "")
                        : ""}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Social card */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-sky-700" />
                      <span className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Social
                      </span>
                    </div>
                    <button
                      className="text-[11px] text-sky-700 font-semibold hover:underline"
                      onClick={() => navigate("/dashboard/social")}
                    >
                      View details
                    </button>
                  </div>
                  <ul className="text-xs sm:text-sm text-sky-900/90 space-y-1.5">
                    <li>
                      <span className="font-semibold">Supplier Diversity</span>{" "}
                      {esgSummary.social.includes("Supplier")
                        ? esgSummary.social
                            .split("·")[0]
                            .replace("Supplier diversity:", "")
                        : ""}
                    </li>
                    <li>
                      <span className="font-semibold">
                        Customer Satisfaction
                      </span>{" "}
                      {esgSummary.social.includes("Customer")
                        ? esgSummary.social
                            .split("·")[1]
                            .replace("Customer satisfaction:", "")
                        : ""}
                    </li>
                    <li>
                      <span className="font-semibold">Human Capital</span>{" "}
                      {esgSummary.social.includes("Human")
                        ? esgSummary.social
                            .split("·")[2]
                            .replace("Human capital:", "")
                        : ""}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Governance card */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaBalanceScaleLeft className="text-amber-700" />
                      <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                        Governance
                      </span>
                    </div>
                    <button
                      className="text-[11px] text-amber-700 font-semibold hover:underline"
                      onClick={() =>
                        navigate("/dashboard/governance/corporate")
                      }
                    >
                      View details
                    </button>
                  </div>
                  <ul className="text-xs sm:text-sm text-amber-900/90 space-y-1.5">
                    <li>
                      <span className="font-semibold">
                        Corporate Governance
                      </span>{" "}
                      {esgSummary.governance.includes("Corporate")
                        ? esgSummary.governance
                            .split("·")[0]
                            .replace("Corporate governance:", "")
                        : ""}
                    </li>
                    <li>
                      <span className="font-semibold">ISO 9001</span>{" "}
                      {esgSummary.governance.includes("ISO")
                        ? esgSummary.governance
                            .split("·")[1]
                            .replace(" ISO 9001:", "")
                        : ""}
                    </li>
                    <li>
                      <span className="font-semibold">Business Ethics</span>{" "}
                      {esgSummary.governance.includes("Ethics")
                        ? esgSummary.governance
                            .split("·")[2]
                            .replace(" Ethics:", "")
                        : ""}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Financial / carbon KPIs row – using MoneyCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              <MoneyCard
                icon={<FaIndustry size={15} />}
                label="Carbon Tax (2024/2025)"
                value={`R ${carbonTax.toLocaleString()}`}
                indicator={renderIndicator(carbonTax, prevCarbonTax)}
                isFlagged={carbonTax > 20000000}
              />
              <MoneyCard
                icon={<FaCloud size={15} />}
                label="Applicable Tax Allowances"
                value={`R ${taxAllowances.toLocaleString()}`}
                indicator={renderIndicator(taxAllowances, prevTaxAllowances)}
                isFlagged={false}
              />
              <MoneyCard
                icon={<FaTrash size={15} />}
                label="Carbon Credits Generated"
                value={`${carbonCredits.toLocaleString()} tonnes`}
                indicator={renderIndicator(carbonCredits, prevCarbonCredits)}
                isFlagged={false}
              />
              <MoneyCard
                icon={<FaTint size={15} />}
                label="Energy Savings"
                value={`${energySavings.toLocaleString()} kWh`}
                indicator={renderIndicator(energySavings, prevEnergySavings)}
                isFlagged={false}
              />
            </div>
          </div>
        </section>

        {/* Recent activity & quick navigation */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Recent uploads */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-800">
                Recent ESG Data Uploads
              </h2>
              <span className="text-xs text-slate-500">Latest 5 uploads</span>
            </div>

            {recentUploads.length === 0 ? (
              <p className="text-sm text-slate-500">
                No uploads recorded yet. Upload an Excel or JSON ESG dataset to
                see activity here.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm text-slate-700">
                {recentUploads.slice(0, 5).map((item, idx) => (
                  <li
                    key={idx}
                    className="py-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-slate-500">
                        {item.type} · {item.status}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">{item.time}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick navigation */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 p-6 h-full flex flex-col">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Quick Navigation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-1">
              <button
                onClick={() => navigate("/dashboard/environment/energy")}
                className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
              >
                <span>Environmental detail</span>
                <FaCloud className="text-emerald-600" />
              </button>
              <button
                onClick={() => navigate("/dashboard/governance/corporate")}
                className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 hover:border-amber-300 hover:bg-amber-50 transition-colors"
              >
                <span>Governance detail</span>
                <FaBalanceScaleLeft className="text-amber-600" />
              </button>
              <button
                onClick={() => navigate("/dashboard/data-import")}
                className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3 hover:border-sky-300 hover:bg-sky-50 transition-colors"
              >
                <span>Data import workspace</span>
                <FaUpload className="text-sky-600" />
              </button>
              <button
                onClick={() => navigate("/dashboard/notifications")}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 hover:border-slate-300 hover:bg-white transition-colors"
              >
                <span>Alerts & notifications</span>
                <FaExclamationTriangle className="text-amber-500" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
