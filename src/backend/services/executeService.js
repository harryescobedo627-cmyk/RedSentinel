/**
 * executeService
 * - Simula la ejecución de planes de acción y calcula el impacto financiero proyectado
 * - Soporta análisis de escenarios y seguimiento de KPIs
 * - Proporciona simulaciones detalladas con métricas de riesgo y retorno
 */

/**
 * Simula la ejecución de un plan y calcula su impacto en el forecast
 */
function simulateExecution(plan, job) {
  console.log(`Simulating execution of plan: ${plan.title}`);
  
  const { data, forecast, diagnosis } = job;
  const originalForecast = forecast || { base: [], optimistic: [], pessimistic: [] };
  const metrics = diagnosis?.metrics || {};
  
  // Calcular impacto del plan en diferentes escenarios
  const simulationResults = {
    planId: plan.id,
    planTitle: plan.title,
    category: plan.category,
    impactSummary: calculateImpactSummary(plan, metrics),
    scenarios: simulateAllScenarios(plan, originalForecast),
    kpiProjections: projectKPIs(plan, metrics),
    riskAssessment: assessImplementationRisk(plan, metrics),
    implementationTimeline: generateImplementationTimeline(plan),
    costBenefitAnalysis: calculateCostBenefit(plan, metrics),
    successProbability: calculateSuccessProbability(plan, metrics)
  };
  
  return simulationResults;
}

/**
 * Calcula resumen de impacto del plan
 */
function calculateImpactSummary(plan, metrics) {
  const impact = plan.impactEstimate || {};
  const currentCash = metrics.cashBalance || 100000;
  const currentBurnRate = Math.abs(metrics.burnRate || -10000);
  
  return {
    cashImpact: Math.round(currentCash * (impact.cashIncreasePct || 0)),
    burnRateReduction: impact.burnRateReductionPct ? 
      Math.round(currentBurnRate * impact.burnRateReductionPct) : 0,
    runwayExtension: calculateRunwayExtension(plan, metrics),
    revenueBoost: impact.revenueIncreasePct ? 
      Math.round(metrics.averageIncome * (impact.revenueIncreasePct || 0)) : 0,
    costSavings: impact.costReductionPct ? 
      Math.round(Math.abs(metrics.averageExpenses || 0) * (impact.costReductionPct || 0)) : 0
  };
}

/**
 * Simula el plan en todos los escenarios (base, optimista, pesimista)
 */
function simulateAllScenarios(plan, originalForecast) {
  const scenarios = {};
  
  ['base', 'optimistic', 'pessimistic'].forEach(scenarioType => {
    const original = originalForecast[scenarioType] || [];
    scenarios[scenarioType] = simulateScenario(plan, original, scenarioType);
  });
  
  return scenarios;
}

/**
 * Simula un escenario específico aplicando el impacto del plan
 */
function simulateScenario(plan, originalData, scenarioType) {
  if (!originalData || originalData.length === 0) {
    return { adjusted: [], breakDay: null, improvement: 0 };
  }
  
  const impact = plan.impactEstimate || {};
  const implementationDelay = Math.floor((impact.timeToImplement || 0) / 7); // Convert days to weeks
  
  // Ajustar factor de impacto según el escenario
  let impactMultiplier = 1;
  if (scenarioType === 'optimistic') impactMultiplier = 1.3;
  if (scenarioType === 'pessimistic') impactMultiplier = 0.7;
  
  const adjustedData = originalData.map((point, index) => {
    let adjustedValue = point.value;
    
    // Aplicar impacto gradualmente después del período de implementación
    if (index >= implementationDelay) {
      const weeksAfterImplementation = index - implementationDelay;
      const rampUpFactor = Math.min(1, weeksAfterImplementation / 4); // Ramp up over 4 weeks
      
      const totalImpact = (impact.cashIncreasePct || 0) * impactMultiplier * rampUpFactor;
      adjustedValue = point.value * (1 + totalImpact);
    }
    
    return {
      day: point.day,
      week: index + 1,
      value: Math.round(adjustedValue),
      originalValue: point.value,
      impactApplied: adjustedValue - point.value
    };
  });
  
  const originalBreakPoint = originalData.findIndex(x => x.value <= 0);
  const adjustedBreakPoint = adjustedData.findIndex(x => x.value <= 0);
  
  const improvement = originalBreakPoint !== -1 && adjustedBreakPoint !== -1 ? 
    adjustedBreakPoint - originalBreakPoint : 
    (originalBreakPoint !== -1 && adjustedBreakPoint === -1 ? Infinity : 0);
  
  return {
    adjusted: adjustedData,
    breakDay: adjustedBreakPoint !== -1 ? adjustedData[adjustedBreakPoint].day : null,
    originalBreakDay: originalBreakPoint !== -1 ? originalData[originalBreakPoint].day : null,
    improvement: improvement,
    totalImpact: adjustedData.reduce((sum, point) => sum + (point.impactApplied || 0), 0)
  };
}

