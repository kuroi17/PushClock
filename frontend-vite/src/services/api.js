const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Schedule API endpoints
const scheduleAPI = {
  // Get all schedules
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/schedule`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch schedules");
    }
    return response.json();
  },

  // Get single schedule by ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/schedule/${id}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch schedule");
    }
    return response.json();
  },

  // Create new schedule
  create: async (scheduleData) => {
    const response = await fetch(`${API_URL}/api/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
      throw new Error("Failed to create schedule");
    }
    return response.json();
  },

  // Update schedule
  update: async (id, scheduleData) => {
    const response = await fetch(`${API_URL}/api/schedule/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
      throw new Error("Failed to update schedule");
    }
    return response.json();
  },

  // Toggle schedule status (active <-> paused)
  toggleStatus: async (id) => {
    const response = await fetch(`${API_URL}/api/schedule/${id}/toggle`, {
      method: "PUT",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to toggle schedule status");
    }
    return response.json();
  },

  // Rollback (undo) a completed merge
  rollback: async (id) => {
    const response = await fetch(`${API_URL}/api/schedule/${id}/rollback`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to rollback merge");
    }
    return response.json();
  },

  // Preview merge changes before scheduling
  previewMerge: async (previewData) => {
    const response = await fetch(`${API_URL}/api/schedule/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(previewData),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok || !responseData.success) {
      throw new Error(
        responseData.message || "Failed to preview merge changes",
      );
    }

    return responseData;
  },

  // Delete schedule
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/schedule/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to delete schedule");
    }
    return response.json();
  },
};
// Activity Log API endpoints
const activityLogAPI = {
  // Get activity logs for the current user (optionally filter by schedule_id or action)
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_URL}/api/activity-logs${query ? `?${query}` : ""}`,
      {
        credentials: "include",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch activity logs");
    }
    return response.json();
  },
};

export { scheduleAPI, API_URL };
export { activityLogAPI };
