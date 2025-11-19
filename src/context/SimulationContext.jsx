// src/context/SimulationContext.jsx
import React, { createContext, useCallback, useEffect, useState } from "react";

export const SimulationContext = createContext({
  environmentalMetrics: null,
  socialMetrics: null,
  governanceMetrics: null,
  environmentalInsights: [],
  socialInsights: [],
  governanceInsights: [],
  loading: false,
  error: null,
  refreshAll: () => {},
});

const API_BASE = "http://localhost:5000";

export const SimulationProvider = ({ children }) => {
  const [environmentalMetrics, setEnvironmentalMetrics] = useState(null);
  const [socialMetrics, setSocialMetrics] = useState(null);
  const [governanceMetrics, setGovernanceMetrics] = useState(null);

  const [environmentalInsights, setEnvironmentalInsights] = useState([]);
  const [socialInsights, setSocialInsights] = useState([]);
  const [governanceInsights, setGovernanceInsights] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch latest metrics + AI insights from backend (LIVE)
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [envRes, socRes, govRes] = await Promise.all([
        fetch(`${API_BASE}/api/environmental-insights`),
        fetch(`${API_BASE}/api/social-insights`),
        fetch(`${API_BASE}/api/governance-insights`),
      ]);

      if (!envRes.ok || !socRes.ok || !govRes.ok) {
        throw new Error("One or more ESG endpoints returned an error.");
      }

      const [envData, socData, govData] = await Promise.all([
        envRes.json(),
        socRes.json(),
        govRes.json(),
      ]);

      setEnvironmentalMetrics(envData.metrics || null);
      setEnvironmentalInsights(envData.insights || []);

      setSocialMetrics(socData.metrics || null);
      setSocialInsights(socData.insights || []);

      setGovernanceMetrics(govData.metrics || null);
      setGovernanceInsights(govData.insights || []);
    } catch (err) {
      console.error("SimulationContext refreshAll error:", err);
      setError("Failed to load ESG metrics and AI insights.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <SimulationContext.Provider
      value={{
        environmentalMetrics,
        socialMetrics,
        governanceMetrics,
        environmentalInsights,
        socialInsights,
        governanceInsights,
        loading,
        error,
        refreshAll,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