/**
 * Proyecta KPIs específicos del plan
 */
function projectKPIs(plan, metrics) {
  const projections = {};
  
  if (plan.kpis && plan.kpis.length > 0) {
    plan.kpis.forEach(kpi => {
      projections[kpi] = generateKPIProjection(kpi, plan, metrics);
    });
  }
  
  // KPIs financieros universales
  projections['Cash Flow Improvement'] = {
    current: metrics.burnRate || 0,
    projected: (metrics.burnRate || 0) * (1 + (plan.impactEstimate?.cashIncreasePct || 0)),
    unit: 'currency',
    timeframe: plan.timeframe
  };
  
  projections['Implementation Progress'] = {
    current: 0,
    projected: 100,
    unit: 'percentage',
    timeframe: plan.timeframe,
    milestones: plan.actions || []
  };
  
  return projections;
}

/**
 * Genera proyección específica para un KPI
 */
function generateKPIProjection(kpi, plan, metrics) {
  const baseProjection = {
    current: 0,
    projected: 0,
    unit: 'number',
    timeframe: plan.timeframe,
    confidence: 'medium'
  };
  
  // Lógica específica por tipo de KPI
  if (kpi.toLowerCase().includes('cash') || kpi.toLowerCase().includes('flujo')) {
    baseProjection.current = metrics.cashBalance || 0;
    baseProjection.projected = (metrics.cashBalance || 0) * (1 + (plan.impactEstimate?.cashIncreasePct || 0));
    baseProjection.unit = 'currency';
  } else if (kpi.toLowerCase().includes('days') || kpi.toLowerCase().includes('días')) {
    baseProjection.current = metrics.cashRunwayDays || 0;
    baseProjection.projected = (metrics.cashRunwayDays || 0) * 1.2; // Estimate 20% improvement
    baseProjection.unit = 'days';
  } else if (kpi.toLowerCase().includes('%') || kpi.toLowerCase().includes('reducción')) {
    baseProjection.projected = plan.impactEstimate?.cashIncreasePct * 100 || 10;
    baseProjection.unit = 'percentage';
  }
  
  return baseProjection;
}

/**
 * Evalúa riesgos de implementación del plan
 */
