const jobStore = require('../services/jobStore');
const executeService = require('../services/executeService');

/**
 * POST /execute
 * Body: { job_id, plan_id }
 * Simulates applying a plan and returns updated metrics/forecast
 */
exports.execute = async (req, res) => {
  try {
    const { job_id: jobId, plan_id: planId } = req.body;
    if (!jobId || !planId) return res.status(400).json({ error: 'job_id and plan_id are required' });

    const job = jobStore.getJob(jobId);
    if (!job) return res.status(404).json({ error: 'job not found' });
    const recommendations = job.recommendations || [];
    const plan = recommendations.find(r => r.id === planId);
    if (!plan) return res.status(404).json({ error: 'plan not found' });

    const simulation = executeService.simulateExecution(plan, job);
    // store last simulation
    jobStore.updateJob(jobId, { lastExecution: simulation });

    return res.json({ job_id: jobId, simulation });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
