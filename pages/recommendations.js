/**
 * ROLE: Pitch Lead + Frontend
 * Recommendations page - Shows AI-generated action plans
 * - Calls POST /api/recommend
 * - Displays 3 plans (A/B/C) with impact estimates
 * - Highlights recommended plan
 * - "Execute" button triggers /api/execute
 */
import { useState, useEffect, useContext } from 'react';
import { AppContext } from './_app';
import { useRouter } from 'next/router';
import RecommendationsPanel from '../components/RecommendationsPanel';

export default function RecommendationsPage() {
  const { jobId } = useContext(AppContext);
  const [recommendations, setRecommendations] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (jobId) {
      fetchRecommendations();
    } else {
      // Load demo recommendations data con estructura correcta
      setRecommendations({
        plans: [
          {
            id: 'demo-1',
            title: 'Optimización de Flujo de Caja',
            description: 'Acelera cobros y negocia plazos de pago para mejorar liquidez inmediata',
            category: 'cash_optimization',
            priority: 'high',
            effort: 'medium',
            timeframe: '4-6 semanas',
            impactEstimate: {
              cashIncreasePct: 0.15,
              timeToImplement: 30,
              riskLevel: 'low'
            },
            actions: [
              'Implementar facturación automática',
              'Revisar términos con proveedores principales',
              'Establecer descuentos por pronto pago',
              'Automatizar seguimiento de cobranza'
            ],
            kpis: [
              'Días promedio de cobranza',
              'Flujo de caja semanal',
              'Liquidez disponible'
            ]
          },
          {
            id: 'demo-2', 
            title: 'Reducción Estratégica de Costos',
            description: 'Identifica y elimina gastos no esenciales sin afectar operaciones core',
            category: 'cost_optimization',
            priority: 'medium',
            effort: 'low',
            timeframe: '2-4 semanas',
            impactEstimate: {
              cashIncreasePct: 0.08,
              timeToImplement: 15,
              riskLevel: 'low'
            },
            actions: [
              'Auditar suscripciones y servicios',
              'Optimizar gastos operativos',
              'Renegociar contratos principales',
              'Implementar controles de gastos'
            ],
            kpis: [
              'Reducción mensual de costos',
              'ROI de optimizaciones',
              'Savings rate'
            ]
          },
          {
            id: 'demo-3',
            title: 'Diversificación de Ingresos',
            description: 'Explora nuevas líneas de negocio y fuentes de ingresos complementarias',
            category: 'revenue_growth',
            priority: 'low',
            effort: 'high',
            timeframe: '12-16 semanas',
            impactEstimate: {
              cashIncreasePct: 0.25,
              timeToImplement: 90,
              riskLevel: 'medium'
            },
            actions: [
              'Investigar mercados adyacentes',
              'Desarrollar productos complementarios',
              'Establecer partnerships estratégicos',
              'Lanzar programa piloto'
            ],
            kpis: [
              'Nuevos ingresos generados',
              'Market share en nuevos segmentos',
              'Customer acquisition cost'
            ]
          }
        ],
        recommended: {
          id: 'demo-1'
        }
      });
      setLoading(false);
    }
  }, [jobId]);

  const fetchRecommendations = async () => {
    console.log('🚀 Fetching recommendations for jobId:', jobId);
    setLoading(true);
    try {
      const requestBody = { job_id: jobId };
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch('http://localhost:4000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Recommendations data received:', data);
      console.log('📋 Data structure:');
      console.log('- data.recommendations:', data.recommendations);
      console.log('- typeof data.recommendations:', typeof data.recommendations);
      console.log('- data.recommendations.plans:', data.recommendations?.plans);
      console.log('- data.recommendations.recommended:', data.recommendations?.recommended);
      setRecommendations(data);
    } catch (err) {
      console.error('❌ Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePlan = async (planId) => {
    setExecuting(true);
    try {
      const response = await fetch('http://localhost:4000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          job_id: jobId,
          plan_id: planId 
        })
      });
      const data = await response.json();
      setExecutionResult(data);
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <p>Generating recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ marginBottom: '8px' }}>
          AI-Powered Recommendations
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {jobId 
            ? "Based on your financial data, we've generated three action plans."
            : "Recomendaciones de demostración. Sube tu archivo para planes personalizados según tu situación financiera."
          }
        </p>
        {!jobId && (
          <div className="alert alert-yellow" style={{ marginTop: '12px' }}>
            <strong>Modo Demo:</strong> Planes de ejemplo. 
            <a href="/upload" style={{ color: 'var(--color-accent)', marginLeft: '4px' }}>Sube tu CSV</a> para recomendaciones personalizadas.
          </div>
        )}
      </div>

      {recommendations && (
        <RecommendationsPanel 
          plans={recommendations.recommendations?.plans || recommendations.plans || []}
          recommendedPlanId={recommendations.recommendations?.recommended?.id || recommendations.recommended?.id || recommendations.recommended_plan_id}
          executionResult={executionResult}
          onExecute={handleExecutePlan}
          isExecuting={executing}
        />
      )}
    </div>
  );
}
