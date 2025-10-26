const jobStore = require('../services/jobStore');
const recommendService = require('../services/recommendService');

/**
 * POST /recommend
 * Body: { job_id }
 * Returns 3 plans + one recommended
 */
exports.recommend = async (req, res) => {
  try {
    const jobId = req.body.job_id;
    if (!jobId) return res.status(400).json({ error: 'job_id is required in body' });

    const job = jobStore.getJob(jobId);
    if (!job) return res.status(404).json({ error: 'job not found' });

    // Ensure diagnosis and forecast exist
    const diagnosis = job.diagnosis || await require('../services/diagnosisService').analyze(job.data);
    const forecast = job.forecast || await require('../services/forecastService').generateForecast(job.data, { horizon: 90 });

    const recommendations = recommendService.generateRecommendations(diagnosis, forecast);
    jobStore.updateJob(jobId, { recommendations });

    return res.json({ job_id: jobId, recommendations });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
