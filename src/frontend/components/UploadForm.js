/**
 * ROLE: Pitch Lead + Frontend
 * UploadForm component - Drag & drop + file input for CSV upload
 * - Handles file validation
 * - Provides visual feedback
 * - Uploads file to backend and calls parent callback
 */
import { useState, useRef } from 'react';

export default function UploadForm({ onFileSelected }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      console.log('🚀 Starting upload for file:', selectedFile.name);
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('📤 Sending request to /api/upload...');
      
      const response = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Upload successful:', data);

      // Call parent callback with the response data
      onFileSelected(data);

    } catch (err) {
      console.error('❌ Upload failed:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-red" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <div>
            <p style={{ fontWeight: '600', color: 'var(--color-text)' }}>
              {selectedFile.name}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              Drag & drop your CSV file here
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              or click to browse
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <button
          className="btn"
          onClick={handleUpload}
          disabled={isUploading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {isUploading ? 'Uploading...' : 'Upload and Analyze'}
        </button>
      )}

      <style jsx>{`
        .upload-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius);
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: #FAFAFA;
        }

        .upload-zone:hover {
          border-color: var(--color-accent);
          background: #FFFFFF;
        }

        .upload-zone.dragging {
          border-color: var(--color-accent);
          background: #FFFFFF;
        }

        .alert {
          padding: 12px;
          border-radius: var(--radius);
          margin-bottom: 16px;
        }

        .alert-red {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}
