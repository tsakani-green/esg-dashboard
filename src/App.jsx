// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { SimulationProvider } from "./context/SimulationContext";

// ESG Category pages
import EnvironmentalCategory from "./pages/EnvironmentalCategory";
import SocialCategory from "./pages/SocialCategory";
import GovernanceCategory from "./pages/GovernanceCategory";
import Insights from "./pages/Insights";

// Environmental sub-pages
import Energy from "./pages/environment/Energy";
import Carbon from "./pages/environment/Carbon";
import Water from "./pages/environment/Water";
import Waste from "./pages/environment/Waste";
import Coal from "./pages/environment/Coal";

// Governance sub-pages
import CorporateGovernance from "./pages/governance/CorporateGovernance";
import EthicsCompliance from "./pages/governance/EthicsCompliance";
import DataPrivacySecurity from "./pages/governance/DataPrivacySecurity";
import SupplyChainGovernance from "./pages/governance/SupplyChainGovernance";

// Data Import / Operational View
import DataImport from "./pages/DataImport";

import ErrorBoundaryWrapper from "./components/ErrorBoundaryWrapper";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  const handleLogin = (name) => {
    setUsername(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUsername("");
    setIsAuthenticated(false);
  };

  return (
    <SimulationProvider>
      <Router>
        {isAuthenticated && (
          <Navbar userName={username} onLogout={handleLogout} />
        )}

        <Routes>
          {/* Root / Login */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          {/* Dashboard Overview */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <ErrorBoundaryWrapper>
                  <Dashboard />
                </ErrorBoundaryWrapper>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Data Import / Operational View */}
          <Route
            path="/dashboard/data-import"
            element={
              isAuthenticated ? <DataImport /> : <Navigate to="/" />
            }
          />

          {/* ESG AI Insights */}
          <Route
            path="/dashboard/esg"
            element={isAuthenticated ? <Insights /> : <Navigate to="/" />}
          />

          {/* Social main */}
          <Route
            path="/dashboard/social"
            element={
              isAuthenticated ? <SocialCategory /> : <Navigate to="/" />
            }
          />

          {/* Governance main */}
          <Route
            path="/dashboard/governance"
            element={
              isAuthenticated ? <GovernanceCategory /> : <Navigate to="/" />
            }
          />

          {/* Governance sub-pages (match Navbar governanceLinks) */}
          <Route
            path="/dashboard/governance/corporate"
            element={
              isAuthenticated ? (
                <CorporateGovernance />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard/governance/ethic"
            element={
              isAuthenticated ? (
                <EthicsCompliance />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard/governance/data"
            element={
              isAuthenticated ? (
                <DataPrivacySecurity />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard/governance/supply"
            element={
              isAuthenticated ? (
                <SupplyChainGovernance />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Environmental landing */}
          <Route
            path="/dashboard/environment"
            element={
              isAuthenticated ? (
                <EnvironmentalCategory />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Environmental sub-pages */}
          <Route
            path="/dashboard/environment/energy"
            element={isAuthenticated ? <Energy /> : <Navigate to="/" />}
          />
          <Route
            path="/dashboard/environment/carbon"
            element={isAuthenticated ? <Carbon /> : <Navigate to="/" />}
          />
          <Route
            path="/dashboard/environment/water"
            element={isAuthenticated ? <Water /> : <Navigate to="/" />}
          />
          <Route
            path="/dashboard/environment/waste"
            element={isAuthenticated ? <Waste /> : <Navigate to="/" />}
          />
          <Route
            path="/dashboard/environment/coal"
            element={isAuthenticated ? <Coal /> : <Navigate to="/" />}
          />

          {/* Legacy/simple routes – optional, can keep or remove */}
          <Route
            path="/environmental"
            element={
              isAuthenticated ? (
                <EnvironmentalCategory />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/social"
            element={
              isAuthenticated ? <SocialCategory /> : <Navigate to="/" />
            }
          />
          <Route
            path="/governance"
            element={
              isAuthenticated ? <GovernanceCategory /> : <Navigate to="/" />
            }
          />
          <Route
            path="/governance/corporate"
            element={
              isAuthenticated ? (
                <CorporateGovernance />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/governance/carbon"
            element={isAuthenticated ? <Carbon /> : <Navigate to="/" />}
          />
          <Route
            path="/governance/energy"
            element={isAuthenticated ? <Energy /> : <Navigate to="/" />}
          />
          <Route
            path="/governance/insights"
            element={isAuthenticated ? <Insights /> : <Navigate to="/" />}
          />

          {/* Catch-all */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Router>
    </SimulationProvider>
  );
}

export default App;
