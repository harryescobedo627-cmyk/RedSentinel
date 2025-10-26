/**
 * ROLE: Pitch Lead + Frontend
 * Diagnose page - Shows RAG alerts and key metrics
 * - Calls GET /api/diagnose?job_id
 * - Displays alerts by severity (Red/Yellow/Green)
 * - Shows core financial metrics
 * - Provides navigation to forecast
 */
import { useState, useEffect, useContext } from 'react';
import { AppContext } from './_app';
import { useRouter } from 'next/router';
import DiagnosisDashboard from '../components/DiagnosisDashboard';

export default function DiagnosePage() {
  const { jobId } = useContext(AppContext);
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 Diagnose page loaded with jobId:', jobId);
    if (jobId) {
      console.log('📊 Fetching real data for job:', jobId);
      fetchDiagnosis();
    } else {
      console.log('🎭 Loading demo data (no jobId)');
      // Load demo diagnosis data
      setDiagnosisData({
        alerts: [
          { id: 1, severity: 'red', title: 'Flujo de caja crítico', description: 'Se proyecta déficit en los próximos 60 días' },
          { id: 2, severity: 'yellow', title: 'Alta concentración de clientes', description: '3 clientes representan 65% de ingresos' },
          { id: 3, severity: 'green', title: 'Márgenes saludables', description: 'Margen bruto del 42% está por encima del promedio sectorial' }
        ],
        metrics: {
          cashBalance: 85000,
          monthlyBurn: 45000,
          runway: 1.9,
          revenue: 125000
        }
      });
      setLoading(false);
    }
  }, [jobId]);

  const fetchDiagnosis = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching diagnosis from backend for jobId:', jobId);
      const response = await fetch(`http://localhost:4000/api/diagnose?job_id=${jobId}`);
      
      console.log('📥 Diagnosis response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Diagnosis fetch failed:', errorText);
        throw new Error(`Failed to fetch diagnosis: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Diagnosis data received:', data);
      
      // Si el backend devuelve { job_id, diagnosis }, usar solo diagnosis
      const diagnosis = data.diagnosis || data;
      console.log('📊 Setting diagnosis data:', diagnosis);
      setDiagnosisData(diagnosis);
    } catch (err) {
      console.error('❌ Diagnosis fetch error:', err);
      setError(`Failed to load diagnosis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewForecast = () => {
    router.push('/forecast');
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <p>Analyzing your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-red">{error}</div>
        <button className="btn" onClick={fetchDiagnosis} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ marginBottom: '8px' }}>
          Financial Health Diagnosis
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
          {jobId 
            ? "Our AI has analyzed your financial data and identified key areas requiring attention."
            : "Diagnóstico de demostración. Sube tu archivo CSV para análisis personalizado de tu empresa."
          }
        </p>
        {!jobId && (
          <div className="alert alert-yellow">
            <strong>Modo Demo:</strong> Mostrando análisis de ejemplo. 
            <a href="/upload" style={{ color: 'var(--color-accent)', marginLeft: '4px' }}>Sube tu archivo</a> para diagnóstico real.
          </div>
        )}
      </div>

      {diagnosisData && (
        <>
          <DiagnosisDashboard 
            alerts={diagnosisData.alerts || []} 
            metrics={diagnosisData.metrics || {}}
          />

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button className="btn" onClick={handleViewForecast}>
              View Cash Forecast →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
