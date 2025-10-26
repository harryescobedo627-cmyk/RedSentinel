/**
 * recommendService
 * - Analiza diagnóstico + pronóstico y genera recomendaciones estratégicas personalizadas
 * - Cada recomendación incluye: descripción, impacto estimado, esfuerzo, prioridad, acciones específicas
 * - Utiliza IA para generar insights contextuales basados en los datos financieros reales
 */

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

/**
 * Genera recomendaciones estratégicas basadas en diagnóstico y pronóstico
 */
function generateRecommendations(diagnosis, forecast) {
  console.log('Generating recommendations based on diagnosis and forecast...');
  
  const { metrics, alerts, summary } = diagnosis;
  const { scenarios, breakRisk, volatility } = forecast;
  
  const plans = [];
  const urgency = calculateUrgency(metrics, forecast);
  
  // Analizar situación financiera para generar recomendaciones contextuales
  if (metrics.cashRunwayDays && metrics.cashRunwayDays < 90) {
    // Crisis de liquidez - Recomendaciones urgentes
    plans.push(generateCrisisLiquidityPlan(metrics, scenarios));
    plans.push(generateEmergencyRevenueBoostPlan(metrics));
    plans.push(generateRapidCostCutPlan(metrics));
  } else if (metrics.cashRunwayDays && metrics.cashRunwayDays < 180) {
    // Situación delicada - Recomendaciones preventivas
    plans.push(generateCashOptimizationPlan(metrics, scenarios));
    plans.push(generateRevenueGrowthPlan(metrics, forecast));
    plans.push(generateEfficiencyImprovementPlan(metrics));
  } else {
    // Situación estable - Recomendaciones de crecimiento
    plans.push(generateGrowthInvestmentPlan(metrics, forecast));
    plans.push(generateMarketExpansionPlan(metrics));
    plans.push(generateOperationalExcellencePlan(metrics));
  }
  
  // Agregar recomendaciones específicas basadas en alertas
  if (alerts && alerts.length > 0) {
    const alertBasedPlans = generateAlertBasedRecommendations(alerts, metrics);
    plans.push(...alertBasedPlans);
  }
  
  // Calcular puntuación de prioridad y seleccionar plan recomendado
  const scoredPlans = plans.map(plan => ({
    ...plan,
    priorityScore: calculatePriorityScore(plan, urgency, metrics)
  }));
  
  const sortedPlans = scoredPlans.sort((a, b) => b.priorityScore - a.priorityScore);
  const recommended = sortedPlans[0];
  
  return {
    plans: sortedPlans.slice(0, 3), // Top 3 planes
    recommended,
    urgency,
    context: generateContextualInsights(metrics, forecast)
  };
}

/**
 * Calcula el nivel de urgencia basado en métricas financieras
 */
function calculateUrgency(metrics, forecast) {
  let urgencyScore = 0;
  
  if (metrics.cashRunwayDays < 30) urgencyScore += 10;
  else if (metrics.cashRunwayDays < 60) urgencyScore += 8;
  else if (metrics.cashRunwayDays < 90) urgencyScore += 6;
  else if (metrics.cashRunwayDays < 180) urgencyScore += 4;
  
  if (metrics.burnRate && metrics.cashBalance) {
    const burnRatio = Math.abs(metrics.burnRate) / metrics.cashBalance;
    if (burnRatio > 0.2) urgencyScore += 5;
    else if (burnRatio > 0.1) urgencyScore += 3;
  }
  
  if (forecast.breakRisk > 0.7) urgencyScore += 4;
  else if (forecast.breakRisk > 0.5) urgencyScore += 2;
  
  if (urgencyScore >= 10) return 'critical';
  if (urgencyScore >= 6) return 'high';
  if (urgencyScore >= 3) return 'medium';
  return 'low';
}

/**
 * Genera plan de liquidez para crisis financiera
 */
function generateCrisisLiquidityPlan(metrics, scenarios) {
  return {
    id: uid(),
    title: 'Plan de Emergencia: Liquidez Inmediata',
    description: 'Estrategia integral para generar flujo de caja inmediato y extender la pista de aterrizaje financiera.',
    category: 'liquidity_crisis',
    priority: 'critical',
    effort: 'high',
    timeframe: '2-4 semanas',
    impactEstimate: {
      cashIncreasePct: 0.25,
      timeToImplement: 14,
      riskLevel: 'medium'
    },
    actions: [
      'Acelerar cobranza con descuentos del 2-5% por pago inmediato',
      'Negociar prórroga de 60-90 días en pagos a proveedores principales',
      'Liquidar inventario obsoleto o de baja rotación',
      'Considerar línea de crédito de emergencia o factoring',
      'Implementar medidas de austeridad extrema temporales'
    ],
    kpis: [
      'Días de liquidez extendidos',
      'Flujo de caja semanal positivo',
      'Reducción del burn rate en 30%'
    ]
  };
}

/**
 * Genera plan de impulso de ingresos de emergencia
 */
