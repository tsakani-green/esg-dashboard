import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFilePdf,
  FaCloud,
  FaLeaf,
  FaCoins,
  FaIndustry,
  FaLightbulb,
} from "react-icons/fa";
import CategoryCard from "../components/CategoryCard";
import KpiCard from "../components/KpiCard";
import { jsPDF } from "jspdf";

export default function Dashboard() {
  const navigate = useNavigate();

  // --- ESG Summary ---
  const [esgSummary, setEsGSummary] = useState({
    environmental: "Loading...",
    social: "Loading...",
    governance: "Loading...",
  });

  // --- KPI States ---
  const [carbonTax, setCarbonTax] = useState(0);
  const [prevCarbonTax, setPrevCarbonTax] = useState(null);

  const [taxAllowances, setTaxAllowances] = useState(0);
  const [prevTaxAllowances, setPrevTaxAllowances] = useState(null);

  const [carbonCredits, setCarbonCredits] = useState(0);
  const [prevCarbonCredits, setPrevCarbonCredits] = useState(null);

  const [energySavings, setEnergySavings] = useState(0);
  const [prevEnergySavings, setPrevEnergySavings] = useState(null);

  // --- AI Insights per category ---
  const [aiInsights, setAIInsights] = useState({
    environmental: [],
    social: [],
    governance: [],
  });

  // --- KPI Data (static categories, all metrics displayed) ---
  const kpis = [
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

  // --- SVG Line Indicator Function with % change ---
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

  // --- Handle File Upload (offline JSON) ---
  const handleUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.summary) {
          alert("Invalid file format. Missing summary field.");
          return;
        }

        const summary = data.summary;
        const metrics = data.metrics || {};

        setEsGSummary({
          environmental: `Energy: ${summary.environmental.totalEnergyConsumption} kWh, Renewable Share: ${summary.environmental.renewableEnergyShare}%, Carbon Emissions: ${summary.environmental.carbonEmissions} tonnes`,
          social: `Supplier Diversity: ${summary.social.supplierDiversity}%, Customer Satisfaction: ${summary.social.customerSatisfaction}%, Human Capital: ${summary.social.humanCapital}%`,
          governance: `Corporate Governance: ${summary.governance.corporateGovernance}, ISO 9001 Compliance: ${summary.governance.iso9001Compliance}, Business Ethics: ${summary.governance.businessEthics}`,
        });

        // store previous KPI values BEFORE updating
        setPrevCarbonTax(carbonTax);
        setPrevTaxAllowances(taxAllowances);
        setPrevCarbonCredits(carbonCredits);
        setPrevEnergySavings(energySavings);

        // update KPI values
        setCarbonTax(metrics.carbonTax || 0);
        setTaxAllowances(metrics.taxAllowances || 0);
        setCarbonCredits(metrics.carbonCredits || 0);
        setEnergySavings(metrics.energySavings || 0);

        if (Array.isArray(data.insights)) {
          const allInsights = data.insights.length > 0 ? data.insights : [];
          setAIInsights({
            environmental: allInsights,
            social: allInsights,
            governance: allInsights,
          });
        } else if (data.insights && typeof data.insights === "object") {
          setAIInsights({
            environmental: data.insights.environmental || [],
            social: data.insights.social || [],
            governance: data.insights.governance || [],
          });
        } else {
          setAIInsights({
            environmental: [],
            social: [],
            governance: [],
          });
        }
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // --- Fetch ESG data and AI insights from backend ---
  useEffect(() => {
    fetch("http://localhost:5000/api/esg-data")
      .then((res) => res.json())
      .then((data) => {
        const summary = data.mockData.summary;
        const metrics = data.mockData.metrics;

        setEsGSummary({
          environmental: `Energy: ${summary.environmental.totalEnergyConsumption} kWh, Renewable Share: ${summary.environmental.renewableEnergyShare}%, Carbon Emissions: ${summary.environmental.carbonEmissions} tonnes`,
          social: `Supplier Diversity: ${summary.social.supplierDiversity}%, Customer Satisfaction: ${summary.social.customerSatisfaction}%, Human Capital: ${summary.social.humanCapital}%`,
          governance: `Corporate Governance: ${summary.governance.corporateGovernance}, ISO 9001 Compliance: ${summary.governance.iso9001Compliance}, Business Ethics: ${summary.governance.businessEthics}`,
        });

        // store previous KPI values BEFORE updating
        setPrevCarbonTax(carbonTax);
        setPrevTaxAllowances(taxAllowances);
        setPrevCarbonCredits(carbonCredits);
        setPrevEnergySavings(energySavings);

        // update KPI values
        setCarbonTax(metrics.carbonTax || 0);
        setTaxAllowances(metrics.taxAllowances || 0);
        setCarbonCredits(metrics.carbonCredits || 0);
        setEnergySavings(metrics.energySavings || 0);

        const backendInsights = Array.isArray(data.insights)
          ? data.insights
          : [];

        const allInsights = backendInsights.length > 0 ? backendInsights : [];

        setAIInsights({
          environmental: allInsights,
          social: allInsights,
          governance: allInsights,
        });
      })
      .catch((err) => {
        console.error("Error fetching ESG data:", err);
        setEsGSummary({
          environmental: "Data unavailable",
          social: "Data unavailable",
          governance: "Data unavailable",
        });
        const empty = [];
        setAIInsights({
          environmental: empty,
          social: empty,
          governance: empty,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- PDF Generation ---
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
      const lines = doc.splitTextToSize(`${key}: ${value}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    y += 10;
    doc.text("AI Mini Report on ESG Summary:", 14, y);
    y += 8;

    Object.entries(aiInsights).forEach(([category, notes]) => {
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
              accept=".json"
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
                  icon={<FaCloud />}
                  title="Applicable Tax Allowances"
                  value={`R ${taxAllowances.toLocaleString()}`}
                  indicator={renderIndicator(taxAllowances, prevTaxAllowances)}
                />

                <KpiCard
                  icon={<FaIndustry />}
                  title="Carbon Credits Generated"
                  value={`${carbonCredits.toLocaleString()} tonnes (CO2e)`}
                  indicator={renderIndicator(carbonCredits, prevCarbonCredits)}
                />

                <KpiCard
                  icon={<FaLightbulb />}
                  title="Energy Savings"
                  value={`${energySavings.toLocaleString()} kWh`}
                  indicator={renderIndicator(energySavings, prevEnergySavings)}
                />
              </div>
            </div>
          </div>

          {/* AI Mini Report (Environmental focus) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              AI Mini Report on ESG Summary
            </h2>

            {aiInsights.environmental.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1 max-h-[700px] overflow-y-auto">
                {aiInsights.environmental.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-base">
                No AI insights available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
