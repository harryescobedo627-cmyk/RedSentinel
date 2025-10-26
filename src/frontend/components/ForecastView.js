import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, BarChart, Bar } from 'recharts';

export default function ForecastView({ forecasts, breakRisk, horizon, rawData }) {
  const [viewType, setViewType] = useState('combined');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  console.log('📊 ForecastView received data:');
  console.log('- forecasts:', forecasts);
  console.log('- breakRisk:', breakRisk);
  console.log('- horizon:', horizon);
  console.log('- rawData:', rawData);
  
  // Transform forecast data for Recharts - ajustar para nueva estructura del backend
  const scenarios = forecasts.scenarios || forecasts.forecasts || forecasts; // Soportar múltiples estructuras
  
  console.log('📈 Extracted scenarios:', scenarios);
  
  if (!scenarios || !scenarios.base) {
    console.log('❌ No scenarios.base found');
    console.log('Available keys:', Object.keys(scenarios || {}));
    console.log('Full forecasts object:', forecasts);
    return <div className="card">No forecast data available</div>;
  }
  
  const chartData = scenarios.base.map((item, index) => ({
    day: item.day || index + 1,
    base: item.value || item.cash || 0,
    optimistic: scenarios.optimistic[index]?.value || scenarios.optimistic[index]?.cash || 0,
    pessimistic: scenarios.pessimistic[index]?.value || scenarios.pessimistic[index]?.cash || 0,
  }));

  const historicalData = rawData && Array.isArray(rawData) ? rawData.map((item, index) => {
    const prevItem = index > 0 ? rawData[index - 1] : item;
    return {
      month: index + 1,
      income: item.income || 0,
      expenses: item.expenses || 0,
      netFlow: (item.income || 0) - (item.expenses || 0),
      cashChange: index > 0 ? (item.cash || 0) - (prevItem.cash || 0) : 0,
    };
  }) : [];

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setZoomLevel(1);

  const chartHeight = Math.round(400 * zoomLevel);

  console.log('📈 Historical data processed:');
  console.log('- rawData length:', rawData?.length || 0);
  console.log('- historicalData length:', historicalData.length);
  console.log('- first 3 historical records:', historicalData.slice(0, 3));

  return (
    <div>
      {breakRisk && breakRisk.days_to_break && (
        <div className="card" style={{ marginBottom: '16px', background: '#FFF5F5', borderLeft: '4px solid #C8102E' }}>
          <h3 style={{ color: '#7A1C1C', marginBottom: '6px' }}>Cash Flow Risk</h3>
          <p style={{ color: '#7A1C1C' }}>
            Projected cash depletion in <strong>{breakRisk.days_to_break} days</strong> (base scenario).
          </p>
        </div>
      )}

      {historicalData.length > 0 ? (
        <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Monthly Financial Variations</h3>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button 
                  onClick={zoomOut}
                  disabled={zoomLevel <= 0.5}
                  style={{ 
                    padding: '4px 8px', 
                    background: zoomLevel <= 0.5 ? '#f5f5f5' : '#3B82F6',
                    color: zoomLevel <= 0.5 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: zoomLevel <= 0.5 ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🔍-
                </button>
                <span style={{ fontSize: '12px', color: '#666', minWidth: '35px', textAlign: 'center' }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button 
                  onClick={zoomIn}
                  disabled={zoomLevel >= 3}
                  style={{ 
                    padding: '4px 8px', 
                    background: zoomLevel >= 3 ? '#f5f5f5' : '#3B82F6',
                    color: zoomLevel >= 3 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: zoomLevel >= 3 ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🔍+
                </button>
                <button 
                  onClick={resetZoom}
                  style={{ 
                    padding: '4px 8px', 
                    background: '#6B7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Reset
                </button>
              </div>
              
              <select 
                value={viewType} 
                onChange={(e) => setViewType(e.target.value)}
                style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="combined">Bars + Lines</option>
                <option value="bars">Only Bars</option>
                <option value="lines">Only Lines</option>
              </select>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={chartHeight}>
            {viewType === 'bars' ? (
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  domain={[0, 'dataMax + 10000']}
                />
                <Tooltip 
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => `Month ${label}`}
                />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            ) : viewType === 'lines' ? (
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  domain={['dataMin - 5000', 'dataMax + 10000']}
                />
                <Tooltip 
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => `Month ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={4}
                  name="Income"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={4}
                  name="Expenses"
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="netFlow"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Net Flow"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            ) : (
              <ComposedChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  domain={[0, 'dataMax + 10000']}
                />
                <Tooltip 
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => `Month ${label}`}
                />
                <Legend />
                
                <Bar dataKey="income" fill="#10B981" name="Income" opacity={0.7} />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" opacity={0.6} />
                
                <Line
                  type="monotone"
                  dataKey="netFlow"
                  stroke="#3B82F6"
                  strokeWidth={4}
                  name="Net Flow"
                  dot={{ fill: '#3B82F6', strokeWidth: 3, r: 8 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
          
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ padding: '8px', background: '#F0FDF4', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ color: '#15803D', fontWeight: 'bold' }}>
                Max Income: ${Math.max(...historicalData.map(d => d.income)).toLocaleString()}
              </div>
            </div>
            <div style={{ padding: '8px', background: '#FEF2F2', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ color: '#DC2626', fontWeight: 'bold' }}>
                Max Expenses: ${Math.max(...historicalData.map(d => d.expenses)).toLocaleString()}
              </div>
            </div>
            <div style={{ padding: '8px', background: '#EFF6FF', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ color: '#2563EB', fontWeight: 'bold' }}>
                Avg Net Flow: ${(historicalData.reduce((acc, d) => acc + d.netFlow, 0) / historicalData.length).toLocaleString()}
              </div>
            </div>
            <div style={{ padding: '8px', background: '#F5F5F5', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ color: '#374151', fontWeight: 'bold' }}>
                Records: {historicalData.length}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '20px', textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: '#666', marginBottom: '1rem' }}>📊 Historical Data</h3>
          <p style={{ color: '#999' }}>
            {rawData ? 
              `No historical data available (received ${rawData.length || 0} records)` :
              'Historical data is loading... If you just uploaded a new file, try refreshing the page.'
            }
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            <strong>Debug info:</strong><br/>
            Raw data: {rawData ? `${rawData.length} records` : 'null'}<br/>
            Historical data: {historicalData.length} processed records
          </div>
        </div>
      )}

      <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Cash Position Forecast (Next {horizon} days)</h3>
          
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button 
              onClick={zoomOut}
              disabled={zoomLevel <= 0.5}
              style={{ 
                padding: '4px 8px', 
                background: zoomLevel <= 0.5 ? '#f5f5f5' : '#3B82F6',
                color: zoomLevel <= 0.5 ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: zoomLevel <= 0.5 ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              🔍-
            </button>
            <span style={{ fontSize: '12px', color: '#666', minWidth: '35px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={zoomIn}
              disabled={zoomLevel >= 3}
              style={{ 
                padding: '4px 8px', 
                background: zoomLevel >= 3 ? '#f5f5f5' : '#3B82F6',
                color: zoomLevel >= 3 ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: zoomLevel >= 3 ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              🔍+
            </button>
            <button 
              onClick={resetZoom}
              style={{ 
                padding: '4px 8px', 
                background: '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Reset
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Cash ($)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              domain={['dataMin - 10000', 'dataMax + 10000']}
              scale="linear"
            />
            <Tooltip 
              formatter={(value) => `$${value.toLocaleString()}`}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="base"
              stroke="#1F2937"
              strokeWidth={2.5}
              name="Base"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="optimistic"
              stroke="#9CA3AF"
              strokeWidth={2}
              name="Optimistic"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="pessimistic"
              stroke="#C8102E"
              strokeWidth={2}
              name="Pessimistic"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <ScenarioCard 
            title="Optimistic"
            color="#9CA3AF"
            endCash={scenarios.optimistic[scenarios.optimistic.length - 1]?.value || scenarios.optimistic[scenarios.optimistic.length - 1]?.cash}
          />
          <ScenarioCard 
            title="Base Case"
            color="#1F2937"
            endCash={scenarios.base[scenarios.base.length - 1]?.value || scenarios.base[scenarios.base.length - 1]?.cash}
          />
          <ScenarioCard 
            title="Pessimistic"
            color="#C8102E"
            endCash={scenarios.pessimistic[scenarios.pessimistic.length - 1]?.value || scenarios.pessimistic[scenarios.pessimistic.length - 1]?.cash}
          />
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ title, color, endCash }) {
  return (
    <div style={{ 
      padding: '12px', 
      background: '#FFFFFF', 
      borderRadius: '3px',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '0.9rem', color: '#5C5C5C', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 600, color }}>
        ${endCash?.toLocaleString() || '0'}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#5C5C5C', marginTop: '4px' }}>
        at day end
      </div>
    </div>
  );
}
