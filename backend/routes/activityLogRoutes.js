const express = require("express");
const router = express.Router();
const { getActivityLogs } = require("../controllers/activityLogController");
const { isAuthenticated } = require("../middleware/auth");

// All routes require authentication
router.use(isAuthenticated);

// GET /api/activity-logs
router.get("/", getActivityLogs);

module.exports = router;
