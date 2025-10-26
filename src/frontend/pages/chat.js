/**
 * ROLE: Frontend Lead
 * Chat page - AI Financial Assistant interface
 * - Full-screen chatbot experience
 * - Integration with financial data context
 * - Professional banking interface
 */
import { useContext } from 'react';
import { AppContext } from './_app';
import ChatbotComponent from '../components/ChatbotComponent';

export default function ChatPage() {
  const { jobId, uploadedFile } = useContext(AppContext);

  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ marginBottom: '8px' }}>
          Asistente Financiero IA
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
          {jobId 
            ? `Chatea con nuestra IA especializada en finanzas. He analizado tu archivo "${uploadedFile}" y estoy listo para ayudarte con estrategias personalizadas.`
            : "Conversa con nuestra IA financiera experta. Para consejos personalizados basados en tus datos, sube tu archivo CSV primero."
          }
        </p>
        
        {!jobId && (
          <div className="alert alert-yellow">
            <strong>Modo Demostración:</strong> Obtén consejos generales y mejores prácticas. 
            <a href="/upload" style={{ color: 'var(--color-accent)', marginLeft: '4px' }}>
              Sube tu archivo
            </a> para análisis personalizado.
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <ChatbotComponent />
        
        {/* Quick Actions Panel */}
        <div className="card">
          <h3 style={{ marginBottom: '12px', fontSize: 'var(--fs-lg)' }}>
            Acciones Rápidas
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            <a href="/diagnose" className="btn btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              📊 Ver Diagnóstico
            </a>
            <a href="/forecast" className="btn btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              📈 Ver Pronóstico
            </a>
            <a href="/whatif" className="btn btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              🔮 Simulador What-If
            </a>
            <a href="/recommendations" className="btn btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              💡 Recomendaciones
            </a>
          </div>
          
          {!jobId && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <a href="/upload" className="btn" style={{ textDecoration: 'none' }}>
                📁 Subir Datos para Análisis Personalizado
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}