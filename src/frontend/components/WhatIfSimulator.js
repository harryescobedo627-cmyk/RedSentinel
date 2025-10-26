/**
 * ROLE: Pitch Lead + Frontend
 * WhatIfSimulator component - Interactive parameter controls
 * - Sliders for key variables (revenue growth, cost reduction, churn, etc.)
 * - Shows parameter impact in real-time
 * - Comparison chart between baseline and simulated scenarios
 */
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WhatIfSimulator({ baselineForecast, simulatedForecast, onSimulate }) {
  console.log('📊 WhatIfSimulator received data:');
  console.log('- baselineForecast:', baselineForecast);
  console.log('- simulatedForecast:', simulatedForecast);
  console.log('- baselineForecast length:', baselineForecast?.length);
  
  const [parameters, setParameters] = useState({
    revenueGrowth: 0,      // % change in monthly revenue
    costReduction: 0,       // % reduction in costs
    pricingIncrease: 0,     // % increase in pricing
    churnReduction: 0,      // % reduction in customer churn
    newCustomers: 0,        // additional customers per month
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [localSimulated, setLocalSimulated] = useState(null);

  // Use local simulation if no onSimulate function provided (demo mode)
  const currentSimulated = simulatedForecast || localSimulated;

  const handleSliderChange = (param, value) => {
    setParameters(prev => ({ ...prev, [param]: parseFloat(value) }));
  };

  const handleRecalculate = async () => {
    console.log('🎯 Starting simulation with parameters:', parameters);
    setIsSimulating(true);
    
    // Always simulate locally (backend doesn't have what-if endpoint)
    const simulated = baselineForecast?.map((item, index) => {
      const baseValue = item.value || item.cash || 0;
      console.log(`Processing day ${index + 1}, base value: ${baseValue}`);
      
      // Apply parameter effects
      let adjustedValue = baseValue;
      
      // Revenue growth affects income
      adjustedValue *= (1 + parameters.revenueGrowth / 100);
      
      // Cost reduction affects expenses (positive effect on cash)
      adjustedValue *= (1 + parameters.costReduction / 100);
      
      // Pricing increase affects revenue
      adjustedValue *= (1 + parameters.pricingIncrease / 100);
      
      // New customers add to monthly revenue
      adjustedValue += parameters.newCustomers * 1000; // $1k per new customer
      
      // Churn reduction improves retention (positive effect)
      adjustedValue *= (1 + parameters.churnReduction / 100);
      
      console.log(`Day ${index + 1}: ${baseValue} → ${Math.round(adjustedValue)}`);
      
      return {
        ...item,
        value: Math.round(adjustedValue),
        cash: Math.round(adjustedValue) // Support both formats
      };
    });
    
    console.log('✅ Simulation complete, setting results');
    setLocalSimulated(simulated);
    setIsSimulating(false);
  };

  const handleReset = () => {
    console.log('🔄 Resetting simulation parameters');
    setParameters({
      revenueGrowth: 0,
      costReduction: 0,
      pricingIncrease: 0,
      churnReduction: 0,
      newCustomers: 0,
    });
    // Clear simulated data to go back to baseline only
    setLocalSimulated(null);
    console.log('✅ Reset complete - back to baseline only');
  };

  // Prepare chart data
  const chartData = baselineForecast?.map((item, index) => ({
    day: index + 1,
    baseline: item.value || item.cash || 0,
    simulated: currentSimulated?.[index]?.value || currentSimulated?.[index]?.cash || null,
  })) || [];

  console.log('📈 Chart data prepared:');
  console.log('- chartData length:', chartData.length);
  console.log('- first 3 items:', chartData.slice(0, 3));
  console.log('- baseline data sample:', baselineForecast?.slice(0, 3));

  const impactAmount = currentSimulated && baselineForecast
    ? (currentSimulated[currentSimulated.length - 1]?.value || currentSimulated[currentSimulated.length - 1]?.cash || 0) - 
      (baselineForecast[baselineForecast.length - 1]?.value || baselineForecast[baselineForecast.length - 1]?.cash || 0)
    : 0;

  return (
    <div>
      {/* Parameter Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>⚙️ Adjust Parameters</h3>

        <SliderControl
          label="Revenue Growth"
          value={parameters.revenueGrowth}
          onChange={(v) => handleSliderChange('revenueGrowth', v)}
          min={-50}
          max={50}
          step={5}
          unit="%"
          description="Monthly revenue change"
        />

        <SliderControl
          label="Cost Reduction"
          value={parameters.costReduction}
          onChange={(v) => handleSliderChange('costReduction', v)}
          min={0}
          max={50}
          step={5}
          unit="%"
          description="Reduce operating expenses"
        />

        <SliderControl
          label="Pricing Increase"
          value={parameters.pricingIncrease}
          onChange={(v) => handleSliderChange('pricingIncrease', v)}
          min={0}
          max={30}
          step={2}
          unit="%"
          description="Increase product/service prices"
        />

        <SliderControl
          label="Churn Reduction"
          value={parameters.churnReduction}
          onChange={(v) => handleSliderChange('churnReduction', v)}
          min={0}
          max={50}
          step={5}
          unit="%"
          description="Reduce customer churn rate"
        />

        <SliderControl
          label="New Customers"
          value={parameters.newCustomers}
          onChange={(v) => handleSliderChange('newCustomers', v)}
          min={0}
          max={100}
          step={10}
          unit="customers/month"
          description="Additional customer acquisition"
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn" 
            onClick={handleRecalculate}
            disabled={isSimulating}
            style={{ flex: 1 }}
          >
            {isSimulating ? '⏳ Calculating...' : '🔄 Recalculate Forecast'}
          </button>
          <button 
            className="btn" 
            onClick={handleReset}
            style={{ flex: 1, background: '#e2e8f0', color: '#666' }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Impact Summary */}
      {currentSimulated && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📊 Impact Summary</h3>
          <div style={{ 
            padding: '1.5rem', 
            background: impactAmount > 0 ? '#f0fdf4' : '#fee',
            borderRadius: '8px',
            borderLeft: `4px solid ${impactAmount > 0 ? '#10b981' : '#e53e3e'}`
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
              Net Impact (Day 90)
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: impactAmount > 0 ? '#059669' : '#c53030'
            }}>
              {impactAmount > 0 ? '+' : ''}${impactAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              {impactAmount > 0 
                ? '✅ Your changes improve cash position' 
                : '⚠️ Your changes worsen cash position'}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      {baselineForecast && chartData.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>
            📈 {currentSimulated ? 'Baseline vs. Simulated' : 'Baseline Forecast'}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Cash ($)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={['dataMin - 5000', 'dataMax + 5000']}
                scale="linear"
              />
              <Tooltip 
                formatter={(value) => value ? `$${value.toLocaleString()}` : 'N/A'}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                stroke="#2563eb" 
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Baseline"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="simulated" 
                stroke="#059669" 
                strokeWidth={3}
                name="Simulated"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function SliderControl({ label, value, onChange, min, max, step, unit, description }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ fontWeight: '600', color: '#333' }}>{label}</label>
        <span style={{ 
          padding: '0.25rem 0.75rem', 
          background: '#667eea', 
          color: 'white', 
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', cursor: 'pointer' }}
      />
      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
        {description}
      </div>
    </div>
  );
}
