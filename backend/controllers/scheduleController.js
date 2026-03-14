// POST rollback/undo merge for a schedule
const rollbackSchedule = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  try {
    // Fetch the schedule and validate ownership
    const { data: schedule, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    if (schedule.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Rollback is only allowed for completed merges.",
      });
    }

    // Check for merge_commit_sha (should be stored after merge)
    if (!schedule.merge_commit_sha) {
      return res.status(400).json({
        success: false,
        message:
          "No merge commit SHA found for this schedule. Cannot rollback.",
      });
    }

    // Call GitHub API to revert the merge commit
    const MergeService = require("../services/mergeService");
    const accessToken = req.user.access_token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "GitHub access token not found. Please re-authenticate.",
      });
    }

    const { repo_owner, repo_name, target_branch, merge_commit_sha } = schedule;
    const revertResult = await MergeService.revertCommit(accessToken, {
      owner: repo_owner,
      repo: repo_name,
      commitSha: merge_commit_sha,
      branch: target_branch,
      actor: {
        username: req.user.username,
        githubId: req.user.github_id,
      },
    });

    if (!revertResult.success) {
      // Log the rollback attempt failure
      console.error(
        `❌ Rollback failed for schedule ${id}: ${revertResult.message}`,
      );

      // Audit log: rollback failed
      await logActivity({
        user_id: userId,
        action: "rollback-failed",
        schedule_id: id,
        details: {
          message: revertResult.message,
          merge_commit_sha,
          target_branch,
        },
      });

      const rollbackFailureStatus = revertResult.message
        .toLowerCase()
        .includes("manual")
        ? 409
        : 500;

      return res.status(rollbackFailureStatus).json({
        success: false,
        message: `GitHub revert failed: ${revertResult.message}`,
      });
    }

    // Update schedule with rollback information and audit timestamp
    const rollbackTimestamp = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("schedules")
      .update({
        status: "rollback-completed",
        revert_commit_sha: revertResult.sha,
        rollback_at: rollbackTimestamp,
        updated_at: rollbackTimestamp,
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(`Failed to save rollback status: ${updateError.message}`);
    }

    // log the rollback attempt success
    const shortSha = revertResult.sha?.substring(0, 7) || "N/A";
    console.log(`✅ Rollback completed for schedule ${id}: ${shortSha}`);

    // Audit log: rollback success
    await logActivity({
      user_id: userId,
      action: "rollback-success",
      schedule_id: id,
      details: {
        revert_commit_sha: revertResult.sha,
        revert_commit_url: revertResult.html_url,
        merge_commit_sha,
        target_branch,
        rollback_at: rollbackTimestamp,
      },
    });

    return res.json({
      success: true,
      message: "Rollback (revert) completed successfully.",
      revert_commit_sha: revertResult.sha,
      revert_commit_url: revertResult.html_url,
      rollback_at: rollbackTimestamp,
    });
  } catch (err) {
    // Log the error and send the actual error message to the frontend
    console.error("Error in rollbackSchedule:", err);
    let errorMsg =
      err && err.message
        ? err.message
        : typeof err === "string"
          ? err
          : "Unknown error";
    return res.status(500).json({
      success: false,
      message: errorMsg || "Failed to process rollback request",
      error: err.stack || errorMsg,
    });
  }
};
const supabase = require("../config/supabase");
const { scheduleJob, cancelJob } = require("../services/schedulerService");
const { logActivity } = require("../services/activityLogService");

// GET all schedules
const getAllSchedules = async (req, res) => {
  try {
    // Get schedules for the authenticated user only
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", userId)
      .order("push_time", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      count: data ? data.length : 0,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedules",
      error: error.message,
    });
  }
};

// GET single schedule by ID
const getScheduleById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  try {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
      error: error.message,
    });
  }
};

// POST preview merge changes for selected branches
const previewMergeChanges = async (req, res) => {
  const userId = req.user?.id;
  const accessToken = req.user?.access_token;
  const { repo_owner, repo_name, source_branch, target_branch } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "GitHub access token not found. Please re-authenticate.",
    });
  }

  if (!repo_owner || !repo_name || !source_branch || !target_branch) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: repo_owner, repo_name, source_branch, target_branch",
    });
  }

  try {
    const MergeService = require("../services/mergeService");
    const preview = await MergeService.compareBranches(
      accessToken,
      repo_owner,
      repo_name,
      target_branch,
      source_branch,
    );

    const hasChanges =
      (preview?.ahead_by || 0) > 0 ||
      (preview?.summary?.files_changed || 0) > 0;

    return res.json({
      success: true,
      message: hasChanges
        ? "Merge preview generated successfully"
        : "No differences found between source and target branches",
      preview: {
        repository: `${repo_owner}/${repo_name}`,
        from: source_branch,
        to: target_branch,
        can_auto_merge: preview.status !== "diverged",
        ...preview,
      },
    });
  } catch (error) {
    console.error("Error generating merge preview:", error.message);
    const errorMessage =
      error?.message ||
      "Failed to generate merge preview for selected branches";
    const statusCode = errorMessage.toLowerCase().includes("not found")
      ? 404
      : 400;

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};

