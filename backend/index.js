const express = require("express");
const cors = require("cors");
require("dotenv").config();

const scheduleRoutes = require("./routes/scheduleRoutes");
const { loadSchedules, scheduleJob } = require("./services/schedulerService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "PushPilot Backend API",
    version: "1.0.0",
    status: "running",
  });
});

// API Routes
app.use("/api/schedule", scheduleRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

// Start server and load schedules
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/schedule`);

  // Load and schedule all pending jobs from database
  try {
    await loadSchedules();
    console.log("✅ Schedules loaded successfully\n");
  } catch (error) {
    console.error("❌ Error loading schedules:", error);
  }
});
