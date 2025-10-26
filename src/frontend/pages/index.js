/**
 * ROLE: Pitch Lead + Frontend
 * Landing page - Entry point with navigation to main features
 */
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const features = [
    { title: 'Upload Data', path: '/upload', desc: 'Import your financial CSV' },
    { title: 'Diagnosis', path: '/diagnose', desc: 'Get health alerts & metrics' },
    { title: 'Forecast', path: '/forecast', desc: 'See 30/60/90 day projections' },
    { title: 'What-If', path: '/whatif', desc: 'Test scenarios with sliders' },
    { title: 'Recommendations', path: '/recommendations', desc: 'AI-powered action plans' },
  ];

  return (
    <div>
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          Enterprise Financial Assistant
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          Cash flow analysis and decision support for SMEs
        </p>
        <button 
          className="btn" 
          onClick={() => router.push('/upload')}
          style={{ padding: '12px 20px', fontSize: '0.95rem' }}
        >
          Get Started
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {features.map((feature) => (
          <div 
            key={feature.path}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push(feature.path)}
          >
            <h3 style={{ marginBottom: '6px' }}>{feature.title}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
