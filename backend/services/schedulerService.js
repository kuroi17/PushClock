const schedule = require("node-schedule");
const { exec } = require("child_process");
const { promisify } = require("util");
const supabase = require("../config/supabase");

const execAsync = promisify(exec);

// Store active jobs in memory
const activeJobs = new Map();

/**
 * Execute git push for a specific schedule
 */
const executeGitPush = async (scheduleData) => {
  const { id, repo_path, branch } = scheduleData;

  console.log(`🚀 Executing scheduled push for schedule ${id}`);
  console.log(`   Repo: ${repo_path}`);
  console.log(`   Branch: ${branch}`);

  try {
    // Update status to in-progress
    await supabase
      .from("schedules")
      .update({
        status: "in-progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Change to repo directory and execute git push
    const command = `cd "${repo_path}" && git push origin ${branch}`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 60 second timeout
      windowsHide: true,
    });

    console.log(`✅ Push successful for schedule ${id}`);
    if (stdout) console.log("   Output:", stdout);
    if (stderr) console.log("   Errors:", stderr);

    // Update status to completed
    await supabase
      .from("schedules")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Remove from active jobs
    activeJobs.delete(id);

    return { success: true, output: stdout };
  } catch (error) {
    console.error(`❌ Push failed for schedule ${id}:`, error.message);

    // Update status to error
    await supabase
      .from("schedules")
      .update({
        status: "error",
        error_message: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Remove from active jobs
    activeJobs.delete(id);

    return { success: false, error: error.message };
  }
};

/**
 * Schedule a job for a specific schedule
 */
const scheduleJob = (scheduleData) => {
  const { id, push_time } = scheduleData;

  // Cancel existing job if any
  if (activeJobs.has(id)) {
    activeJobs.get(id).cancel();
  }

  const pushDate = new Date(push_time);

  // Check if the push_time is in the future
  if (pushDate <= new Date()) {
    console.log(`⚠️ Schedule ${id} is in the past, skipping`);
    return null;
  }

  // Create a new scheduled job
  const job = schedule.scheduleJob(pushDate, async () => {
    console.log(`⏰ Triggered: Schedule ${id} at ${new Date().toISOString()}`);
    await executeGitPush(scheduleData);
  });

  if (job) {
    activeJobs.set(id, job);
    console.log(`📅 Scheduled job for ${id} at ${pushDate.toISOString()}`);
  }

  return job;
};

/**
 * Load all pending schedules from database and schedule them
 */
const loadSchedules = async () => {
  console.log("📥 Loading schedules from database...");

  try {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("status", "scheduled");

    if (error) throw error;

    console.log(`   Found ${data.length} scheduled jobs`);

    data.forEach((scheduleData) => {
      scheduleJob(scheduleData);
    });

    return data;
  } catch (error) {
    console.error("❌ Error loading schedules:", error);
    return [];
  }
};

/**
 * Cancel a scheduled job
 */
const cancelJob = (scheduleId) => {
  if (activeJobs.has(scheduleId)) {
    activeJobs.get(scheduleId).cancel();
    activeJobs.delete(scheduleId);
    console.log(`🚫 Cancelled job for schedule ${scheduleId}`);
    return true;
  }
  return false;
};

/**
 * Get all active jobs
 */
const getActiveJobs = () => {
  return Array.from(activeJobs.keys());
};

module.exports = {
  executeGitPush,
  scheduleJob,
  loadSchedules,
  cancelJob,
  getActiveJobs,
};
