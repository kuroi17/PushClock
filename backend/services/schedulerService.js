const schedule = require("node-schedule");
const supabase = require("../config/supabase");
const MergeService = require("./mergeService");

// Store active jobs in memory
const activeJobs = new Map();

/**
 * Execute branch merge for a specific schedule
 */
const executeMerge = async (scheduleData, accessToken) => {
  const {
    id,
    repo_owner,
    repo_name,
    source_branch,
    target_branch,
    commit_message,
  } = scheduleData;

  console.log(`🔀 Executing scheduled merge for schedule ${id}`);
  console.log(`   Repo: ${repo_owner}/${repo_name}`);
  console.log(`   ${source_branch} → ${target_branch}`);

  try {
    // Update status to in-progress
    await supabase
      .from("schedules")
      .update({
        status: "in-progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Execute the merge via GitHub API
    const result = await MergeService.mergeBranches(accessToken, {
      repo_owner,
      repo_name,
      source_branch,
      target_branch,
      commit_message,
    });

    console.log(`✅ Merge successful for schedule ${id}`);
    console.log(`   SHA: ${result.sha ? result.sha.substring(0, 7) : "N/A"}`);

    // Update status to completed
    await supabase
      .from("schedules")
      .update({
        status: "completed",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Remove from active jobs
    activeJobs.delete(id);

    return { success: true, result };
  } catch (error) {
    console.error(`❌ Merge failed for schedule ${id}:`, error.message);

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
const scheduleJob = (scheduleData, accessToken) => {
  const { id, push_time } = scheduleData;

  if (!accessToken) {
    console.error(`⚠️ No access token provided for schedule ${id}`);
    return null;
  }

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
    await executeMerge(scheduleData, accessToken);
  });

  if (job) {
    activeJobs.set(id, job);
    console.log(`📅 Scheduled merge for ${id} at ${pushDate.toISOString()}`);
  }

  return job;
};

/**
 * Load all pending schedules from database and schedule them
 */
const loadSchedules = async () => {
  console.log("📥 Loading schedules from database...");

  try {
    // Fetch schedules with user info (need access token)
    const { data, error } = await supabase
      .from("schedules")
      .select(
        `
        *,
        users!inner(access_token)
      `,
      )
      .in("status", ["scheduled", "active"]);

    if (error) throw error;

    console.log(`   Found ${data.length} scheduled jobs`);

    data.forEach((scheduleData) => {
      const accessToken = scheduleData.users?.access_token;
      if (accessToken) {
        scheduleJob(scheduleData, accessToken);
      } else {
        console.error(
          `⚠️ No access token for schedule ${scheduleData.id}, skipping`,
        );
      }
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
  executeMerge,
  scheduleJob,
  loadSchedules,
  cancelJob,
  getActiveJobs,
};
