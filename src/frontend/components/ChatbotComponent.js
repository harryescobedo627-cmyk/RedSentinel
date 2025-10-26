/**
 * ROLE: Frontend Lead
 * AI Chatbot component - Interactive financial assistant
 * - Real-time chat interface with Gemini AI
 * - Context-aware responses based on financial data
 * - Suggestions for follow-up questions
 * - Professional banking UI design
 */
import { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../pages/_app';

export default function ChatbotComponent() {
  const { jobId } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize session
  useEffect(() => {
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    
    // Add welcome message
    const welcomeMessage = {
      type: 'assistant',
      content: jobId 
        ? '¡Hola! Soy tu asistente financiero IA. He analizado tus datos y estoy listo para ayudarte con estrategias, pronósticos y optimización de flujo de caja. ¿En qué puedo asistirte?'
        : '¡Hola! Soy tu asistente financiero IA de Banorte. Estoy aquí para ayudarte con consejos sobre flujo de caja, pronósticos y mejores prácticas financieras. Para análisis personalizado, sube tu archivo CSV. ¿Qué te gustaría saber?',
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
    
    // Set initial suggestions
    setSuggestions(jobId 
      ? ['¿Cómo está mi flujo de caja?', '¿Qué riesgos vees?', 'Recomienda optimizaciones']
      : ['¿Qué métricas debo monitorear?', '¿Cómo hacer pronósticos?', 'Mejores prácticas financieras']
    );
  }, [jobId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !sessionId) return;

    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          sessionId: sessionId,
          jobId: jobId
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          type: 'assistant',
          content: data.message,
          timestamp: data.timestamp
        };

        setMessages(prev => [...prev, assistantMessage]);
        setSuggestions(data.suggestions || []);
      } else {
        throw new Error(data.message || 'Error en la respuesta');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'assistant',
        content: 'Disculpa, estoy teniendo problemas técnicos. ¿Puedes intentar de nuevo?',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: '#10B981' 
        }}></div>
        <h3 style={{ margin: 0, fontSize: 'var(--fs-lg)' }}>
          Asistente Financiero IA
        </h3>
        <span className="badge" style={{ marginLeft: 'auto' }}>
          {jobId ? 'Personalizado' : 'Demo'}
        </span>
      </div>

      {/* Messages Area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '10px 12px',
                borderRadius: 'var(--radius)',
                backgroundColor: message.type === 'user' 
                  ? 'var(--color-accent)' 
                  : message.isError 
                    ? '#FFF5F5'
                    : 'var(--color-surface-muted)',
                color: message.type === 'user' 
                  ? '#FFFFFF' 
                  : message.isError
                    ? '#C8102E'
                    : 'var(--color-text)',
                border: message.type === 'assistant' ? '1px solid var(--color-border)' : 'none',
                fontSize: 'var(--fs-sm)',
                lineHeight: 1.5
              }}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--fs-sm)'
            }}>
              <span>Pensando</span>
              <span className="loading-dots">...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ 
          padding: '8px 16px', 
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '4px 8px',
                  fontSize: 'var(--fs-xs)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'var(--color-surface-muted)';
                  e.target.style.color = 'var(--color-text)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--color-text-secondary)';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ 
        padding: '12px 16px',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu pregunta financiera..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--fs-sm)',
            backgroundColor: 'var(--color-surface)'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="btn"
          style={{ 
            padding: '8px 16px',
            fontSize: 'var(--fs-sm)'
          }}
        >
          {isLoading ? '...' : 'Enviar'}
        </button>
      </form>

      <style jsx>{`
        .loading-dots {
          animation: dots 1.5s steps(3, end) infinite;
        }
        
        @keyframes dots {
          0%, 20% { color: transparent; text-shadow: .25em 0 0 transparent, .5em 0 0 transparent; }
          40% { color: var(--color-text-secondary); text-shadow: .25em 0 0 transparent, .5em 0 0 transparent; }
          60% { text-shadow: .25em 0 0 var(--color-text-secondary), .5em 0 0 transparent; }
          80%, 100% { text-shadow: .25em 0 0 var(--color-text-secondary), .5em 0 0 var(--color-text-secondary); }
        }
      `}</style>
    </div>
  );
}