function assessImplementationRisk(plan, metrics) {
  const risks = [];
  const riskLevel = plan.impactEstimate?.riskLevel || 'medium';
  
  // Riesgos generales por categoría
  const categoryRisks = {
    'liquidity_crisis': [
      'Resistencia de proveedores a nuevos términos de pago',
      'Impacto en relaciones comerciales a largo plazo',
      'Posible deterioro de calificación crediticia'
    ],
    'revenue_emergency': [
      'Erosión de márgenes por descuentos excesivos',
      'Canibalización de ventas futuras',
      'Expectativas insostenibles en clientes'
    ],
    'cost_optimization': [
      'Reducción de capacidad operativa',
      'Pérdida de talento clave',
      'Deterioro de calidad del servicio'
    ],
    'growth_investment': [
      'Retorno de inversión menor al esperado',
      'Disolución de liquidez disponible',
      'Competencia más agresiva'
    ]
  };
  
  risks.push(...(categoryRisks[plan.category] || ['Riesgos de implementación estándar']));
  
  // Riesgos específicos por esfuerzo
  if (plan.effort === 'high') {
    risks.push('Alta complejidad de implementación', 'Requiere recursos significativos');
  }
  
  // Riesgos por urgencia
  if (plan.priority === 'critical') {
    risks.push('Presión de tiempo puede llevar a errores', 'Decisiones apresuradas');
  }
  
  return {
    level: riskLevel,
    factors: risks,
    mitigation: generateRiskMitigation(plan, risks),
    probability: calculateRiskProbability(riskLevel, plan.effort)
  };
}

/**
 * Genera estrategias de mitigación de riesgos
 */
function generateRiskMitigation(plan, risks) {
  const mitigations = [];
  
  if (plan.category === 'liquidity_crisis') {
    mitigations.push('Comunicación transparente con stakeholders');
    mitigations.push('Planes de contingencia para múltiples escenarios');
  }
  
  if (plan.effort === 'high') {
    mitigations.push('Implementación por fases');
    mitigations.push('Monitoreo continuo de progreso');
  }
  
  if (plan.priority === 'critical') {
    mitigations.push('Equipo dedicado exclusivamente al proyecto');
    mitigations.push('Revisiones diarias de avance');
  }
  
  return mitigations;
}

/**
 * Calcula probabilidad de riesgo
 */
function calculateRiskProbability(riskLevel, effort) {
  const baseProbability = {
    'low': 0.1,
    'medium': 0.3,
    'high': 0.6
  };
  
  const effortMultiplier = {
    'low': 0.8,
    'medium': 1.0,
    'high': 1.3
  };
  
  return Math.min(0.9, (baseProbability[riskLevel] || 0.3) * (effortMultiplier[effort] || 1.0));
}

/**
 * Genera cronograma de implementación detallado
 */
function generateImplementationTimeline(plan) {
  const actions = plan.actions || [];
  const totalWeeks = Math.ceil((plan.impactEstimate?.timeToImplement || 30) / 7);
  
  const timeline = [];
  const actionsPerWeek = Math.max(1, Math.ceil(actions.length / totalWeeks));
  
  for (let week = 1; week <= totalWeeks; week++) {
    const weekActions = actions.slice((week - 1) * actionsPerWeek, week * actionsPerWeek);
    
    timeline.push({
      week,
      actions: weekActions,
      milestone: week === totalWeeks ? 'Implementación Completa' : 
                week === Math.ceil(totalWeeks / 2) ? 'Revisión de Medio Término' : 
                week === 1 ? 'Inicio de Implementación' : null,
      expectedProgress: Math.round((week / totalWeeks) * 100),
      resources: calculateWeeklyResources(week, totalWeeks, plan.effort)
    });
  }
  
  return timeline;
}

/**
 * Calcula recursos necesarios por semana
 */
function calculateWeeklyResources(week, totalWeeks, effort) {
  const effortLevels = {
    'low': { hours: 10, people: 1 },
    'medium': { hours: 25, people: 2 },
    'high': { hours: 40, people: 3 }
  };
  
  const baseResources = effortLevels[effort] || effortLevels['medium'];
  
  // Más recursos al inicio para setup
  const multiplier = week <= 2 ? 1.3 : week > totalWeeks - 2 ? 1.2 : 1.0;
  
  return {
    hoursPerWeek: Math.round(baseResources.hours * multiplier),
    peopleRequired: baseResources.people,
    phase: week <= totalWeeks / 3 ? 'Preparación' : 
           week <= (totalWeeks * 2) / 3 ? 'Ejecución' : 'Finalización'
  };
}

/**
 * Calcula análisis costo-beneficio
 */
