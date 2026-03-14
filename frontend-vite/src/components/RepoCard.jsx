import React, { useState } from "react";
import { scheduleAPI } from "../services/api";
import EditScheduleModal from "./EditScheduleModal";

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "rollback-completed": "border-cyan-200 bg-cyan-50 text-cyan-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  error: "border-red-200 bg-red-50 text-red-700",
  scheduled: "border-sky-200 bg-sky-50 text-sky-700",
  active: "border-violet-200 bg-violet-50 text-violet-700",
  paused: "border-slate-200 bg-slate-50 text-slate-700",
};

const detailStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  rollback: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

const RepoCard = ({ schedule, onDelete, onUpdate }) => {
  const [toggling, setToggling] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rollbacking, setRollbacking] = useState(false);
  const [rollbackResult, setRollbackResult] = useState(null);

  const displayName =
    schedule?.repo_owner && schedule?.repo_name
      ? `${schedule.repo_owner}/${schedule.repo_name}`
      : schedule?.repo_path || "/path/to/repository";

  const persistedRollbackCommitUrl =
    schedule?.github_repo_url && schedule?.revert_commit_sha
      ? `${schedule.github_repo_url}/commit/${schedule.revert_commit_sha}`
      : null;

  const formatDateTime = (dateTime) =>
    new Date(dateTime).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleRollback = async (event) => {
    event.stopPropagation();

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
      setRollbackResult({
        success: true,
        message: result.message,
        revertCommitSha: result.revert_commit_sha || null,
        revertCommitUrl: result.revert_commit_url || null,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      setRollbackResult({
        success: false,
        message: error.message,
      });
    } finally {
      setRollbacking(false);
    }
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      if (onDelete) onDelete(schedule.id);
    }
  };

  const handleToggleStatus = async (event) => {
    event.stopPropagation();

    try {
      setToggling(true);
      const result = await scheduleAPI.toggleStatus(schedule.id);
      if (result.success && onUpdate) onUpdate();
    } catch (error) {
      alert(`Failed to toggle status: ${error.message}`);
    } finally {
      setToggling(false);
    }
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    setIsEditModalOpen(true);
  };

  const statusClass =
    statusStyles[schedule?.status] || "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <article
      className="pc-surface cursor-pointer p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      tabIndex={0}
      role="group"
      aria-label={`Schedule card for ${displayName}`}
      onClick={() => setIsExpanded((prev) => !prev)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsExpanded((prev) => !prev);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7H8m8 5H8m8 5H8M4 7h.01M4 12h.01M4 17h.01"
                />
              </svg>
            </span>

            <h3 className="truncate text-sm font-bold text-text">
              {schedule?.github_repo_url ? (
                <a
                  href={schedule.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                  onClick={(event) => event.stopPropagation()}
                >
                  {displayName}
                </a>
              ) : (
                displayName
              )}
            </h3>
          </div>

          <p className="mt-2 text-xs text-textMuted">
            <span className="font-semibold text-primary">
              {schedule?.source_branch || "pushclock-temp"}
            </span>
            <span className="mx-1">to</span>
            <span className="font-semibold text-success">
              {schedule?.target_branch || "main"}
            </span>
          </p>
        </div>

        <span className={`pc-badge border ${statusClass}`}>
          {schedule?.status || "scheduled"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg px-3 py-2.5">
        <p className="text-xs font-medium text-textMuted">
          {formatDateTime(schedule?.pushTime || new Date())}
        </p>

        <div className="flex items-center gap-1.5">
          {schedule?.status === "completed" && schedule?.merge_commit_sha && (
            <button
              type="button"
              onClick={handleRollback}
              disabled={rollbacking}
              className="pc-icon-btn text-warning"
              title="Rollback merge"
            >
              {rollbacking ? (
                <svg
                  className="h-4 w-4 animate-spin"
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
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 010 8h-1"
                  />
                </svg>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={toggling}
            className="pc-icon-btn"
            title={
              schedule?.status === "paused"
                ? "Resume schedule"
                : "Pause schedule"
            }
          >
            {toggling ? (
              <svg
                className="h-4 w-4 animate-spin"
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
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : schedule?.status === "paused" ? (
              <svg
                className="h-4 w-4 text-success"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.5-4.5l5-3.5-5-3.5v7z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-warning"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 4a1 1 0 00-1 1v10a1 1 0 102 0V5a1 1 0 00-1-1zm10 0a1 1 0 00-1 1v10a1 1 0 102 0V5a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleEdit}
            className="pc-icon-btn text-info"
            title="Edit schedule"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-2.1-7.9l2 2L11 15H9v-2l7.9-7.9z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="pc-icon-btn text-error"
            title="Delete schedule"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
              />
            </svg>
          </button>
        </div>
      </div>

      {rollbackResult && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-xs ${rollbackResult.success ? detailStyles.success : detailStyles.error}`}
        >
          <p>{rollbackResult.message}</p>
          {rollbackResult.success && rollbackResult.revertCommitSha && (
            <p className="mt-1 font-semibold">
              Revert commit: {rollbackResult.revertCommitSha.substring(0, 7)}
            </p>
          )}
          {rollbackResult.success && rollbackResult.revertCommitUrl && (
            <a
              href={rollbackResult.revertCommitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold underline"
              onClick={(event) => event.stopPropagation()}
            >
              Open Revert Commit on GitHub
            </a>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="mt-4 space-y-3 rounded-xl border border-border bg-bg p-3 animate-enter">
          <div className="grid gap-2 text-xs text-text sm:grid-cols-2">
            <p>
              <span className="font-semibold text-textMuted">Repository: </span>
              {schedule?.github_repo_url ? (
                <a
                  href={schedule.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-info underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  {schedule.github_repo_url}
                </a>
              ) : (
                "N/A"
              )}
            </p>
            <p>
              <span className="font-semibold text-textMuted">
                Source branch:{" "}
              </span>
              {schedule?.source_branch || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-textMuted">
                Target branch:{" "}
              </span>
              {schedule?.target_branch || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-textMuted">
                Scheduled at:{" "}
              </span>
              {formatDateTime(schedule?.pushTime || new Date())}
            </p>
          </div>

          {schedule?.error_message && (
            <div
              className={`rounded-lg border px-3 py-2 text-xs ${detailStyles.error}`}
            >
              <p className="font-semibold">Error Details</p>
              <p className="mt-1">{schedule.error_message}</p>
            </div>
          )}

          {schedule?.status === "completed" && (
            <div
              className={`rounded-lg border px-3 py-2 text-xs ${detailStyles.success}`}
            >
              <p className="font-semibold">Merge Successful</p>
              <p className="mt-1">
                Branches were merged successfully in GitHub.
              </p>
            </div>
          )}

          {schedule?.status === "rollback-completed" && (
            <div
              className={`rounded-lg border px-3 py-2 text-xs ${detailStyles.rollback}`}
            >
              <p className="font-semibold">Rollback Completed</p>
              <p className="mt-1">Merge changes were reverted successfully.</p>
              {schedule?.revert_commit_sha && (
                <p className="mt-1 font-semibold">
                  SHA: {schedule.revert_commit_sha.substring(0, 7)}
                </p>
              )}
              {persistedRollbackCommitUrl && (
                <a
                  href={persistedRollbackCommitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-semibold underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Open Revert Commit on GitHub
                </a>
              )}
            </div>
          )}

          <p className="text-[11px] font-medium text-textMuted">
            Tip: click the card again to collapse details.
          </p>
        </div>
      )}

      <EditScheduleModal
        schedule={schedule}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={onUpdate}
      />
    </article>
  );
};

export default RepoCard;