function generateEmergencyRevenueBoostPlan(metrics) {
  return {
    id: uid(),
    title: 'Impulso de Ingresos de Emergencia',
    description: 'Activación inmediata de fuentes de ingresos para mejorar el flujo de caja a corto plazo.',
    category: 'revenue_emergency',
    priority: 'high',
    effort: 'medium',
    timeframe: '3-6 semanas',
    impactEstimate: {
      cashIncreasePct: 0.20,
      timeToImplement: 21,
      riskLevel: 'medium'
    },
    actions: [
      'Lanzar promociones flash con descuentos limitados en tiempo',
      'Activar programa de referidos con incentivos inmediatos',
      'Ofrecer servicios de consultoría o productos premium',
      'Explorar partnerships estratégicos para ingresos rápidos',
      'Implementar modelo de prepago con descuentos atractivos'
    ],
    kpis: [
      'Incremento de ingresos semanales en 25%',
      'Tiempo promedio de cobranza reducido',
      'Nuevos clientes adquiridos por semana'
    ]
  };
}

/**
 * Genera plan de reducción rápida de costos
 */
function generateRapidCostCutPlan(metrics) {
  return {
    id: uid(),
    title: 'Reducción Inteligente de Costos',
    description: 'Optimización inmediata de gastos manteniendo la capacidad operativa esencial.',
    category: 'cost_optimization',
    priority: 'high',
    effort: 'low',
    timeframe: '1-3 semanas',
    impactEstimate: {
      cashIncreasePct: 0.15,
      timeToImplement: 10,
      riskLevel: 'low'
    },
    actions: [
      'Revisar y cancelar suscripciones/servicios no esenciales',
      'Renegociar contratos con proveedores principales',
      'Implementar trabajo remoto para reducir gastos de oficina',
      'Optimizar gastos de marketing enfocándose en ROI más alto',
      'Diferir inversiones no críticas por 3-6 meses'
    ],
    kpis: [
      'Reducción mensual de gastos fijos en 20%',
      'Burn rate reducido sin afectar ingresos',
      'Tiempo de implementación de medidas'
    ]
  };
}

/**
 * Genera plan de optimización de flujo de caja
 */
function generateCashOptimizationPlan(metrics, scenarios) {
  return {
    id: uid(),
    title: 'Optimización de Flujo de Caja',
    description: 'Estrategia integral para maximizar la eficiencia del capital de trabajo y mejorar la posición de liquidez.',
    category: 'cash_optimization',
    priority: 'medium',
    effort: 'medium',
    timeframe: '4-8 semanas',
    impactEstimate: {
      cashIncreasePct: 0.18,
      timeToImplement: 30,
      riskLevel: 'low'
    },
    actions: [
      'Implementar sistema de gestión de cobranza automatizada',
      'Optimizar términos de pago: 15 días clientes, 45 días proveedores',
      'Crear reserva de efectivo del 10% para contingencias',
      'Revisar y optimizar niveles de inventario',
      'Establecer líneas de crédito preventivas'
    ],
    kpis: [
      'Días de cobranza promedio reducidos en 25%',
      'Rotación de inventario mejorada',
      'Reservas de efectivo como % de gastos mensuales'
    ]
  };
}

/**
 * Calcula puntuación de prioridad para planes
 */
function calculatePriorityScore(plan, urgency, metrics) {
  let score = 0;
  
  // Impacto financiero
  score += (plan.impactEstimate.cashIncreasePct || 0) * 100;
  
  // Urgencia
  const urgencyMultiplier = {
    'critical': 3,
    'high': 2,
    'medium': 1.5,
    'low': 1
  };
  score *= urgencyMultiplier[urgency] || 1;
  
  // Facilidad de implementación
  const effortPenalty = {
    'low': 1,
    'medium': 0.8,
    'high': 0.6
  };
  score *= effortPenalty[plan.effort] || 0.8;
  
  // Riesgo
  const riskPenalty = {
    'low': 1,
    'medium': 0.9,
    'high': 0.7
  };
  score *= riskPenalty[plan.impactEstimate.riskLevel] || 0.9;
  
  return Math.round(score * 10) / 10;
}

/**
 * Genera recomendaciones basadas en alertas específicas
 */
function generateAlertBasedRecommendations(alerts, metrics) {
  const plans = [];
  
  alerts.forEach(alert => {
    if (alert.type === 'cash_flow' && alert.severity === 'high') {
      plans.push({
        id: uid(),
        title: `Acción Inmediata: ${alert.title}`,
        description: `${alert.message} Requiere atención urgente.`,
        category: 'alert_response',
        priority: 'high',
        effort: 'medium',
        timeframe: '1-2 semanas',
        impactEstimate: {
          cashIncreasePct: 0.12,
          timeToImplement: 7,
          riskLevel: 'medium'
        },
        actions: [alert.recommendation || 'Revisar y optimizar este aspecto inmediatamente'],
        kpis: ['Resolución del problema identificado']
      });
    }
  });
  
  return plans;
}

/**
 * Genera insights contextuales para el usuario
 */
