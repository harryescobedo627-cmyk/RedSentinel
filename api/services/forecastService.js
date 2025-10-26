/**
 * ROLE: Backend Lead - Forecast Service
 * Genera pronósticos de cash flow en múltiples escenarios
 * - Análisis de tendencias históricas
 * - Proyecciones base, optimista y pesimista
 * - Cálculo de riesgo de quiebra y runway
 */

function safeNumber(v) {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

function sum(arr) { 
  return arr.reduce((s, x) => s + (isNaN(x) ? 0 : x), 0); 
}

function detectColumn(data, patterns) {
  const sample = data[0] || {};
  return Object.keys(sample).find(k => 
    patterns.some(pattern => new RegExp(pattern, 'i').test(k))
  );
}

function generateForecast(data, params = {}) {
  const horizon = params.horizon || 90;
  const sample = Array.isArray(data) ? data : [];
  
  console.log(`📈 Generating ${horizon}-day forecast from ${sample.length} data points...`);

  if (!sample.length) {
    return generateDemoForecast(horizon);
  }

  // Detectar columnas relevantes
  const cashKey = detectColumn(sample, ['cash', 'balance', 'closing', 'efectivo', 'saldo']);
  const incomeKey = detectColumn(sample, ['income', 'revenue', 'ingreso', 'venta']);
  const expenseKey = detectColumn(sample, ['expense', 'cost', 'gasto', 'costo']);

  console.log(`🔍 Using columns - Cash: ${cashKey}, Income: ${incomeKey}, Expense: ${expenseKey}`);

  // Extraer series de tiempo
  const cashSeries = cashKey ? sample.map(r => safeNumber(r[cashKey])).filter(x => !isNaN(x)) : [];
  const incomeSeries = incomeKey ? sample.map(r => safeNumber(r[incomeKey])).filter(x => !isNaN(x)) : [];
  const expenseSeries = expenseKey ? sample.map(r => safeNumber(r[expenseKey])).filter(x => !isNaN(x)) : [];

  // Calcular métricas base
  const latestCash = cashSeries.length ? cashSeries[cashSeries.length - 1] : 100000;
  const avgIncome = incomeSeries.length ? sum(incomeSeries) / incomeSeries.length : 50000;
  const avgExpense = expenseSeries.length ? sum(expenseSeries) / expenseSeries.length : 45000;
  const monthlyNetFlow = avgIncome - avgExpense;
  const dailyNetFlow = monthlyNetFlow / 30;

  // Calcular volatilidad para escenarios
  let volatility = 0.15; // default 15%
  if (cashSeries.length >= 3) {
    const changes = [];
    for (let i = 1; i < cashSeries.length; i++) {
      const change = (cashSeries[i] - cashSeries[i-1]) / cashSeries[i-1];
      if (Number.isFinite(change)) changes.push(Math.abs(change));
    }
    if (changes.length) {
      volatility = Math.min(0.3, Math.max(0.05, sum(changes) / changes.length));
    }
  }

  // Generar proyecciones por día
  const forecasts = {
    base: [],
    optimistic: [],
    pessimistic: []
  };

  let currentCash = latestCash;
  
  for (let day = 1; day <= horizon; day++) {
    // Base scenario: tendencia actual
    currentCash += dailyNetFlow;
    const baseValue = Math.max(0, currentCash);
    
    // Optimistic: +20% mejor flujo + reducción de volatilidad
    const optimisticValue = Math.max(0, currentCash + (dailyNetFlow * 0.2) + (baseValue * volatility * 0.1));
    
    // Pessimistic: -20% peor flujo + aumento de volatilidad  
    const pessimisticValue = Math.max(0, currentCash - (dailyNetFlow * 0.2) - (baseValue * volatility * 0.1));

    // Formatear fecha
    const date = new Date();
    date.setDate(date.getDate() + day);
    const formattedDate = date.toISOString().split('T')[0];

    forecasts.base.push({
      date: formattedDate,
      day: day,
      value: Math.round(baseValue)
    });

    forecasts.optimistic.push({
      date: formattedDate,
      day: day,
      value: Math.round(optimisticValue)
    });

    forecasts.pessimistic.push({
      date: formattedDate,
      day: day,
      value: Math.round(pessimisticValue)
    });
  }

  // Calcular riesgo de quiebra
  const breakRisk = calculateBreakRisk(forecasts, latestCash, dailyNetFlow);

  console.log(`✅ Forecast generated - Break risk: ${(breakRisk.probability * 100).toFixed(1)}%`);

  return {
    horizon,
    starting_cash: Math.round(latestCash),
    daily_net_flow: Math.round(dailyNetFlow),
    monthly_net_flow: Math.round(monthlyNetFlow),
    volatility: Math.round(volatility * 100) / 100,
    forecasts,
    break_risk: breakRisk,
    metadata: {
      data_points: sample.length,
      detected_columns: { cashKey, incomeKey, expenseKey }
    }
  };
}

function calculateBreakRisk(forecasts, startingCash, dailyNetFlow) {
  // Encontrar primer día donde cash <= 0 en cada escenario
  const findBreakDay = (series) => {
    const breakPoint = series.find(point => point.value <= 0);
    return breakPoint ? breakPoint.day : null;
  };

  const baseBreak = findBreakDay(forecasts.base);
  const optimisticBreak = findBreakDay(forecasts.optimistic);
  const pessimisticBreak = findBreakDay(forecasts.pessimistic);

  // Calcular probabilidad de quiebra basada en escenarios
  let probability = 0;
  if (pessimisticBreak) {
    if (baseBreak) {
      probability = 0.7; // Alta probabilidad si base también se quiebra
    } else {
      probability = 0.3; // Probabilidad media si solo pesimista se quiebra
    }
  } else {
    probability = 0.1; // Baja probabilidad si ningún escenario se quiebra
  }

  // Días promedio hasta posible quiebra
  const breakDays = [baseBreak, pessimisticBreak].filter(d => d !== null);
  const avgBreakDay = breakDays.length ? Math.round(sum(breakDays) / breakDays.length) : null;

  // Runway en meses
  const runwayMonths = dailyNetFlow > 0 ? null : Math.abs(startingCash / (dailyNetFlow * 30));

  return {
    probability: Math.round(probability * 100) / 100,
    days_to_break: avgBreakDay,
    runway_months: runwayMonths ? Math.round(runwayMonths * 10) / 10 : null,
    scenario_breaks: {
      base: baseBreak,
      optimistic: optimisticBreak, 
      pessimistic: pessimisticBreak
    }
  };
}

function generateDemoForecast(horizon) {
  console.log('📊 Generating demo forecast - no data provided');
  
  const startingCash = 150000;
  const dailyNetFlow = -500; // Burning $500/day
  
  const forecasts = {
    base: [],
    optimistic: [],
    pessimistic: []
  };

  let currentCash = startingCash;
  
  for (let day = 1; day <= horizon; day++) {
    currentCash += dailyNetFlow;
    
    const date = new Date();
    date.setDate(date.getDate() + day);
    const formattedDate = date.toISOString().split('T')[0];

    forecasts.base.push({
      date: formattedDate,
      day: day,
      value: Math.max(0, Math.round(currentCash))
    });

    forecasts.optimistic.push({
      date: formattedDate,
      day: day,
      value: Math.max(0, Math.round(currentCash + (dailyNetFlow * -0.3))) // 30% better
    });

    forecasts.pessimistic.push({
      date: formattedDate,
      day: day,
      value: Math.max(0, Math.round(currentCash + (dailyNetFlow * 0.5))) // 50% worse
    });
  }

  return {
    horizon,
    starting_cash: startingCash,
    daily_net_flow: dailyNetFlow,
    monthly_net_flow: dailyNetFlow * 30,
    volatility: 0.15,
    forecasts,
    break_risk: {
      probability: 0.23,
      days_to_break: Math.round(startingCash / Math.abs(dailyNetFlow * 1.5)),
      runway_months: Math.round((startingCash / Math.abs(dailyNetFlow * 30)) * 10) / 10
    },
    metadata: {
      data_points: 0,
      demo_mode: true
    }
  };
}

module.exports = {
  generateForecast
};

