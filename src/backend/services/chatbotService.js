/**
 * ROLE: AI Integration Lead
 * Chatbot service using Google Gemini AI
 * - Provides financial advice and analysis
 * - Context-aware responses based on user data
 * - Specialized in cash flow, forecasting, and business decisions
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (you'll need to set your API key)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key-here');

class ChatbotService {
  constructor() {
    // Use the correct available Gemini model
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.conversationHistory = new Map(); // Store conversation history by session
  }

  /**
   * Generate AI response for financial chatbot
   * @param {string} message - User's message
   * @param {string} sessionId - Session identifier
   * @param {Object} context - Financial context (optional)
   * @returns {Promise<Object>} AI response with text and suggestions
   */
  async generateResponse(message, sessionId, context = {}) {
    try {
      // Get or initialize conversation history
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      const history = this.conversationHistory.get(sessionId);

      let responseText;

      // Always try to use Gemini API first
      const hasApiKey = process.env.GEMINI_API_KEY && 
                       process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here' && 
                       process.env.GEMINI_API_KEY.length > 30;
      
      if (hasApiKey) {
        // Build context-aware prompt
        const systemPrompt = this.buildSystemPrompt(context);
        const fullPrompt = `${systemPrompt}

Historial de conversación:
${history.map(h => `Usuario: ${h.user}\nAsistente: ${h.assistant}`).join('\n\n')}

Usuario: ${message}
Asistente:`;

        // Generate response with Gemini
        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        responseText = response.text();
        console.log('✅ Gemini API response generated successfully');
      } else {
        throw new Error('API key not configured properly');
      }

      // Update conversation history
      history.push({
        user: message,
        assistant: responseText,
        timestamp: new Date().toISOString()
      });

      // Keep only last 10 exchanges to manage memory
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }

      // Generate follow-up suggestions
      const suggestions = this.generateSuggestions(message, context);

      return {
        response: responseText,
        suggestions: suggestions,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        demoMode: !hasApiKey
      };

    } catch (error) {
      console.error('Chatbot service error:', error);
      return {
        response: "Disculpa, estoy teniendo dificultades técnicas. ¿Podrías reformular tu pregunta?",
        suggestions: ["¿Cómo está mi flujo de caja?", "¿Qué recomiendas para mejorar?", "Analiza mis riesgos"],
        error: true
      };
    }
  }

  /**
   * Generate demo responses when Gemini API is not available
   */
  generateDemoResponse(message, context) {
    const messageLower = message.toLowerCase();
    
    // Flujo de caja
    if (messageLower.includes('flujo') || messageLower.includes('cash') || messageLower.includes('liquidez')) {
      if (context.jobId) {
        return `Basándome en tu análisis, tu flujo de caja actual muestra un balance de $${context.cashBalance?.toLocaleString() || '85,000'} con un burn rate mensual de $${context.monthlyBurn?.toLocaleString() || '45,000'}. Esto te da un runway de aproximadamente ${context.runway || '1.9'} meses. Te recomiendo:

1. **Acelerar cobros**: Implementa facturación automática y ofrece descuentos por pronto pago
2. **Optimizar gastos**: Revisa suscripciones y gastos no esenciales
3. **Diversificar ingresos**: Explora nuevas líneas de producto o servicios

¿Te gustaría que profundice en alguna de estas estrategias?`;
      } else {
        return `El flujo de caja es fundamental para cualquier empresa. Las mejores prácticas incluyen:

🔸 **Monitoreo diario**: Revisa tu posición de efectivo cada día
🔸 **Pronósticos a 13 semanas**: Proyecta ingresos y gastos
🔸 **Reserva de emergencia**: Mantén 3-6 meses de gastos operativos
🔸 **Automatización**: Usa herramientas para acelerar cobros y pagos

¿Tienes algún desafío específico con tu flujo de caja?`;
      }
    }

    // Pronósticos
    if (messageLower.includes('pronóstico') || messageLower.includes('forecast') || messageLower.includes('proyec')) {
      return `Para crear pronósticos financieros efectivos:

📊 **Datos históricos**: Usa al menos 12 meses de datos
📈 **Múltiples escenarios**: Calcula base, optimista y pesimista
⚠️ **Variables clave**: Identifica factores que más impactan tus resultados
🔄 **Actualización regular**: Revisa y ajusta cada mes

Los pronósticos más precisos combinan datos históricos con análisis de tendencias del mercado. ¿Qué horizonte temporal necesitas proyectar?`;
    }

    // Riesgos
    if (messageLower.includes('riesgo') || messageLower.includes('problema') || messageLower.includes('alert')) {
      return `Los principales riesgos financieros a monitorear:

🚨 **Riesgo de liquidez**: Quedarse sin efectivo
📉 **Concentración de clientes**: Dependencia excesiva de pocos clientes
💸 **Sobrecostos**: Gastos que crecen más rápido que ingresos
🏦 **Acceso a financiamiento**: Dificultades para obtener capital

${context.jobId ? 'Según tu análisis, deberías prestar especial atención a tu runway limitado.' : 'Para identificar riesgos específicos, sube tus datos financieros.'}

¿Hay algún riesgo particular que te preocupe?`;
    }

    // KPIs y métricas
    if (messageLower.includes('métrica') || messageLower.includes('kpi') || messageLower.includes('indicador')) {
      return `Las métricas financieras más importantes para monitorear:

💰 **Cash Balance**: Efectivo disponible
🔥 **Burn Rate**: Gasto mensual neto
🛣️ **Runway**: Meses hasta quedarse sin efectivo
📊 **Gross Margin**: Margen bruto de utilidad
⚡ **Quick Ratio**: Liquidez inmediata

También considera métricas específicas de tu industria. ¿En qué sector operas?`;
    }

    // Crecimiento
    if (messageLower.includes('crecer') || messageLower.includes('expandir') || messageLower.includes('crecimiento')) {
      return `Estrategias de crecimiento financieramente sostenible:

🎯 **Crecimiento orgánico**: Optimiza procesos antes de escalar
💡 **Nuevos productos**: Expande tu oferta gradualmente
🤝 **Partnerships**: Colaboraciones estratégicas
📊 **Data-driven**: Basa decisiones en métricas sólidas

El crecimiento debe ser rentable y financiable. ¿Cuál es tu objetivo de crecimiento?`;
    }

    // Respuesta general
    return `Entiendo tu consulta sobre "${message}". Como asistente financiero, puedo ayudarte con:

• **Análisis de flujo de caja** y optimización de liquidez
• **Pronósticos financieros** y planificación estratégica  
• **Identificación de riesgos** y estrategias de mitigación
• **KPIs financieros** y métricas de rendimiento
• **Estrategias de crecimiento** sostenible

¿Podrías ser más específico sobre qué aspecto financiero te interesa más?`;
  }

  /**
   * Build system prompt with financial context
   */
  buildSystemPrompt(context) {
    const basePrompt = `Eres un asistente financiero AI especializado en análisis de flujo de caja y decisiones empresariales para Banorte. 

Características:
- Respondes en español
- Eres profesional pero accesible
- Te enfocas en flujo de caja, pronósticos y recomendaciones financieras
- Ofreces insights accionables y específicos
- Si no tienes datos suficientes, pides aclaración

Contexto empresarial:`;

    if (context.jobId) {
      return `${basePrompt}
- Empresa: Análisis activo (Job ID: ${context.jobId})
- Balance actual: ${context.cashBalance ? `$${context.cashBalance.toLocaleString()}` : 'No disponible'}
- Burn rate mensual: ${context.monthlyBurn ? `$${context.monthlyBurn.toLocaleString()}` : 'No disponible'}
- Runway: ${context.runway ? `${context.runway} meses` : 'No disponible'}
- Ingresos mensuales: ${context.revenue ? `$${context.revenue.toLocaleString()}` : 'No disponible'}`;
    } else {
      return `${basePrompt}
- Modo: Demostración (sin datos específicos de empresa)
- Enfócate en consejos generales y mejores prácticas
- Invita al usuario a subir sus datos para análisis personalizado`;
    }
  }

  /**
   * Generate contextual follow-up suggestions
   */
  generateSuggestions(message, context) {
    const suggestions = [];
    
    if (context.jobId) {
      // Suggestions with real data
      suggestions.push(
        "¿Cómo puedo mejorar mi runway?",
        "¿Qué riesgos vees en mi pronóstico?",
        "Sugiere estrategias para optimizar el flujo"
      );
    } else {
      // General suggestions for demo mode
      suggestions.push(
        "¿Qué métricas financieras debería monitorear?",
        "¿Cómo hago un pronóstico de flujo de caja?",
        "¿Cuáles son las mejores prácticas financieras?"
      );
    }

    // Add message-specific suggestions
    const messageLower = message.toLowerCase();
    if (messageLower.includes('flujo') || messageLower.includes('cash')) {
      suggestions.push("Analiza mi flujo de caja proyectado");
    }
    if (messageLower.includes('riesgo') || messageLower.includes('problema')) {
      suggestions.push("¿Qué alertas rojas debo considerar?");
    }
    if (messageLower.includes('crecer') || messageLower.includes('expandir')) {
      suggestions.push("Estrategias de crecimiento sostenible");
    }

    return suggestions.slice(0, 3); // Return max 3 suggestions
  }

  /**
   * Clear conversation history for a session
   */
  clearHistory(sessionId) {
    this.conversationHistory.delete(sessionId);
  }

  /**
   * Get conversation history for a session
   */
  getHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }
}

module.exports = new ChatbotService();