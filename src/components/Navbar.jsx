// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/AfricaESG.AI.png";
import avatar from "../assets/avatar.png";

// Environmental dropdown items -> pages/environment/*
const environmentalLinks = [
  { label: "Energy", path: "/dashboard/environment/energy" },
  { label: "Carbon", path: "/dashboard/environment/carbon" },
  { label: "Water", path: "/dashboard/environment/water" },
  { label: "Waste", path: "/dashboard/environment/waste" },
  { label: "Coal", path: "/dashboard/environment/coal" },
];

// Governance dropdown items
const governanceLinks = [
  { label: "Corporate Governance", path: "/dashboard/governance/corporate" },
  { label: "Ethic & Compliance", path: "/dashboard/governance/ethic" },
  { label: "Data Privacy & Security", path: "/dashboard/governance/data" },
  { label: "Supply Chain", path: "/dashboard/governance/supply" },
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
  const isDataImportActive = location.pathname === "/dashboard/data-import";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const closeAll = (e) => {
      if (!e.target.closest(".dropdown-area")) {
        setEnvOpen(false);
        setGovOpen(false);
      }
    };

    document.addEventListener("click", closeAll);
    return () => document.removeEventListener("click", closeAll);
  }, []);

  return (
    <nav className="w-full bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between relative font-sans">
      {/* Left: Logo */}
      <div
        className="flex items-center z-10 cursor-pointer group"
        onClick={() => handleNavClick("/dashboard")}
      >
        <div className="relative">
          <img
            src={logo}
            alt="AfricaESG.AI Logo"
            className="h-16 w-16 md:h-20 md:w-20 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 blur-md bg-emerald-300/40 transition-opacity duration-200" />
        </div>
      </div>

      {/* Center Navigation (Desktop) */}
      <div className="flex-1 hidden md:flex items-center justify-center">
        <div className="flex items-center gap-5 lg:gap-8 bg-slate-50/70 rounded-full px-4 py-1 shadow-inner border border-slate-100">
          {/* Overview */}
          <button
            onClick={() => handleNavClick("/dashboard")}
            className={`group relative px-2 py-1.5 text-sm lg:text-base font-medium rounded-full transition-all duration-200
              ${
                location.pathname === "/dashboard"
                  ? "text-emerald-700 bg-emerald-50 shadow-sm"
                  : "text-slate-700 hover:text-emerald-700 hover:bg-white hover:shadow-sm"
              }
            `}
          >
            <span>Overview</span>
            <span
              className={`absolute left-4 right-4 bottom-1 h-0.5 rounded-full transition-all duration-200
                ${
                  location.pathname === "/dashboard"
                    ? "bg-emerald-500 scale-x-100 opacity-100"
                    : "bg-emerald-400 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                }
              `}
            />
          </button>

          {/* Environmental Dropdown */}
          <div className="relative dropdown-area">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEnvOpen((prev) => !prev);
                setGovOpen(false);
              }}
              className={`group relative px-2 py-1.5 text-sm lg:text-base font-medium rounded-full transition-all duration-200
                ${
                  isEnvActive || envOpen
                    ? "text-emerald-700 bg-emerald-50 shadow-sm"
                    : "text-slate-700 hover:text-emerald-700 hover:bg-white hover:shadow-sm"
                }
              `}
            >
              <span>Environmental</span>
              <span
                className={`absolute left-4 right-4 bottom-1 h-0.5 rounded-full transition-all duration-200
                  ${
                    isEnvActive || envOpen
                      ? "bg-emerald-500 scale-x-100 opacity-100"
                      : "bg-emerald-400 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                  }
                `}
              />
            </button>

            {envOpen && (
              <div
                className="absolute left-1/2 top-full z-20 mt-3 w-60 -translate-x-1/2 origin-top rounded-2xl border border-slate-100 
                bg-white/95 shadow-xl shadow-emerald-900/10 backdrop-blur-sm transition-all duration-200"
              >
                <ul className="py-2">
                  {environmentalLinks.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <button
                          onClick={() => {
                            handleNavClick(item.path);
                            setEnvOpen(false);
                          }}
                          className={`group flex w-full items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150
                            ${
                              active
                                ? "bg-emerald-50 text-emerald-700 font-semibold shadow-inner"
                                : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            }
                          `}
                        >
                          <span
                            className={`h-6 w-1 rounded-full transition-all duration-150
                              ${
                                active
                                  ? "bg-emerald-500"
                                  : "bg-transparent group-hover:bg-emerald-300"
                              }
                            `}
                          />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Governance Dropdown */}
          <div className="relative dropdown-area">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGovOpen((prev) => !prev);
                setEnvOpen(false);
              }}
              className={`group relative px-2 py-1.5 text-sm lg:text-base font-medium rounded-full transition-all duration-200
                ${
                  isGovActive || govOpen
                    ? "text-emerald-700 bg-emerald-50 shadow-sm"
                    : "text-slate-700 hover:text-emerald-700 hover:bg-white hover:shadow-sm"
                }
              `}
            >
              <span>Governance</span>
              <span
                className={`absolute left-4 right-4 bottom-1 h-0.5 rounded-full transition-all duration-200
                  ${
                    isGovActive || govOpen
                      ? "bg-emerald-500 scale-x-100 opacity-100"
                      : "bg-emerald-400 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                  }
                `}
              />
            </button>

            {govOpen && (
              <div
                className="absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 origin-top rounded-2xl border border-slate-100 
                bg-white/95 shadow-xl shadow-emerald-900/10 backdrop-blur-sm transition-all duration-200"
              >
                <ul className="py-2">
                  {governanceLinks.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => {
                            handleNavClick(item.path);
                            setGovOpen(false);
                          }}
                          className={`group flex w-full items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150
                            ${
                              active
                                ? "bg-emerald-50 text-emerald-700 font-semibold shadow-inner"
                                : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            }
                          `}
                        >
                          <span
                            className={`h-6 w-1 rounded-full transition-all duration-150
                              ${
                                active
                                  ? "bg-emerald-500"
                                  : "bg-transparent group-hover:bg-emerald-300"
                              }
                            `}
                          />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Data Import – moved AFTER Governance, same pill style */}
          <button
            onClick={() => handleNavClick("/dashboard/data-import")}
            className={`group relative px-2 py-1.5 text-sm lg:text-base font-medium rounded-full transition-all duration-200
              ${
                isDataImportActive
                  ? "text-orange-700 bg-orange-50 shadow-sm"
                  : "text-slate-700 hover:text-orange-700 hover:bg-white hover:shadow-sm"
              }
            `}
          >
            <span>Data Import</span>
            <span
              className={`absolute left-4 right-4 bottom-1 h-0.5 rounded-full transition-all duration-200
                ${
                  isDataImportActive
                    ? "bg-orange-500 scale-x-100 opacity-100"
                    : "bg-orange-400 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                }
              `}
            />
          </button>
        </div>
      </div>

      {/* Right Side (Desktop) */}
      <div className="hidden md:flex items-center space-x-4 z-10">
        <div
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => handleNavClick("/dashboard/profile")}
        >
          <div className="relative">
            <img
              src={avatar}
              alt="User Avatar"
              className="h-10 w-10 rounded-full object-cover border-2 border-emerald-600 transition-transform duration-200 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/30 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-200" />
          </div>
          <span className="text-xs sm:text-sm text-gray-800 font-medium mt-1">
            {userName}
          </span>
        </div>

        <button
          className="relative text-emerald-700 hover:text-emerald-900 transition-colors"
          onClick={() => handleNavClick("/dashboard/notifications")}
        >
          <FaBell size={22} />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <button
          onClick={onLogout}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="text-emerald-700 hover:text-emerald-900 md:hidden z-20 transition-colors"
        onClick={() => setMenuOpen(true)}
      >
        <FaBars size={22} />
      </button>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/30 z-20">
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-2xl p-6 flex flex-col">
            <button
              className="self-end text-emerald-700 hover:text-emerald-900 mb-6 transition-colors"
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
                className="h-16 w-16 rounded-full object-cover border-2 border-emerald-600 mb-2"
              />
              <span className="text-gray-900 font-semibold text-lg">
                {userName}
              </span>
            </div>

            {/* Overview */}
            <button
              onClick={() => handleNavClick("/dashboard")}
              className={`text-left w-full py-2 mb-1 text-sm font-medium rounded-md transition-all ${
                location.pathname === "/dashboard"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-800 hover:text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              Overview
            </button>

            {/* Environmental (mobile) */}
            <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-1">
              Environmental
            </p>
            {environmentalLinks.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`text-left w-full py-2 text-sm rounded-md ml-1 transition-all ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-800 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Governance (mobile) */}
            <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-1">
              Governance
            </p>
            {governanceLinks.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.path)}
                  className={`text-left w-full py-2 text-sm rounded-md ml-1 transition-all ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-800 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Data Import (mobile – after Governance) */}
            <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-1">
              Data
            </p>
            <button
              onClick={() => handleNavClick("/dashboard/data-import")}
              className={`text-left w-full py-2 mb-2 text-sm font-medium rounded-md ml-1 transition-all ${
                isDataImportActive
                  ? "bg-orange-50 text-orange-700"
                  : "text-gray-800 hover:text-orange-700 hover:bg-orange-50"
              }`}
            >
              Data Import
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="mt-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
