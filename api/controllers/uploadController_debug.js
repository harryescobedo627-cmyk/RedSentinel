const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jobStore = require('../services/jobStore');
const diagnosisService = require('../services/diagnosisService');
const forecastService = require('../services/forecastService');

// Test simple endpoint
exports.test = (req, res) => {
  console.log('🧪 Test endpoint hit');
  res.json({ message: 'Upload endpoint is working', timestamp: Date.now() });
};

// Test upload without multer first
exports.testUploadSimple = (req, res) => {
  console.log('🧪 Simple upload test hit');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  res.json({ message: 'Simple upload endpoint working' });
};

const upload = multer({ dest: 'tmp/' });

/**
 * Simple CSV parser for small files (assumes header row, comma separated).
 * Returns array of objects using header columns.
 */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i] !== undefined ? cols[i] : null; });
    return obj;
  });
  return rows;
}

/**
 * POST /upload
 * - multipart form with `file` field
 * - parses CSV into array-of-objects, stores job, kicks off background processing
 */
exports.uploadCsv = [
  upload.single('file'),
  async (req, res) => {
    try {
      console.log('📁 Upload request received');
      if (!req.file) {
        console.log('❌ No file in request');
        return res.status(400).json({ error: 'file is required' });
      }
      
      console.log(`📄 File received: ${req.file.originalname}, size: ${req.file.size} bytes`);
      const tmpPath = req.file.path;
      const text = fs.readFileSync(tmpPath, 'utf8');
      const data = parseCsv(text);
      console.log(`📊 Parsed ${data.length} rows from CSV`);

      const jobId = jobStore.createJob({ data, createdAt: Date.now() });
      console.log(`🆔 Created job: ${jobId}`);

      // Kick off async processing: diagnosis + base forecast
      (async () => {
        try {
          console.log(`🔍 Starting analysis for job ${jobId}`);
          const diagnosis = await diagnosisService.analyze(data);
          jobStore.updateJob(jobId, { diagnosis });
          console.log(`✅ Diagnosis complete for job ${jobId}`);

          const forecast = await forecastService.generateForecast(data, { horizon: 90 });
          jobStore.updateJob(jobId, { forecast });
          jobStore.updateJob(jobId, { status: 'ready' });
          console.log(`✅ All processing complete for job ${jobId}`);
        } catch (err) {
          console.log(`❌ Processing error for job ${jobId}:`, err);
          jobStore.updateJob(jobId, { status: 'error', error: String(err) });
        }
      })();

      // keep uploaded file for audit briefly
      const keepDir = path.join('tmp', 'uploads');
      if (!fs.existsSync(keepDir)) fs.mkdirSync(keepDir, { recursive: true });
      fs.renameSync(tmpPath, path.join(keepDir, req.file.filename));

      // return job id and original filename so frontend can show progress/details
      return res.json({ job_id: jobId, filename: req.file.originalname });
    } catch (err) {
      console.log('❌ Upload controller error:', err);
      return res.status(500).json({ error: String(err) });
    }
  }
];