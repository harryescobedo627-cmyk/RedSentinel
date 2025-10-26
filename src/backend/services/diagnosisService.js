/**
 * ROLE: Backend Lead - Diagnosis Service
 * Analiza datos financieros y genera métricas + alertas RAG
 * - Detecta columnas de efectivo, ingresos, gastos automáticamente  
 * - Calcula KPIs financieros clave
 * - Genera alertas por severidad (Red/Amber/Green)
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

async function analyze(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }

  console.log(`📊 Analyzing ${data.length} records...`);

  // Detectar columnas automáticamente
  const cashKey = detectColumn(data, ['cash', 'balance', 'closing', 'efectivo', 'saldo']);
  const incomeKey = detectColumn(data, ['income', 'revenue', 'ingreso', 'venta', 'facturación']);
  const expenseKey = detectColumn(data, ['expense', 'cost', 'gasto', 'costo', 'egresos']);
  const dateKey = detectColumn(data, ['date', 'fecha', 'period', 'periodo']) || 'date';

  console.log(`🔍 Detected columns - Cash: ${cashKey}, Income: ${incomeKey}, Expense: ${expenseKey}`);

  // Extraer series de datos
  const cashSeries = cashKey ? data.map(r => safeNumber(r[cashKey])).filter(x => !isNaN(x)) : [];
  const incomeSeries = incomeKey ? data.map(r => safeNumber(r[incomeKey])).filter(x => !isNaN(x)) : [];
  const expenseSeries = expenseKey ? data.map(r => safeNumber(r[expenseKey])).filter(x => !isNaN(x)) : [];

  // Calcular métricas básicas
  const latestCash = cashSeries.length ? cashSeries[cashSeries.length - 1] : 0;
  const avgIncome = incomeSeries.length ? sum(incomeSeries) / incomeSeries.length : 0;
  const avgExpense = expenseSeries.length ? sum(expenseSeries) / expenseSeries.length : 0;
  const monthlyBurn = avgExpense - avgIncome;
  
  // Calcular runway (meses hasta quedarse sin efectivo)
  let runway = 0;
  if (latestCash > 0 && monthlyBurn > 0) {
    runway = latestCash / monthlyBurn;
  }

  // Calcular tendencia de cash flow
  let cashTrend = 0;
  if (cashSeries.length >= 2) {
    const recent = cashSeries.slice(-3); // últimos 3 períodos
    const older = cashSeries.slice(-6, -3); // 3 períodos anteriores
    if (recent.length && older.length) {
      const recentAvg = sum(recent) / recent.length;
      const olderAvg = sum(older) / older.length;
      cashTrend = ((recentAvg - olderAvg) / olderAvg) * 100;
    }
  }

  // Margen bruto aproximado
  const grossMargin = avgIncome > 0 ? ((avgIncome - avgExpense) / avgIncome) * 100 : 0;

  const metrics = {
    cashBalance: Math.round(latestCash),
    monthlyRevenue: Math.round(avgIncome),
    monthlyExpenses: Math.round(avgExpense),
    monthlyBurn: Math.round(monthlyBurn),
    runway: Number(runway.toFixed(1)),
    cashTrend: Number(cashTrend.toFixed(1)),
    grossMargin: Number(grossMargin.toFixed(1)),
    dataPoints: data.length,
    detectedColumns: { cashKey, incomeKey, expenseKey }
  };

  // Generar alertas basadas en métricas
  const alerts = generateAlerts(metrics, cashSeries);

  console.log(`✅ Analysis complete - ${alerts.length} alerts generated`);

  return { metrics, alerts };
}

function generateAlerts(metrics, cashSeries) {
  const alerts = [];

  // Alerta de liquidez crítica
  if (metrics.cashBalance <= 0) {
    alerts.push({
      id: 'critical_cash',
      severity: 'red',
      title: 'Liquidez Crítica',
      description: 'El balance de efectivo es cero o negativo. Requiere atención inmediata.',
      impact: 'Alto',
      recommendation: 'Revisar cuentas por cobrar y buscar financiamiento urgente.'
    });
  } else if (metrics.runway > 0 && metrics.runway < 3) {
    alerts.push({
      id: 'low_runway',
      severity: 'red', 
      title: 'Runway Crítico',
      description: `Solo quedan ${metrics.runway} meses de efectivo al ritmo actual.`,
      impact: 'Alto',
      recommendation: 'Reducir gastos o aumentar ingresos inmediatamente.'
    });
  }

  // Alerta de burn rate alto
  if (metrics.monthlyBurn > metrics.monthlyRevenue * 0.8) {
    alerts.push({
      id: 'high_burn',
      severity: 'yellow',
      title: 'Burn Rate Elevado',
      description: 'Los gastos representan más del 80% de los ingresos.',
      impact: 'Medio',
      recommendation: 'Revisar gastos operativos y buscar eficiencias.'
    });
  }

  // Alerta de tendencia negativa
  if (metrics.cashTrend < -15) {
    alerts.push({
      id: 'negative_trend',
      severity: 'yellow',
      title: 'Tendencia Negativa',
      description: `El efectivo ha disminuido ${Math.abs(metrics.cashTrend).toFixed(1)}% recientemente.`,
      impact: 'Medio',
      recommendation: 'Analizar causas de la disminución y tomar medidas correctivas.'
    });
  }

  // Alerta de margen bajo
  if (metrics.grossMargin < 20 && metrics.grossMargin > 0) {
    alerts.push({
      id: 'low_margin',
      severity: 'yellow',
      title: 'Margen Bruto Bajo', 
      description: `El margen bruto es de solo ${metrics.grossMargin}%.`,
      impact: 'Medio',
      recommendation: 'Revisar precios o reducir costos directos.'
    });
  }

  // Alertas positivas
  if (metrics.runway >= 6) {
    alerts.push({
      id: 'healthy_runway',
      severity: 'green',
      title: 'Runway Saludable',
      description: `Tienes ${metrics.runway} meses de efectivo disponible.`,
      impact: 'Positivo',
      recommendation: 'Mantener el control de gastos y considerar oportunidades de crecimiento.'
    });
  }

  if (metrics.grossMargin >= 40) {
    alerts.push({
      id: 'good_margin',
      severity: 'green',
      title: 'Margen Saludable',
      description: `Margen bruto de ${metrics.grossMargin}% está por encima del promedio.`,
      impact: 'Positivo', 
      recommendation: 'Excelente control de costos. Considera reinvertir en crecimiento.'
    });
  }

  // Si no hay alertas críticas, agregar una de estado general
  if (alerts.filter(a => a.severity === 'red').length === 0) {
    alerts.push({
      id: 'general_health',
      severity: 'green',
      title: 'Estado Financiero Estable',
      description: 'No se detectaron riesgos financieros inmediatos.',
      impact: 'Positivo',
      recommendation: 'Continuar monitoreando métricas clave mensualmente.'
    });
  }

  return alerts;
}

module.exports = {
  analyze
};

