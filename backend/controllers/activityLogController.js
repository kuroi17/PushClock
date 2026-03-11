// backend/controllers/activityLogController.js
const supabase = require("../config/supabase");

// GET /api/activity-logs?user_id=...&schedule_id=...&action=...
const getActivityLogs = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  const { schedule_id, action } = req.query;
  let query = supabase.from("activity_logs").select("*", { count: "exact" }).eq("user_id", userId);
  if (schedule_id) query = query.eq("schedule_id", schedule_id);
  if (action) query = query.eq("action", action);
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch activity logs", error: error.message });
  }
  res.json({ success: true, data });
};

module.exports = { getActivityLogs };