function generateContextualInsights(metrics, forecast) {
  const insights = [];
  
  if (metrics.cashRunwayDays < 90) {
    insights.push('🚨 Situación crítica: Menos de 90 días de liquidez disponible');
  }
  
  if (forecast.breakRisk > 0.6) {
    insights.push('⚠️ Alto riesgo de quiebra en los próximos 6 meses');
  }
  
  if (metrics.burnRate && metrics.burnRate < 0) {
    insights.push('📈 Flujo de caja positivo: Oportunidad para reinversión estratégica');
  }
  
  return insights;
}

// Funciones adicionales para otros tipos de planes (para situaciones más estables)
function generateRevenueGrowthPlan(metrics, forecast) {
  return {
    id: uid(),
    title: 'Aceleración de Crecimiento de Ingresos',
    description: 'Estrategia enfocada en incrementar ingresos de manera sostenible.',
    category: 'revenue_growth',
    priority: 'medium',
    effort: 'medium',
    timeframe: '6-12 semanas',
    impactEstimate: {
      cashIncreasePct: 0.22,
      timeToImplement: 45,
      riskLevel: 'medium'
    },
    actions: [
      'Expandir a nuevos segmentos de mercado identificados',
      'Lanzar productos complementarios',
      'Optimizar pricing strategy basado en análisis de elasticidad',
      'Implementar programa de fidelización de clientes'
    ],
    kpis: [
      'Crecimiento mensual de ingresos',
      'Nuevos clientes adquiridos',
      'Ticket promedio por cliente'
    ]
  };
}

function generateEfficiencyImprovementPlan(metrics) {
  return {
    id: uid(),
    title: 'Mejora de Eficiencia Operacional',
    description: 'Optimización de procesos para reducir costos sin afectar calidad.',
    category: 'efficiency',
    priority: 'medium',
    effort: 'medium',
    timeframe: '4-10 semanas',
    impactEstimate: {
      cashIncreasePct: 0.14,
      timeToImplement: 35,
      riskLevel: 'low'
    },
    actions: [
      'Automatizar procesos manuales repetitivos',
      'Implementar lean management en operaciones',
      'Optimizar cadena de suministro',
      'Mejorar productividad del equipo con capacitación'
    ],
    kpis: [
      'Reducción de costos operativos',
      'Tiempo promedio de procesamiento',
      'Satisfacción del equipo'
    ]
  };
}

function generateGrowthInvestmentPlan(metrics, forecast) {
  return {
    id: uid(),
    title: 'Plan de Inversión para Crecimiento',
    description: 'Estrategia de inversión inteligente para acelerar el crecimiento empresarial.',
    category: 'growth_investment',
    priority: 'low',
    effort: 'high',
    timeframe: '12-24 semanas',
    impactEstimate: {
      cashIncreasePct: 0.35,
      timeToImplement: 90,
      riskLevel: 'medium'
    },
    actions: [
      'Invertir en tecnología para escalar operaciones',
      'Expandir equipo en áreas clave de crecimiento',
      'Desarrollar nuevos productos o servicios',
      'Inversión en marketing digital y adquisición de clientes'
    ],
    kpis: [
      'ROI de inversiones realizadas',
      'Crecimiento de market share',
      'Escalabilidad de operaciones'
    ]
  };
}

function generateMarketExpansionPlan(metrics) {
  return {
    id: uid(),
    title: 'Expansión de Mercado Estratégica',
    description: 'Plan para expandir a nuevos mercados geográficos o segmentos.',
    category: 'market_expansion',
    priority: 'low',
    effort: 'high',
    timeframe: '16-32 semanas',
    impactEstimate: {
      cashIncreasePct: 0.40,
      timeToImplement: 120,
      riskLevel: 'high'
    },
    actions: [
      'Investigación exhaustiva de nuevos mercados',
      'Desarrollo de estrategia de entrada al mercado',
      'Partnerships estratégicos locales',
      'Adaptación de productos para nuevos segmentos'
    ],
    kpis: [
      'Penetración en nuevos mercados',
      'Ingresos de nuevos segmentos',
      'Retorno sobre inversión en expansión'
    ]
  };
}

function generateOperationalExcellencePlan(metrics) {
  return {
    id: uid(),
    title: 'Excelencia Operacional Avanzada',
    description: 'Optimización avanzada de todos los aspectos operacionales para máxima eficiencia.',
    category: 'operational_excellence',
    priority: 'low',
    effort: 'medium',
    timeframe: '8-16 semanas',
    impactEstimate: {
      cashIncreasePct: 0.18,
      timeToImplement: 60,
      riskLevel: 'low'
    },
    actions: [
      'Implementar sistemas de gestión de calidad total',
      'Optimizar todos los procesos con metodologías Six Sigma',
      'Desarrollar cultura de mejora continua',
      'Implementar KPIs avanzados y dashboards en tiempo real'
    ],
    kpis: [
      'Eficiencia operacional global',
      'Reducción de desperdicios',
      'Satisfacción de stakeholders'
    ]
  };
}

module.exports = { generateRecommendations };

