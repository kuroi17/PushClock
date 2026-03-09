const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');

// Routes
router.get('/', getAllSchedules);           // GET /api/schedule
router.get('/:id', getScheduleById);        // GET /api/schedule/:id
router.post('/', createSchedule);           // POST /api/schedule
router.put('/:id', updateSchedule);         // PUT /api/schedule/:id
router.delete('/:id', deleteSchedule);      // DELETE /api/schedule/:id

module.exports = router;
