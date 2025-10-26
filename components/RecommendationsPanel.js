/**
 * ROLE: Pitch Lead + Frontend
 * RecommendationsPanel component - Displays action plans
 * - Shows 3 plans (A/B/C) with details
 * - Highlights recommended plan
 * - Execute button with confirmation
 * - Shows execution results
 */
import { useState } from 'react';

export default function RecommendationsPanel({ plans, recommendedPlanId, executionResult, onExecute, isExecuting }) {
  console.log('📊 RecommendationsPanel received data:');
  console.log('- plans:', plans);
  console.log('- recommendedPlanId:', recommendedPlanId);
  console.log('- executionResult:', executionResult);
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setShowConfirm(true);
  };

  const handleConfirmExecute = () => {
    onExecute(selectedPlan);
    setShowConfirm(false);
  };

  return (
    <div>
      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isRecommended={plan.id === recommendedPlanId}
            onSelect={() => handleSelectPlan(plan.id)}
            disabled={isExecuting}
          />
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Confirm Execution</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Are you sure you want to execute Plan {selectedPlan}? 
              This will simulate the implementation of all actions in this plan.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn" 
                onClick={handleConfirmExecute}
                style={{ flex: 1 }}
              >
                ✅ Yes, Execute
              </button>
              <button 
                className="btn" 
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, background: '#e2e8f0', color: '#666' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Result */}
      {executionResult && (
        <div className="card" style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ marginBottom: '1rem', color: '#059669' }}>
            ✅ Plan Executed Successfully
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Updated Metrics:</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <MetricChange 
              label="Cash Position (Day 90)"
              before={executionResult.before?.cash_position}
              after={executionResult.after?.cash_position}
            />
            <MetricChange 
              label="Monthly Burn Rate"
              before={executionResult.before?.burn_rate}
              after={executionResult.after?.burn_rate}
              inverse
            />
            <MetricChange 
              label="Runway"
              before={executionResult.before?.runway_days}
              after={executionResult.after?.runway_days}
              unit="days"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

function PlanCard({ plan, isRecommended, onSelect, disabled }) {
  return (
    <div className="card" style={{ 
      borderLeft: isRecommended ? '4px solid #10b981' : '4px solid #cbd5e0',
      background: isRecommended ? '#f0fdf4' : 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ color: '#667eea' }}>{plan.title}</h3>
        {isRecommended && (
          <span style={{ 
            background: '#10b981', 
            color: 'white', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 'bold'
          }}>
            ⭐ Recomendado
          </span>
        )}
      </div>

      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {plan.description}
      </p>

      {/* Actions List */}
      <div style={{ marginBottom: '1.5rem' }}>
        <strong style={{ fontSize: '0.9rem', color: '#666' }}>Actions:</strong>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem' }}>
          {plan.actions?.map((action, idx) => (
            <li key={idx} style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
              {action}
            </li>
          ))}
        </ul>
      </div>

      {/* Impact Metrics */}
      <div style={{ 
        padding: '1rem', 
        background: 'white', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Impact</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>
              +{plan.impactEstimate?.cashIncreasePct ? (plan.impactEstimate.cashIncreasePct * 100).toFixed(0) : '0'}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Effort</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: getDifficultyColor(plan.effort) }}>
              {plan.effort || 'Medium'}
            </div>
          </div>
        </div>
      </div>

      <button 
        className="btn" 
        onClick={onSelect}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        {disabled ? '⏳ Executing...' : '🚀 Execute Plan'}
      </button>
    </div>
  );
}

function MetricChange({ label, before, after, inverse = false, unit = '$' }) {
  const change = after - before;
  const isPositive = inverse ? change < 0 : change > 0;
  const color = isPositive ? '#059669' : '#c53030';

  return (
    <div>
      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        {unit === '$' && '$'}{before?.toLocaleString()}{unit !== '$' && ` ${unit}`}
        {' → '}
        <span style={{ color }}>
          {unit === '$' && '$'}{after?.toLocaleString()}{unit !== '$' && ` ${unit}`}
        </span>
      </div>
      <div style={{ fontSize: '0.85rem', color, marginTop: '0.25rem' }}>
        {change > 0 ? '+' : ''}{unit === '$' && '$'}{Math.abs(change).toLocaleString()}{unit !== '$' && ` ${unit}`}
      </div>
    </div>
  );
}

function getDifficultyColor(difficulty) {
  switch(difficulty?.toLowerCase()) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#e53e3e';
    default: return '#666';
  }
}