function calculateCostBenefit(plan, metrics) {
  const impact = plan.impactEstimate || {};
  const currentCash = metrics.cashBalance || 100000;
  
  // Estimar costos de implementación
  const implementationCost = estimateImplementationCost(plan);
  
  // Calcular beneficios proyectados
  const projectedBenefit = currentCash * (impact.cashIncreasePct || 0);
  
  return {
    implementationCost,
    projectedBenefit,
    netBenefit: projectedBenefit - implementationCost,
    roi: implementationCost > 0 ? ((projectedBenefit - implementationCost) / implementationCost) * 100 : 0,
    paybackPeriod: calculatePaybackPeriod(implementationCost, projectedBenefit, plan),
    breakEvenPoint: implementationCost / (projectedBenefit / 52) // Weeks to break even
  };
}

/**
 * Estima costo de implementación basado en esfuerzo y acciones
 */
function estimateImplementationCost(plan) {
  const effortCosts = {
    'low': 5000,
    'medium': 15000,
    'high': 40000
  };
  
  const baseCost = effortCosts[plan.effort] || 15000;
  const actionMultiplier = (plan.actions?.length || 3) / 3;
  
  return Math.round(baseCost * actionMultiplier);
}

/**
 * Calcula período de recuperación de la inversión
 */
function calculatePaybackPeriod(cost, benefit, plan) {
  if (benefit <= 0) return Infinity;
  
  const weeklyBenefit = benefit / 52; // Assuming annual benefit
  const weeksToPayback = cost / weeklyBenefit;
  
  return {
    weeks: Math.round(weeksToPayback),
    months: Math.round(weeksToPayback / 4.33),
    description: weeksToPayback < 13 ? 'Recuperación rápida' : 
                weeksToPayback < 26 ? 'Recuperación moderada' : 'Recuperación lenta'
  };
}

/**
 * Calcula extensión de runway financiero
 */
function calculateRunwayExtension(plan, metrics) {
  const currentRunway = metrics.cashRunwayDays || 0;
  const impact = plan.impactEstimate?.cashIncreasePct || 0;
  
  if (currentRunway === 0) return 0;
  
  const extendedRunway = currentRunway * (1 + impact);
  return Math.round(extendedRunway - currentRunway);
}

/**
 * Calcula probabilidad de éxito del plan
 */
function calculateSuccessProbability(plan, metrics) {
  let probability = 0.5; // Base 50%
  
  // Ajustar por esfuerzo (menos esfuerzo = mayor probabilidad)
  const effortAdjustment = {
    'low': 0.2,
    'medium': 0.0,
    'high': -0.2
  };
  probability += effortAdjustment[plan.effort] || 0;
  
  // Ajustar por riesgo
  const riskAdjustment = {
    'low': 0.2,
    'medium': 0.0,
    'high': -0.3
  };
  probability += riskAdjustment[plan.impactEstimate?.riskLevel] || 0;
  
  // Ajustar por categoría (algunas son más confiables)
  const categoryAdjustment = {
    'cost_optimization': 0.15,
    'liquidity_crisis': -0.1,
    'growth_investment': -0.2
  };
  probability += categoryAdjustment[plan.category] || 0;
  
  // Ajustar por salud financiera actual
  if (metrics.cashRunwayDays) {
    if (metrics.cashRunwayDays < 30) probability -= 0.2;
    else if (metrics.cashRunwayDays > 180) probability += 0.15;
  }
  
  return Math.max(0.1, Math.min(0.95, probability));
}

/**
 * Ejecuta plan en modo de producción (placeholder para implementación futura)
 */
function executeInProduction(plan, job) {
  console.log(`Production execution not implemented for plan: ${plan.title}`);
  
  return {
    status: 'not_implemented',
    message: 'La ejecución en producción requiere integración con sistemas externos',
    recommendedAction: 'Usar simulación para planificación y ejecutar manualmente'
  };
}

module.exports = { 
  simulateExecution,
  executeInProduction
};

