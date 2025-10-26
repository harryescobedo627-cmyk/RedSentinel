import { useState, useEffect, useContext } from 'react';
import { AppContext } from './_app';
import { useRouter } from 'next/router';
import ForecastView from '../components/ForecastView';

export default function ForecastPage() {
  const { jobId } = useContext(AppContext);
  const [forecastData, setForecastData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [horizon, setHorizon] = useState(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (jobId) {
      fetchForecast();
      fetchHistoricalData();
    } else {
      setForecastData({
        scenarios: {
          base: [
            { date: '2025-11', day: 1, value: 150000 },
            { date: '2025-12', day: 31, value: 145000 },
            { date: '2026-01', day: 62, value: 140000 },
            { date: '2026-02', day: 93, value: 135000 }
          ],
          optimistic: [
            { date: '2025-11', day: 1, value: 165000 },
            { date: '2025-12', day: 31, value: 162000 },
            { date: '2026-01', day: 62, value: 158000 },
            { date: '2026-02', day: 93, value: 155000 }
          ],
          pessimistic: [
            { date: '2025-11', day: 1, value: 135000 },
            { date: '2025-12', day: 31, value: 128000 },
            { date: '2026-01', day: 62, value: 122000 },
            { date: '2026-02', day: 93, value: 115000 }
          ]
        },
        break_risk: {
          probability: 0.2,
          days_to_break: 150,
          runway_months: 4.5
        }
      });
      setHistoricalData([
        { cash: 30000, income: 15000, expenses: 12000 },
        { cash: 33000, income: 2000, expenses: -1000 },
        { cash: 36000, income: 85000, expenses: 82000 },
        { cash: 39000, income: 5000, expenses: 2000 },
        { cash: 42000, income: 120000, expenses: 117000 },
        { cash: 45000, income: 1000, expenses: -2000 },
        { cash: 48000, income: 95000, expenses: 92000 },
        { cash: 51000, income: 8000, expenses: 5000 },
        { cash: 54000, income: 150000, expenses: 147000 },
        { cash: 57000, income: 3000, expenses: 0 },
        { cash: 60000, income: 180000, expenses: 177000 },
        { cash: 63000, income: 12000, expenses: 9000 }
      ]);
      setLoading(false);
    }
  }, [jobId, horizon]);

  const fetchHistoricalData = async () => {
    try {
      const url = `http://localhost:4000/api/data?job_id=${jobId}`;
      console.log('📤 Fetching historical data from:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Historical data received:', data);
        console.log('📊 Setting historical data with', data.data?.length || 0, 'records');
        setHistoricalData(data.data || data);
      } else {
        console.log('⚠️ Historical data response not ok:', response.status);
        setHistoricalData(null);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch historical data:', error);
      setHistoricalData(null);
    }
  };

  const fetchForecast = async () => {
    console.log('🚀 Fetching forecast for jobId:', jobId, 'horizon:', horizon);
    setLoading(true);
    setError(null);

    try {
      const url = `http://localhost:4000/api/forecast?job_id=${jobId}&horizon=${horizon}`;
      console.log('📤 Request URL:', url);
      
      const response = await fetch(url);
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error('Failed to fetch forecast');
      }

      const data = await response.json();
      console.log('✅ Forecast data received:', data);
      
      const forecast = data.forecast || data;
      console.log('📊 Setting forecast data:', forecast);
      setForecastData(forecast);
    } catch (err) {
      console.error('❌ Fetch forecast error:', err);
      setError('Failed to load forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIf = () => {
    router.push('/whatif');
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <p>Generating cash forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-red">{error}</div>
        <button className="btn" onClick={fetchForecast} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>
            Cash Flow Forecast
          </h2>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
          {jobId 
            ? `Projected cash position over the next ${horizon} days in three scenarios.`
            : `Pronóstico de demostración a ${horizon} días. Sube tu archivo para proyecciones personalizadas.`
          }
        </p>
        {!jobId && (
          <div className="alert alert-yellow" style={{ marginBottom: '12px' }}>
            <strong>Modo Demo:</strong> Datos de ejemplo. 
            <a href="/upload" style={{ color: 'var(--color-accent)', marginLeft: '4px' }}>Sube tu CSV</a> para pronósticos reales.
          </div>
        )}

        {/* Horizon Selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              className={horizon === days ? 'btn' : 'btn btn-secondary'}
              onClick={() => setHorizon(days)}
              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {forecastData && (
        <>
          <ForecastView 
            forecasts={forecastData}
            breakRisk={forecastData.break_risk}
            horizon={horizon}
            rawData={historicalData}
          />

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button className="btn" onClick={handleWhatIf}>
              Try What-If Scenarios →
            </button>
          </div>
        </>
      )}
    </div>
  );
}