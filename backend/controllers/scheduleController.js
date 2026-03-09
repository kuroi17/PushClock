const supabase = require('../config/supabase');

// GET all schedules
const getAllSchedules = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('push_time', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      count: data ? data.length : 0
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message
    });
  }
};

// GET single schedule by ID
const getScheduleById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
};

// POST create new schedule
const createSchedule = async (req, res) => {
  const { repo_path, branch, push_time } = req.body;

  // Validation
  if (!repo_path || !branch || !push_time) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: repo_path, branch, push_time'
    });
  }

  try {
    const { data, error } = await supabase
      .from('schedules')
      .insert([
        {
          repo_path,
          branch,
          push_time,
          status: 'scheduled'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule',
      error: error.message
    });
  }
};

// PUT update schedule
const updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { repo_path, branch, push_time, status } = req.body;

  try {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (repo_path) updateData.repo_path = repo_path;
    if (branch) updateData.branch = branch;
    if (push_time) updateData.push_time = push_time;
    if (status) updateData.status = status;

    const { data, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
};

// DELETE schedule
const deleteSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message
    });
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
