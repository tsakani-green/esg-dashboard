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

// Environmental sub-pages (under src/pages/environment)
import Energy from "./pages/environment/Energy";
import Carbon from "./pages/environment/Carbon";
import Water from "./pages/environment/Water";
import Waste from "./pages/environment/Waste";
import Coal from "./pages/environment/Coal";

// Error Boundary wrapper
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

          {/* ESG Compliance main (Navbar: ESG Compliance) */}
          <Route
            path="/dashboard/esg"
            element={
              isAuthenticated ? <Insights /> : <Navigate to="/" />
            }
          />

          {/* Social & Governance main (Navbar: Social & Governance) */}
          <Route
            path="/dashboard/social"
            element={
              isAuthenticated ? <SocialCategory /> : <Navigate to="/" />
            }
          />

          {/* Optional governance-specific dashboard route */}
          <Route
            path="/dashboard/governance"
            element={
              isAuthenticated ? <GovernanceCategory /> : <Navigate to="/" />
            }
          />

          {/* Environmental dropdown routes (from Navbar: Environmental > ...) */}
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

          {/* Legacy/simple routes – keep if still used elsewhere */}
          <Route
            path="/environmental"
            element={
              isAuthenticated ? <EnvironmentalCategory /> : <Navigate to="/" />
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

          {/* Map /carbon to the new Carbon page as well */}
          <Route
            path="/carbon"
            element={isAuthenticated ? <Carbon /> : <Navigate to="/" />}
          />

          {/* Reuse the same Energy page for the old /energy route */}
          <Route
            path="/energy"
            element={isAuthenticated ? <Energy /> : <Navigate to="/" />}
          />

          <Route
            path="/insights"
            element={isAuthenticated ? <Insights /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </SimulationProvider>
  );
}

export default App;
