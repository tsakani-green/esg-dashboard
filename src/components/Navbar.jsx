import React, { useState } from "react";
import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/AfricaESG.AI.png";
import avatar from "../assets/avatar.png";

// Environmental dropdown items
const environmentalLinks = [
  { label: "Energy", path: "/dashboard/environment/energy" },
  { label: "Carbon", path: "/dashboard/environment/carbon" },
  { label: "Water", path: "/dashboard/environment/water" },
  { label: "Waste", path: "/dashboard/environment/waste" },
  { label: "Coal", path: "/dashboard/environment/coal" },
];

// Governance dropdown items (pages/governance)
const governanceLinks = [
  { label: "Overview", path: "/dashboard/governance/overview" },
  { label: "Corporate Governance", path: "/dashboard/governance/corporate" },
  { label: "Risk & Compliance", path: "/dashboard/governance/risk-compliance" },
  { label: "Data Privacy & Security", path: "/dashboard/governance/data-privacy" },
  { label: "Audit & Assurance", path: "/dashboard/governance/audit" },
];

export default function Navbar({ userName, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const [govOpen, setGovOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false);
    setEnvOpen(false);
    setGovOpen(false);
  };

  const isEnvActive = location.pathname.startsWith("/dashboard/environment");
  const isGovActive = location.pathname.startsWith("/dashboard/governance");

  return (
    <nav className="w-full bg-white shadow-md px-4 sm:px-6 py-3 flex items-center justify-between relative font-sans">
      {/* Left: Logo */}
      <div
        className="flex items-center z-10 cursor-pointer"
        onClick={() => handleNavClick("/dashboard")}
      >
        <img
          src={logo}
          alt="AfricaESG.AI Logo"
          className="h-16 w-16 md:h-20 md:w-20 object-contain"
        />
      </div>

      {/* Center Navigation (Desktop) */}
      <div className="flex-1 hidden md:flex items-center justify-center">
        <div className="flex items-center gap-5 lg:gap-8">
          {/* Overview */}
          <button
            onClick={() => handleNavClick("/dashboard")}
            className={`relative text-sm lg:text-base font-medium transition-colors ${
              location.pathname === "/dashboard"
                ? "text-green-700"
                : "text-slate-700 hover:text-green-700"
            }`}
          >
            Overview
          </button>

          {/* Environmental Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setEnvOpen(true)} // open on hover
          >
            <button
              onClick={() => setEnvOpen((prev) => !prev)} // toggle on click
              className={`relative px-1 py-2 text-sm lg:text-base font-medium transition-colors ${
                isEnvActive || envOpen
                  ? "text-green-700"
                  : "text-slate-700 hover:text-green-700"
              }`}
            >
              Environmental
            </button>

            <div
              className={`absolute left-1/2 top-full z-20 mt-3 w-56 -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-lg shadow-green-900/10 transition-all duration-200 ${
                envOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <ul className="py-2">
                {environmentalLinks.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        location.pathname === item.path
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-slate-700 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Governance Dropdown (renamed from Social & Governance) */}
          <div
            className="relative"
            onMouseEnter={() => setGovOpen(true)} // open on hover
          >
            <button
              onClick={() => setGovOpen((prev) => !prev)}
              className={`relative px-1 py-2 text-sm lg:text-base font-medium transition-colors ${
                isGovActive || govOpen
                  ? "text-green-700"
                  : "text-slate-700 hover:text-green-700"
              }`}
            >
              Governance
            </button>

            <div
              className={`absolute left-1/2 top-full z-20 mt-3 w-64 -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-lg shadow-green-900/10 transition-all duration-200 ${
                govOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <ul className="py-2">
                {governanceLinks.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        location.pathname === item.path
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-slate-700 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side (Desktop) */}
      <div className="hidden md:flex items-center space-x-4 z-10">
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => handleNavClick("/dashboard/profile")}
        >
          <img
            src={avatar}
            alt="User Avatar"
            className="h-10 w-10 rounded-full object-cover border-2 border-green-600"
          />
          <span className="text-sm text-gray-800 font-medium mt-1">
            {userName}
          </span>
        </div>

        <button
          className="text-green-700 hover:text-green-900 transition-colors"
          onClick={() => handleNavClick("/dashboard/notifications")}
        >
          <FaBell size={24} />
        </button>

        <button
          onClick={onLogout}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="text-green-700 hover:text-green-900 md:hidden z-20 transition-colors"
        onClick={() => setMenuOpen(true)}
      >
        <FaBars size={22} />
      </button>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20">
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg p-6 flex flex-col">
            <button
              className="self-end text-green-700 hover:text-green-900 mb-6 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <FaTimes size={22} />
            </button>

            {/* Mobile Avatar */}
            <div
              className="flex flex-col items-center mb-6 cursor-pointer"
              onClick={() => handleNavClick("/dashboard/profile")}
            >
              <img
                src={avatar}
                alt="User Avatar"
                className="h-16 w-16 rounded-full object-cover border-2 border-green-600 mb-2"
              />
              <span className="text-gray-900 font-semibold text-lg">
                {userName}
              </span>
            </div>

            {/* Overview */}
            <button
              onClick={() => handleNavClick("/dashboard")}
              className="text-left w-full py-2 mb-2 text-sm font-medium text-gray-800 hover:text-green-700 hover:bg-green-50 rounded-md"
            >
              Overview
            </button>

            {/* Environmental (mobile) */}
            <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-1">
              Environmental
            </p>
            {environmentalLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className="text-left w-full py-2 text-sm text-gray-800 hover:text-green-700 hover:bg-green-50 rounded-md ml-1"
              >
                {item.label}
              </button>
            ))}

            {/* Governance (mobile) */}
            <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-1">
              Governance
            </p>
            {governanceLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className="text-left w-full py-2 text-sm text-gray-800 hover:text-green-700 hover:bg-green-50 rounded-md ml-1"
              >
                {item.label}
              </button>
            ))}

            {/* Logout */}
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="mt-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