// POST create new schedule
const createSchedule = async (req, res) => {
  const {
    repo_path,
    source_branch,
    target_branch,
    push_time,
    github_repo_url,
    repo_owner,
    repo_name,
    commit_message,
  } = req.body;
  const userId = req.user?.id;

  // Validation
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  // Require GitHub repo details and branches
  if (!github_repo_url || !repo_owner || !repo_name) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: github_repo_url, repo_owner, repo_name",
    });
  }

  if (!source_branch || !target_branch || !push_time) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: source_branch, target_branch, push_time",
    });
  }

  try {
    const scheduleData = {
      user_id: userId,
      source_branch,
      target_branch,
      push_time,
      github_repo_url,
      repo_owner,
      repo_name,
      commit_message:
        commit_message ||
        `Scheduled merge via PushClock: ${source_branch} → ${target_branch}`,
      status: "scheduled",
      repo_path: null, // No longer used
    };

    const { data, error } = await supabase
      .from("schedules")
      .insert([scheduleData])
      .select()
      .single();

    if (error) throw error;

    // Schedule the merge job
    if (req.user.access_token) {
      try {
        scheduleJob(data, req.user.access_token);

        // Update status to active
        await supabase
          .from("schedules")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id);

        data.status = "active";
      } catch (scheduleError) {
        console.error("Error scheduling merge:", scheduleError);
        // Schedule created but job scheduling failed
      }
    }

    // Audit log: schedule created
    await logActivity({
      user_id: userId,
      action: "create-schedule",
      schedule_id: data.id,
      details: { source_branch, target_branch, push_time },
    });

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create schedule",
      error: error.message,
    });
  }
};

// PUT update schedule
const updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { source_branch, target_branch, push_time, status, commit_message } =
    req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  try {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (source_branch) updateData.source_branch = source_branch;
    if (target_branch) updateData.target_branch = target_branch;
    if (push_time) updateData.push_time = push_time;
    if (status) updateData.status = status;
    if (commit_message !== undefined)
      updateData.commit_message = commit_message;

    const { data, error } = await supabase
      .from("schedules")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    // If push_time or branches changed, reschedule the job
    if (
      (push_time || source_branch || target_branch) &&
      req.user.access_token
    ) {
      try {
        cancelJob(id); // Cancel existing job
        scheduleJob(data, req.user.access_token); // Schedule new job
      } catch (scheduleError) {
        console.error("Error rescheduling merge:", scheduleError);
      }
    }

    res.json({
      success: true,
      message: "Schedule updated successfully",
      data,
    });
    // Audit log: schedule updated
    await logActivity({
      user_id: userId,
      action: "update-schedule",
      schedule_id: id,
      details: {
        source_branch,
        target_branch,
        push_time,
        status,
        commit_message,
      },
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update schedule",
      error: error.message,
    });
  }
};

// PUT toggle schedule status (active <-> paused)
const toggleScheduleStatus = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  try {
    // Get current schedule
    const { data: schedule, error: fetchError } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    // Toggle status
    const newStatus = schedule.status === "active" ? "paused" : "active";

    const { data, error } = await supabase
      .from("schedules")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    // Handle job scheduling/cancellation
    if (req.user.access_token) {
      if (newStatus === "paused") {
        cancelJob(id); // Cancel job when paused
      } else if (newStatus === "active") {
        scheduleJob(data, req.user.access_token); // Reschedule when activated
      }
    }

    res.json({
      success: true,
      message: `Schedule ${newStatus === "active" ? "activated" : "paused"} successfully`,
      data,
    });
  } catch (error) {
    console.error("Error toggling schedule status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle schedule status",
      error: error.message,
    });
  }
};

// DELETE schedule
const deleteSchedule = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  try {
    // Cancel scheduled job if exists
    cancelJob(id);

    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    res.json({
      success: true,
      message: "Schedule deleted successfully",
    });
    // Audit log: schedule deleted
    await logActivity({
      user_id: userId,
      action: "delete-schedule",
      schedule_id: id,
      details: {},
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete schedule",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  previewMergeChanges,
  createSchedule,
  updateSchedule,
  toggleScheduleStatus,
  deleteSchedule,
  rollbackSchedule,
};
