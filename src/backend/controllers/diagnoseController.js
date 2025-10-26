const jobStore = require('../services/jobStore');
const diagnosisService = require('../services/diagnosisService');

/**
 * GET /diagnose?job_id=...
 * Returns diagnosis for a job. If not present, computes on-demand.
 */
exports.diagnose = async (req, res) => {
  try {
    const jobId = req.query.job_id;
    console.log(`🔍 Diagnose request for job: ${jobId}`);
    
    if (!jobId) return res.status(400).json({ error: 'job_id is required' });

    const job = jobStore.getJob(jobId);
    if (!job) {
      console.log(`❌ Job not found: ${jobId}`);
      return res.status(404).json({ error: 'job not found' });
    }

    console.log(`📊 Job found with ${job.data?.length || 0} records`);

    if (!job.diagnosis) {
      console.log(`🔄 Computing diagnosis on-demand for job ${jobId}`);
      const diagnosis = await diagnosisService.analyze(job.data);
      jobStore.updateJob(jobId, { diagnosis });
      return res.json({ job_id: jobId, diagnosis });
    }

    console.log(`✅ Returning cached diagnosis for job ${jobId}`);
    return res.json({ job_id: jobId, diagnosis: job.diagnosis });
  } catch (err) {
    console.log(`❌ Diagnose error:`, err);
    return res.status(500).json({ error: String(err) });
  }
};
  