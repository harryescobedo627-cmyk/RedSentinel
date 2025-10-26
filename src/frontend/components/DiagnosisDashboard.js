/**
 * ROLE: Pitch Lead + Frontend
 * DiagnosisDashboard component - Visualizes RAG alerts and KPIs
 * - Groups alerts by severity (red/yellow/green)
 * - Displays key financial metrics
 * - Expandable alert details
 */
import { useState } from 'react';

export default function DiagnosisDashboard({ alerts = [], metrics = {} }) {
  const [expandedAlert, setExpandedAlert] = useState(null);

  // Group alerts by severity
  const alertsBySeverity = {
    red: alerts.filter(a => a.severity === 'red'),
    yellow: alerts.filter(a => a.severity === 'yellow'),
    green: alerts.filter(a => a.severity === 'green'),
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'red': return '🔴';
      case 'yellow': return '🟡';
      case 'green': return '🟢';
      default: return '⚪';
    }
  };

  const toggleAlert = (alertId) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  return (
    <div>
      {/* Key Metrics Section */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 style={{ marginBottom: '8px' }}>Key Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Current Cash</div>
            <div className="metric-value">${metrics.cashBalance?.toLocaleString() || '0'}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Monthly Burn Rate</div>
            <div className="metric-value" style={{ color: '#C8102E' }}>
              ${Math.abs(metrics.monthlyBurn || 0).toLocaleString()}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Runway</div>
            <div className="metric-value">{metrics.runway || '0'} months</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Gross Margin</div>
            <div className="metric-value" style={{ color: getHealthColor(metrics.grossMargin) }}>
              {metrics.grossMargin || '0'}%
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="card">
        <h3 style={{ marginBottom: '8px' }}>Alerts & Recommendations</h3>

        {/* Critical Alerts (Red) */}
        {alertsBySeverity.red.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#7A1C1C', marginBottom: '6px' }}>
              Critical Issues ({alertsBySeverity.red.length})
            </h4>
            {alertsBySeverity.red.map((alert) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                expanded={expandedAlert === alert.id}
                onToggle={() => toggleAlert(alert.id)}
              />
            ))}
          </div>
        )}

        {/* Warning Alerts (Yellow) */}
        {alertsBySeverity.yellow.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#92400E', marginBottom: '6px' }}>
              Warnings ({alertsBySeverity.yellow.length})
            </h4>
            {alertsBySeverity.yellow.map((alert) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                expanded={expandedAlert === alert.id}
                onToggle={() => toggleAlert(alert.id)}
              />
            ))}
          </div>
        )}

        {/* Good News (Green) */}
        {alertsBySeverity.green.length > 0 && (
          <div>
            <h4 style={{ color: '#065F46', marginBottom: '6px' }}>
              Positive Signals ({alertsBySeverity.green.length})
            </h4>
            {alertsBySeverity.green.map((alert) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                expanded={expandedAlert === alert.id}
                onToggle={() => toggleAlert(alert.id)}
              />
            ))}
          </div>
        )}

        {alerts.length === 0 && (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '24px' }}>
            No alerts found.
          </p>
        )}
      </div>

      <style jsx>{`
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          padding: 16px;
          background: #FFFFFF;
          border-radius: var(--radius);
          border: 1px solid var(--color-border);
        }

        .metric-label {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
          font-weight: 600;
        }

        .metric-value {
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}

function AlertCard({ alert, expanded, onToggle }) {
  const severityClass = `alert-${alert.severity}`;

  return (
    <div 
      className={`alert ${severityClass}`} 
      style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
      onClick={onToggle}
      aria-expanded={expanded}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{alert.title}</strong>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {alert.description || alert.message}
          </p>
        </div>
        <div style={{ fontSize: '1.5rem' }}>{expanded ? '▼' : '▶'}</div>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.9rem' }}><strong>Impacto:</strong> {alert.impact}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            <strong>Recomendación:</strong> {alert.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

function getHealthColor(score) {
  if (!score) return '#666';
  if (score >= 70) return '#059669';
  if (score >= 40) return '#d97706';
  return '#e53e3e';
}
