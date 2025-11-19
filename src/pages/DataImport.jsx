// src/pages/DataImport.jsx
import React, { useRef } from "react";
import { FaFilePdf, FaCloudUploadAlt, FaFileExcel, FaCheckCircle } from "react-icons/fa";

export default function DataImport() {
  // Scroll to upload section when "New Submission" is clicked
  const uploadSectionRef = useRef(null);

  const handleNewSubmission = () => {
    if (uploadSectionRef.current) {
      uploadSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Dummy recent submissions – later you can wire these to real backend data
  const recentSubmissions = [
    {
      id: 1,
      name: "Germiston – Municipal Invoice Jan 2024",
      type: "Municipal Invoice",
      records: 124,
      status: "Validated",
      date: "2024-01-15",
    },
    {
      id: 2,
      name: "Coal Invoices – Q1 2024",
      type: "Coal Invoice",
      records: 48,
      status: "In Review",
      date: "2024-01-18",
    },
    {
      id: 3,
      name: "ESG KPI Template – FY2023",
      type: "ESG KPI",
      records: 32,
      status: "Completed",
      date: "2024-01-10",
    },
  ];

  // Simple status pill styling
  const StatusPill = ({ status }) => {
    let classes =
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold";

    if (status === "Validated" || status === "Completed") {
      classes += " bg-emerald-50 text-emerald-700 border border-emerald-100";
    } else if (status === "In Review") {
      classes += " bg-amber-50 text-amber-700 border border-amber-100";
    } else {
      classes += " bg-slate-50 text-slate-600 border border-slate-100";
    }

    return <span className={classes}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-lime-50 py-10 font-sans flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-900 tracking-tight">
              Data Import
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Upload municipal and coal invoices, validate data quality, and
              push clean ESG data into your AI-enabled dashboard.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              AfricaESG.AI standardises raw operational data into ESG-ready formats.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleNewSubmission}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm md:text-base font-medium transition-transform hover:scale-105"
            >
              <FaCloudUploadAlt className="text-white text-base md:text-lg" />
              New Submission
            </button>
            <button
              onClick={() => {
                // placeholder for exporting a PDF summary of imports
              }}
              className="bg-white hover:bg-slate-50 text-orange-700 px-4 py-2 rounded-lg border border-orange-100 shadow-sm flex items-center gap-2 text-sm md:text-base font-medium transition-transform hover:scale-105"
            >
              <FaFilePdf className="text-orange-500 text-base md:text-lg" />
              Export Import Summary
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
              <FaCheckCircle className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Files Ingested (Last 30 Days)
              </p>
              <p className="text-2xl font-bold text-slate-900">12</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Validation Pass Rate
            </p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-2xl font-bold text-slate-900">96%</p>
              <span className="text-xs text-emerald-600 font-medium">
                +3% vs previous month
              </span>
            </div>
            <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[96%] bg-emerald-500 rounded-full" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Mapped to ESG Metrics
            </p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">32</p>
              <span className="text-xs text-slate-500">
                Energy, carbon, water, waste & coal
              </span>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload templates & actions */}
          <div className="lg:col-span-2 space-y-6" ref={uploadSectionRef}>
            {/* Upload Template Cards */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                Upload Data Templates
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Use standardised AfricaESG.AI templates to upload operational data.
                Each file is validated, cleaned and mapped into your ESG metrics.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Municipal Invoices */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/60 hover:bg-white transition-colors shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileExcel className="text-emerald-600" />
                    <p className="text-sm font-semibold text-slate-800">
                      Municipal Invoices
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Electricity, water and other municipal charges by site / month.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button className="text-xs font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2 text-left">
                      Download Template
                    </button>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center justify-center gap-1">
                      <FaCloudUploadAlt />
                      Upload File
                    </button>
                  </div>
                </div>

                {/* Coal Invoices */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/60 hover:bg-white transition-colors shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileExcel className="text-orange-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      Coal Invoices
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Coal tonnage, quality, supplier and cost for energy emissions.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button className="text-xs font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2 text-left">
                      Download Template
                    </button>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center justify-center gap-1">
                      <FaCloudUploadAlt />
                      Upload File
                    </button>
                  </div>
                </div>

                {/* ESG KPI Template */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/60 hover:bg-white transition-colors shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileExcel className="text-sky-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      ESG KPI Template
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Quantitative ESG KPIs for energy, water, waste and emissions.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button className="text-xs font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2 text-left">
                      Download Template
                    </button>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center justify-center gap-1">
                      <FaCloudUploadAlt />
                      Upload File
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Submissions Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                Recent Data Submissions
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm sm:text-base border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left">
                        File Name
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left">
                        Type
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-center">
                        Records
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left">
                        Status
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left">
                        Imported
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/70">
                        <td className="border border-gray-200 px-3 py-2 text-gray-800">
                          {sub.name}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-gray-700">
                          {sub.type}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center text-gray-900">
                          {sub.records}
                        </td>
                        <td className="border border-gray-200 px-3 py-2">
                          <StatusPill status={sub.status} />
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-gray-600 text-sm">
                          {sub.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: AI Mini Report */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              AI Mini Report – Data Import & Quality
            </h2>

            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed text-gray-700 max-h-[650px] overflow-y-auto">
              <li>
                Municipal invoice coverage is{" "}
                <span className="font-semibold">above 95%</span> for Germiston
                and surrounding facilities – enabling robust energy and water
                tracking.
              </li>
              <li>
                Coal invoices for the last quarter are{" "}
                <span className="font-semibold">fully ingested</span> but show
                minor data gaps on calorific values for two suppliers.
              </li>
              <li>
                Validation rules are flagging{" "}
                <span className="font-semibold">less than 4% of records</span>{" "}
                for manual review, indicating stable data quality.
              </li>
              <li>
                ESG KPI template imports are consistently mapping to{" "}
                <span className="font-semibold">
                  energy, carbon, water and waste
                </span>{" "}
                metrics without structural changes required.
              </li>
              <li>
                Consider automating monthly invoice ingestion for Germiston,
                Pretoria and Durban to further reduce manual handling.
              </li>
            </ul>

            <p className="mt-4 text-[11px] text-slate-500">
              In a future release, these insights can be generated live from your
              actual data import logs and ESG mappings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
