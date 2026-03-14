import React, { useState, useEffect } from "react";
import { scheduleAPI } from "../services/api";

const EditScheduleModal = ({ schedule, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    source_branch: "",
    target_branch: "",
    push_time: "",
    commit_message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (schedule && isOpen) {
      // Format datetime-local input value (remove timezone info)
      const pushTime = schedule.push_time || schedule.pushTime;
      const formattedTime = pushTime
        ? new Date(pushTime).toISOString().slice(0, 16)
        : "";

      setFormData({
        source_branch: schedule.source_branch || "pushclock-temp",
        target_branch: schedule.target_branch || "main",
        push_time: formattedTime,
        commit_message:
          schedule.commit_message || "Automated push by PushClock",
      });
      setError("");
    }
  }, [schedule, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const updateData = {
        source_branch: formData.source_branch,
        target_branch: formData.target_branch,
        push_time: new Date(formData.push_time).toISOString(),
        commit_message: formData.commit_message,
      };

      const result = await scheduleAPI.update(schedule.id, updateData);

      if (result.success) {
        alert("Schedule updated successfully!");
        if (onUpdate) onUpdate();
        onClose();
      }
    } catch (err) {
      console.error("Error updating schedule:", err);
      setError(err.message || "Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="pc-surface w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-text">
            Edit Schedule
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="pc-icon-btn"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="pc-label">Repository</label>
            <div className="rounded-lg border border-border bg-bg px-4 py-2 text-sm text-textMuted">
              {schedule?.repo_owner && schedule?.repo_name
                ? `${schedule.repo_owner}/${schedule.repo_name}`
                : schedule?.repo_path || "Unknown"}
            </div>
          </div>

          <div>
            <label htmlFor="source_branch" className="pc-label">
              Source Branch (FROM) <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="source_branch"
              name="source_branch"
              value={formData.source_branch}
              onChange={handleChange}
              required
              className="pc-input"
              placeholder="e.g., pushclock-temp"
            />
            <p className="pc-help">Branch containing your commits.</p>
          </div>

          <div>
            <label htmlFor="target_branch" className="pc-label">
              Target Branch (TO) <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="target_branch"
              name="target_branch"
              value={formData.target_branch}
              onChange={handleChange}
              required
              className="pc-input"
              placeholder="e.g., main"
            />
            <p className="pc-help">Branch to receive the merge.</p>
          </div>

          <div>
            <label htmlFor="push_time" className="pc-label">
              Push Time <span className="text-error">*</span>
            </label>
            <input
              type="datetime-local"
              id="push_time"
              name="push_time"
              value={formData.push_time}
              onChange={handleChange}
              required
              className="pc-input"
            />
          </div>

          <div>
            <label htmlFor="commit_message" className="pc-label">
              Commit Message
            </label>
            <input
              type="text"
              id="commit_message"
              name="commit_message"
              value={formData.commit_message}
              onChange={handleChange}
              className="pc-input"
              placeholder="Automated push by PushClock"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="pc-btn pc-btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pc-btn pc-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Schedule"
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-textMuted">
            <svg
              className="mr-1 inline h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Updating will reschedule the merge with new settings.
          </p>
        </form>
      </div>
    </div>
  );
};

export default EditScheduleModal;
