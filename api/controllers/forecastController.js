const jobStore = require('../services/jobStore');
const forecastService = require('../services/forecastService');

/**
 * GET /forecast?job_id=...&horizon=30
 * Returns projections for horizons (30/60/90). Default horizon=90
 */
exports.forecast = async (req, res) => {
  try {
    const jobId = req.query.job_id;
    const horizon = parseInt(req.query.horizon || '90', 10);
    if (!jobId) return res.status(400).json({ error: 'job_id is required' });
    if (![30,60,90].includes(horizon)) return res.status(400).json({ error: 'horizon must be 30, 60 or 90' });

    const job = jobStore.getJob(jobId);
    if (!job) return res.status(404).json({ error: 'job not found' });

    // If forecast already computed, use it; otherwise compute
    if (!job.forecast || job.forecast.horizon !== horizon) {
      const forecast = await forecastService.generateForecast(job.data, { horizon });
      jobStore.updateJob(jobId, { forecast });
      return res.json({ job_id: jobId, forecast });
    }

    return res.json({ job_id: jobId, forecast: job.forecast });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
