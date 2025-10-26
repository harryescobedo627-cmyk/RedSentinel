/**
 * ROLE: Pitch Lead + Frontend
 * Upload page - Entry point of the user journey
 * - Allows user to upload CSV file
 * - Calls POST /api/upload
 * - Stores job_id in context
 * - Redirects to /diagnose on success
 */
import { useState, useContext } from 'react';
import { AppContext } from './_app';
import { useRouter } from 'next/router';
import UploadForm from '../components/UploadForm';

export default function UploadPage() {
  const { setJobId, setUploadedFile } = useContext(AppContext);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleUploadSuccess = async (data) => {
    console.log('✅ Upload completed, received data:', data);
    
    try {
      // The data now comes from the backend response
      const { job_id, filename } = data;

      console.log('🆔 Setting jobId:', job_id);
      console.log('� Setting filename:', filename);

      // Update context with the job data
      setJobId(job_id);
      setUploadedFile(filename);

      console.log('🆔 Set jobId to:', job_id);
      console.log('📁 Set filename to:', filename);

      // Redirect to diagnosis page
      setTimeout(() => {
        console.log('🔄 Redirecting to diagnose page...');
        router.push('/diagnose');
      }, 1000);

    } catch (err) {
      console.error('❌ Processing upload error:', err);
      setError(`Failed to process upload: ${err.message}`);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '12px' }}>
        Upload Financial Data
      </h2>
      
      <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
        Upload a CSV with your company's financial transactions. The system will analyze cash flow, detect issues, and generate recommendations.
      </p>

      {error && (
        <div className="alert alert-red">
          {error}
        </div>
      )}

      <UploadForm onFileSelected={handleUploadSuccess} />

      <div style={{ marginTop: '16px', padding: '12px', background: '#FAFAFA', borderRadius: '3px', border: '1px solid var(--color-border)' }}>
        <h4 style={{ marginBottom: '6px' }}>Expected CSV format:</h4>
        <code style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          date, description, amount, category
        </code>
      </div>
    </div>
  );
}
