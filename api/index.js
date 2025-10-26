require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory job store (for demo purposes)
const jobs = new Map();

// Helper function to generate job ID
function generateJobId() {
  return 'mh' + Math.random().toString(36).substr(2, 12);
}

// Helper function to parse CSV
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      let value = values[index]?.trim() || '0';
      if (header === 'cash' || header === 'income' || header === 'expenses') {
        value = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
      }
      row[header] = value;
    });
    data.push(row);
  }
  
  return data;
}

// API Routes
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvContent = fs.readFileSync(req.file.path, 'utf8');
    const data = parseCSV(csvContent);
    
    const jobId = generateJobId();
    jobs.set(jobId, {
      id: jobId,
      filename: req.file.originalname,
      data: data,
      uploadTime: new Date(),
      diagnosis: null,
      forecast: null
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    console.log(`✅ File uploaded successfully: ${req.file.originalname}, JobID: ${jobId}`);
    res.json({ job_id: jobId, filename: req.file.originalname });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/data', (req, res) => {
  const jobId = req.query.job_id;
  if (!jobId) {
    return res.status(400).json({ error: 'job_id is required' });
  }

  const job = jobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({ data: job.data });
});

app.get('/api/diagnose', (req, res) => {
  const jobId = req.query.job_id;
  if (!jobId) {
    return res.status(400).json({ error: 'job_id is required' });
  }

  const job = jobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Simple diagnosis logic
  const data = job.data;
  const currentCash = data[data.length - 1]?.cash || 0;
  const avgExpenses = data.reduce((sum, row) => sum + (row.expenses || 0), 0) / data.length;
  const avgIncome = data.reduce((sum, row) => sum + (row.income || 0), 0) / data.length;
  
  const alerts = [];
  if (currentCash < avgExpenses * 2) {
    alerts.push({
      type: 'low_cash',
      severity: 'red',
      message: 'Cash balance is critically low',
      value: currentCash
    });
  }

  const diagnosis = {
    alerts,
    metrics: {
      cashBalance: currentCash,
      monthlyBurn: avgExpenses - avgIncome,
      runway: currentCash / Math.max(avgExpenses - avgIncome, 1),
      totalTransactions: data.length
    }
  };

  job.diagnosis = diagnosis;
  res.json(diagnosis);
});

app.get('/api/forecast', (req, res) => {
  const jobId = req.query.job_id;
  const horizon = parseInt(req.query.horizon) || 90;
  
  if (!jobId) {
    return res.status(400).json({ error: 'job_id is required' });
  }

  const job = jobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const data = job.data;
  const currentCash = data[data.length - 1]?.cash || 0;
  const avgIncome = data.reduce((sum, row) => sum + (row.income || 0), 0) / data.length;
  const avgExpenses = data.reduce((sum, row) => sum + (row.expenses || 0), 0) / data.length;
  const monthlyChange = avgIncome - avgExpenses;

  // Generate forecast scenarios
  const scenarios = {
    base: [],
    optimistic: [],
    pessimistic: []
  };

  for (let day = 1; day <= horizon; day++) {
    const monthProgress = day / 30;
    
    scenarios.base.push({
      day,
      date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.max(0, currentCash + (monthProgress * monthlyChange))
    });
    
    scenarios.optimistic.push({
      day,
      date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.max(0, currentCash + (monthProgress * monthlyChange * 1.2))
    });
    
    scenarios.pessimistic.push({
      day,
      date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.max(0, currentCash + (monthProgress * monthlyChange * 0.8))
    });
  }

  const forecast = {
    scenarios,
    break_risk: {
      probability: monthlyChange < 0 ? 0.3 : 0.1,
      days_to_break: monthlyChange < 0 ? Math.floor(currentCash / Math.abs(monthlyChange) * 30) : null
    }
  };

  job.forecast = forecast;
  res.json(forecast);
});

app.post('/api/recommend', (req, res) => {
  // Simple recommendations
  const recommendations = {
    plans: [
      {
        id: 'A',
        title: 'Cost Reduction',
        description: 'Reduce operational expenses by 15%',
        impact: 'High cost savings',
        timeline: '1-2 months'
      },
      {
        id: 'B',
        title: 'Revenue Growth',
        description: 'Increase income streams by 20%',
        impact: 'Sustainable growth',
        timeline: '3-6 months'
      },
      {
        id: 'C',
        title: 'Cash Optimization',
        description: 'Optimize cash flow timing',
        impact: 'Improved liquidity',
        timeline: '1 month'
      }
    ],
    recommended: 'B'
  };

  res.json(recommendations);
});

app.post('/api/execute', (req, res) => {
  const { planId } = req.body;
  
  const result = {
    planId,
    status: 'executed',
    projectedImprovement: {
      cashFlow: planId === 'A' ? '+15%' : planId === 'B' ? '+20%' : '+10%',
      timeline: planId === 'A' ? '2 months' : planId === 'B' ? '6 months' : '1 month'
    }
  };

  res.json(result);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Eres un asistente financiero AI especializado en análisis de flujo de efectivo para empresas. 
    Responde de manera concisa y profesional a esta consulta: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      message: text,
      sessionId: sessionId || 'default',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat service unavailable' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// For Vercel
module.exports = app;