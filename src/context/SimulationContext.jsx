import React, { createContext, useState, useEffect } from "react";

export const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const [environmentalMetrics, setEnvironmentalMetrics] = useState(null);
  const [environmentalInsights, setEnvironmentalInsights] = useState([]);
  const [socialMetrics, setSocialMetrics] = useState(null);
  const [socialInsights, setSocialInsights] = useState([]);
  const [governanceMetrics, setGovernanceMetrics] = useState(null);
  const [governanceInsights, setGovernanceInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async (endpoint, setMetrics, setInsights) => {
      try {
        const res = await fetch(`http://localhost:5000/api/${endpoint}`);
        const data = await res.json();
        setMetrics(data.metrics || {});
        // ✅ Just use what backend gives, default to empty list
        setInsights(data.insights || []);
      } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
        setMetrics({});
        // ✅ On error, no AI insights instead of that long sentence
        setInsights([]);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategory(
          "environmental-insights",
          setEnvironmentalMetrics,
          setEnvironmentalInsights
        ),
        fetchCategory("social-insights", setSocialMetrics, setSocialInsights),
        fetchCategory(
          "governance-insights",
          setGovernanceMetrics,
          setGovernanceInsights
        ),
      ]);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        environmentalMetrics,
        environmentalInsights,
        socialMetrics,
        socialInsights,
        governanceMetrics,
        governanceInsights,
        loading,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
