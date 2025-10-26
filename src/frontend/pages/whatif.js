/**
 * ROLE: Pitch Lead + Frontend
 * What-If Simulator page - Interactive scenario testing
 * - Sliders to adjust key variables (pricing, costs, churn, etc.)
 * - "Recalculate" button to re-run forecast with new parameters
 * - Shows updated forecast chart with impact comparison
 */
import { useState, useEffect, useContext } from 'react';
import { AppContext } from './_app';
import { useRouter } from 'next/router';
import WhatIfSimulator from '../components/WhatIfSimulator';

export default function WhatIfPage() {
  const { jobId } = useContext(AppContext);
  const [baselineForecast, setBaselineForecast] = useState(null);
  const [simulatedForecast, setSimulatedForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (jobId) {
      fetchBaselineForecast();
    } else {
      // Load demo data for exploration
      setBaselineForecast([
        { date: '2025-11', value: 150000 },
        { date: '2025-12', value: 145000 },
        { date: '2026-01', value: 140000 },
        { date: '2026-02', value: 135000 }
      ]);
      setLoading(false);
    }
  }, [jobId]);

  const fetchBaselineForecast = async () => {
    console.log('🚀 Fetching baseline forecast for jobId:', jobId);
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/forecast?job_id=${jobId}&horizon=90`
      );
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Forecast data received:', data);
      
      // Extract the forecast data correctly based on the actual structure
      const forecast = data.forecast || data;
      const scenarios = forecast.scenarios || forecast.forecasts || forecast;
      const baseScenario = scenarios.base || scenarios;
      
      console.log('📊 Setting baseline forecast:', baseScenario);
      setBaselineForecast(baseScenario);
    } catch (err) {
      console.error('❌ Failed to load baseline forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (parameters) => {
    console.log('🎯 Simulating with parameters:', parameters);
    try {
      // Call forecast endpoint with modified parameters
      const response = await fetch(
        `http://localhost:4000/api/forecast?job_id=${jobId}&horizon=90`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parameters })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Simulation data received:', data);
      
      // Extract the forecast data correctly
      const forecast = data.forecast || data;
      const scenarios = forecast.scenarios || forecast.forecasts || forecast;
      const baseScenario = scenarios.base || scenarios;
      
      console.log('📊 Setting simulated forecast:', baseScenario);
      setSimulatedForecast(baseScenario);
    } catch (err) {
      console.error('❌ Simulation failed:', err);
    }
  };

  const handleViewRecommendations = () => {
    router.push('/recommendations');
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <p>Loading simulator...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ marginBottom: '8px' }}>
          What-If Simulator
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {jobId 
            ? "Adjust key business variables and see how they impact your cash forecast."
            : "Explore diferentes escenarios financieros con datos de demostración. Sube tu archivo para análisis personalizado."
          }
        </p>
        {!jobId && (
          <div className="alert alert-yellow" style={{ marginTop: '12px' }}>
            <strong>Modo Demo:</strong> Usa datos de ejemplo. Para análisis de tus datos reales, 
            <a href="/upload" style={{ color: 'var(--color-accent)', marginLeft: '4px' }}>sube tu archivo CSV</a>.
          </div>
        )}
      </div>

      <WhatIfSimulator 
        baselineForecast={baselineForecast}
        simulatedForecast={simulatedForecast}
        onSimulate={handleSimulate}
      />

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        {jobId ? (
          <button className="btn" onClick={handleViewRecommendations}>
            View AI Recommendations →
          </button>
        ) : (
          <div>
            <button className="btn-secondary" onClick={() => router.push('/upload')} style={{ marginRight: '8px' }}>
              Subir Datos Reales
            </button>
            <button className="btn" onClick={handleViewRecommendations}>
              Ver Recomendaciones Demo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
