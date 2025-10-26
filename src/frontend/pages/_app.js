import React, { useState, createContext, useEffect } from 'react';
import Link from 'next/link';
import '../styles/globals.css';

export const AppContext = createContext();

function MyApp({ Component, pageProps }) {
  const [jobId, setJobId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedJobId = localStorage.getItem('jobId');
      const savedFile = localStorage.getItem('uploadedFile');
      if (savedJobId) {
        console.log('🔄 Restored jobId from localStorage:', savedJobId);
        setJobId(savedJobId);
      }
      if (savedFile) {
        console.log('🔄 Restored filename from localStorage:', savedFile);
        setUploadedFile(savedFile);
      }
    }
  }, []);

  const setJobIdPersistent = (newJobId) => {
    console.log('💾 Saving jobId to localStorage:', newJobId);
    setJobId(newJobId);
    if (typeof window !== 'undefined') {
      if (newJobId) {
        localStorage.setItem('jobId', newJobId);
      } else {
        localStorage.removeItem('jobId');
      }
    }
  };

  const setUploadedFilePersistent = (newFile) => {
    console.log('💾 Saving filename to localStorage:', newFile);
    setUploadedFile(newFile);
    if (typeof window !== 'undefined') {
      if (newFile) {
        localStorage.setItem('uploadedFile', newFile);
      } else {
        localStorage.removeItem('uploadedFile');
      }
    }
  };

  return (
    <AppContext.Provider value={{ 
      jobId, 
      setJobId: setJobIdPersistent, 
      uploadedFile, 
      setUploadedFile: setUploadedFilePersistent 
    }}>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">Banorte Exec</div>
          <nav className="nav">
            <Link href="/">Inicio</Link>
            <Link href="/upload">Carga</Link>
            <Link href="/diagnose">Diagnóstico</Link>
            <Link href="/forecast">Pronóstico</Link>
            <Link href="/whatif">What-If</Link>
            <Link href="/recommendations">Recomendaciones</Link>
            <Link href="/chat">🤖 AI Assistant</Link>
          </nav>
        </aside>
        <header className="topbar">
          <div className="title">Enterprise Financial Assistant</div>
          <div className="meta">{jobId ? `Job ${jobId}` : 'Sin job activo'}</div>
        </header>
        <main className="app-main">
          <Component {...pageProps} />
        </main>
      </div>
    </AppContext.Provider>
  );
}

export default MyApp;
