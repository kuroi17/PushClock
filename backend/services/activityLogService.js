// backend/services/activityLogService.js
const supabase = require("../config/supabase");

/**
 * Log a user activity
 * @param {Object} params
 * @param {string} params.user_id
 * @param {string} params.action
 * @param {string} [params.schedule_id]
 * @param {Object} [params.details]
 */
async function logActivity({
  user_id,
  action,
  schedule_id = null,
  details = null,
}) {
  await supabase.from("activity_logs").insert([
    {
      user_id,
      action,
      schedule_id,
      details,
    },
  ]);
}

module.exports = { logActivity };
