import React, { useState } from "react";
import { scheduleAPI } from "../services/api";
import EditScheduleModal from "./EditScheduleModal";

const RepoCard = ({ schedule, onDelete, onUpdate }) => {
  const [toggling, setToggling] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rollbacking, setRollbacking] = useState(false);
  const [rollbackResult, setRollbackResult] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      failed: "bg-red-100 text-red-800 border-red-300",
      error: "bg-red-100 text-red-800 border-red-300",
      scheduled: "bg-blue-100 text-blue-800 border-blue-300",
      active: "bg-purple-100 text-purple-800 border-purple-300",
      paused: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || colors.scheduled;
  };
  const handleRollback = async () => {
    if (
      !window.confirm(
        "Are you sure you want to rollback (undo) this merge? This will attempt to revert the merge commit on GitHub.",
      )
    ) {
      return;
    }
    setRollbacking(true);
    setRollbackResult(null);
    try {
      const result = await scheduleAPI.rollback(schedule.id);
      setRollbackResult({ success: true, message: result.message });
      if (onUpdate) onUpdate();
    } catch (error) {
      setRollbackResult({ success: false, message: error.message });
    } finally {
      setRollbacking(false);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Display GitHub repo name or fall back to legacy repo_path
  const displayName =
    schedule?.repo_owner && schedule?.repo_name
      ? `${schedule.repo_owner}/${schedule.repo_name}`
      : schedule?.repo_path || "/path/to/repository";

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      if (onDelete) onDelete(schedule.id);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setToggling(true);
      const result = await scheduleAPI.toggleStatus(schedule.id);

      if (result.success) {
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error toggling schedule status:", error);
      alert(`Failed to toggle status: ${error.message}`);
    } finally {
      setToggling(false);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCardClick = (e) => {
    // Don't toggle if clicking on buttons or links
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest("svg")
    ) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
            {schedule?.github_repo_url ? (
              <a
                href={schedule.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                {displayName}
              </a>
            ) : (
              displayName
            )}
          </h3>
          <p className="text-sm text-gray-600 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01"
              />
            </svg>
            Merge:{" "}
            <span className="font-semibold ml-1 text-blue-600">
              {schedule?.source_branch || "pushclock-temp"}
            </span>
            {" → "}
            <span className="font-semibold text-green-600">
              {schedule?.target_branch || "main"}
            </span>
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(schedule?.status || "scheduled")}`}
        >
          {schedule?.status || "Scheduled"}
        </span>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">
              {formatDateTime(schedule?.pushTime || new Date())}
            </span>
          </div>

          {/* Rollback Button (only for completed merges with merge_commit_sha) */}
          {schedule?.status === "completed" && schedule?.merge_commit_sha && (
            <button
              onClick={handleRollback}
              disabled={rollbacking}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200 ml-2 disabled:opacity-50"
              title="Rollback (Undo) Merge"
            >
              {rollbacking ? (
                <svg
                  className="w-5 h-5 animate-spin"
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
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              )}
            </button>
          )}
          {/* Rollback Result Message */}
          {rollbackResult && (
            <div
              className={`mt-3 p-2 rounded text-xs ${rollbackResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {rollbackResult.message}
            </div>
          )}
          <div className="flex space-x-2">
            {/* Toggle Status Button (Play/Pause) */}
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                schedule?.status === "paused"
                  ? "text-green-600 hover:bg-green-50"
                  : "text-yellow-600 hover:bg-yellow-50"
              }`}
              title={
                schedule?.status === "paused"
                  ? "Resume Schedule"
                  : "Pause Schedule"
              }
            >
              {toggling ? (
                <svg
                  className="w-5 h-5 animate-spin"
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
              ) : schedule?.status === "paused" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Edit Button */}
            <button
              onClick={handleEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Edit Schedule"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Delete Schedule"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 mt-4 pt-4 animate-fadeIn">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Schedule Details
          </h4>

          <div className="space-y-2 text-sm">
            {/* Repository URL */}
            {schedule?.github_repo_url && (
              <div className="flex items-start">
                <span className="font-medium text-gray-600 w-32">
                  Repository:
                </span>
                <a
                  href={schedule.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {schedule.github_repo_url}
                </a>
              </div>
            )}

            {/* Source Branch */}
            <div className="flex items-start">
              <span className="font-medium text-gray-600 w-32">
                Source Branch:
              </span>
              <span className="text-gray-800 flex-1">
                {schedule?.source_branch || "N/A"}
              </span>
            </div>

            {/* Target Branch */}
            <div className="flex items-start">
              <span className="font-medium text-gray-600 w-32">
                Target Branch:
              </span>
              <span className="text-gray-800 flex-1">
                {schedule?.target_branch || "N/A"}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-start">
              <span className="font-medium text-gray-600 w-32">Status:</span>
              <span className="flex-1">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(schedule?.status)}`}
                >
                  {schedule?.status || "scheduled"}
                </span>
              </span>
            </div>

            {/* Scheduled Time */}
            <div className="flex items-start">
              <span className="font-medium text-gray-600 w-32">Scheduled:</span>
              <span className="text-gray-800 flex-1">
                {formatDateTime(schedule?.pushTime || new Date())}
              </span>
            </div>

            {/* Error Message (if exists) */}
            {schedule?.error_message && (
              <div className="flex items-start mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <svg
                  className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <span className="font-semibold text-red-800 block mb-1">
                    Error Details:
                  </span>
                  <span className="text-red-700 text-xs">
                    {schedule.error_message}
                  </span>
                </div>
              </div>
            )}

            {/* Success Message (if completed) */}
            {schedule?.status === "completed" && (
              <div className="flex items-start mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <span className="font-semibold text-green-800 block mb-1">
                    Merge Successful!
                  </span>
                  <span className="text-green-700 text-xs">
                    Branches were merged successfully. Check your repository on
                    GitHub.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Click anywhere on the card to collapse this view
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      <EditScheduleModal
        schedule={schedule}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default RepoCard;
