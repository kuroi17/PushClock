import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { activityLogAPI } from "../services/api";

const ACTION_META = {
  "rollback-success": {
    label: "Rollback Success",
    tone: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  "rollback-failed": {
    label: "Rollback Failed",
    tone: "border-red-200 bg-red-50 text-red-700",
  },
  "create-schedule": {
    label: "Create Schedule",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "update-schedule": {
    label: "Update Schedule",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
  "delete-schedule": {
    label: "Delete Schedule",
    tone: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const ActivityLog = ({ preview = false, limit = null }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityLogAPI.getAll();
      setLogs(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  // Collapsible details state
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const visibleLogs =
    preview && Number.isInteger(limit) ? logs.slice(0, limit) : logs;

  return (
    <section className="pc-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-text">Activity Timeline</h2>
          <p className="text-sm text-textMuted">
            {preview
              ? "Latest scheduling, update, and rollback events."
              : "Recent user actions for scheduling, updates, and rollbacks."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {preview && (
            <Link to="/activity" className="pc-btn pc-btn-secondary">
              View Timeline
            </Link>
          )}
          <button
            type="button"
            className="pc-btn pc-btn-secondary"
            onClick={fetchLogs}
          >
            {preview ? "Refresh" : "Refresh Logs"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="rounded-lg border border-border bg-bg px-4 py-8 text-center text-sm text-textMuted">
          Loading activity logs...
        </p>
      ) : error ? (
        <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : visibleLogs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-bg px-4 py-8 text-center text-sm text-textMuted">
          {preview ? "No recent activity yet." : "No activity logs found."}
        </p>
      ) : (
        <div className="overflow-x-auto pc-scrollbar">
          <table className="min-w-full overflow-hidden rounded-xl border border-border text-sm">
            <thead className="bg-bg text-left text-xs uppercase tracking-[0.08em] text-textMuted">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleLogs.map((log) => {
                const meta = ACTION_META[log.action] || {
                  label: log.action.replace(/-/g, " "),
                  tone: "border-slate-200 bg-slate-50 text-slate-700",
                };

                return (
                  <tr
                    key={log.id}
                    className="border-t border-border bg-white align-top"
                  >
                    <td className="px-4 py-3 text-xs text-textMuted whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`pc-badge border ${meta.tone}`}>
                        {meta.label}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {log.schedule_id ? (
                        <span className="rounded-md bg-bg px-2 py-1 font-mono text-[11px] text-text">
                          {log.schedule_id.slice(0, 8)}...
                          {log.schedule_id.slice(-4)}
                        </span>
                      ) : (
                        <span className="text-xs text-textMuted">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {log.details ? (
                        <div>
                          <button
                            type="button"
                            className="text-xs font-semibold text-primary underline"
                            onClick={() => toggleExpand(log.id)}
                          >
                            {expanded[log.id] ? "Hide details" : "Show details"}
                          </button>
                          {expanded[log.id] && (
                            <pre className="mt-2 max-w-[23rem] overflow-x-auto rounded-lg border border-border bg-bg p-2 text-[11px] text-textMuted pc-scrollbar">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-textMuted">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ActivityLog;
