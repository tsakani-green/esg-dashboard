// src/pages/governance/CorporateGovernance.jsx
import React, { useContext } from "react";
import { SimulationContext } from "../../context/SimulationContext";

export default function CorporateGovernance() {
  const { governanceInsights, loading, error } =
    useContext(SimulationContext) || {};

  const insights =
    governanceInsights && governanceInsights.corporate
      ? governanceInsights.corporate
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-slate-50 to-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-700 font-semibold mb-1">
              Governance · Corporate
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-900 tracking-tight">
              Corporate Governance
            </h1>
            <p className="mt-2 text-sm text-gray-700 max-w-xl">
              Overview of board structure, independence, diversity and ESG
              oversight to support investor-grade governance disclosures.
            </p>
            {error && (
              <p className="mt-2 text-xs text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Track board composition, independence and diversity.</p>
            <p>Aligned with corporate governance and ESG reporting needs.</p>
          </div>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 px-4 py-4">
            <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1">
              Reporting Standard
            </p>
            <p className="text-2xl font-bold text-orange-900">
              King IV
              <span className="ml-1 text-xs font-medium text-gray-500">
                / local code
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Primary corporate governance framework used for disclosures.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 px-4 py-4">
            <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1">
              Independent Directors
            </p>
            <p className="text-2xl font-bold text-orange-900">
              60%
              <span className="ml-1 text-xs font-medium text-gray-500">
                of board
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Proportion of non-executive, independent directors.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 px-4 py-4">
            <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1">
              Board Diversity
            </p>
            <p className="text-2xl font-bold text-orange-900">
              40%
              <span className="ml-1 text-xs font-medium text-gray-500">
                under-represented
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Gender and other diversity representation on the board.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left – governance framework & structure */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100/70 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3">
                Board & Committee Structure
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                Capture how the board and its committees are configured, and how
                ESG responsibilities are allocated.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    Board of Directors
                  </h3>
                  <ul className="list-disc list-inside text-orange-900/90 space-y-1">
                    <li>Chair & independent lead director roles</li>
                    <li>Executive vs non-executive composition</li>
                    <li>Skills matrix & ESG competence</li>
                  </ul>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    Key Committees
                  </h3>
                  <ul className="list-disc list-inside text-orange-900/90 space-y-1">
                    <li>Audit & Risk Committee</li>
                    <li>Remuneration / HR & Nominations</li>
                    <li>ESG / Sustainability Committee</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-orange-100/70 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3">
                Governance Policies & Oversight
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                Document the core policies and oversight mechanisms that support
                ethical, well-governed decision-making.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Foundational Policies
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Board charter & terms of reference</li>
                    <li>Delegation of authority framework</li>
                    <li>Code of ethics & conflict-of-interest policy</li>
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    ESG & Risk Oversight
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Risk management & compliance policies</li>
                    <li>ESG / sustainability policy & KPIs</li>
                    <li>Stakeholder engagement & reporting policy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right – AI corporate governance insights */}
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100/80 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-slate-900">
                AI Analysis – Corporate Governance
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700 uppercase tracking-wide">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                Live AI
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Priority recommendations relating to board effectiveness,
              independence, diversity and ESG oversight.
            </p>

            <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm leading-relaxed max-h-[360px] overflow-y-auto pr-1">
              {loading ? (
                <li className="text-gray-400">
                  Loading corporate governance insights…
                </li>
              ) : insights.length > 0 ? (
                insights.map((note, idx) => <li key={idx}>{note}</li>)
              ) : (
                <li className="text-gray-400">
                  No AI insights available. Capture board structure, committee
                  mandates and key policies to unlock analytics.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
