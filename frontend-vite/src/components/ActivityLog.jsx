import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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

const getActionLabel = (action) =>
  ACTION_META[action]?.label ||
  String(action || "Unknown action").replace(/-/g, " ");

const ActivityLog = ({ preview = false, limit = null }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [actionFilter, setActionFilter] = useState("all");

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isFullPageView = !preview && location.pathname === "/activity";
  const searchQuery = isFullPageView
    ? (searchParams.get("q") || "").trim().toLowerCase()
    : "";

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

  const handleSearchChange = (event) => {
    const nextValue = event.target.value;
    const nextParams = new URLSearchParams(searchParams);

    if (nextValue.trim()) {
      nextParams.set("q", nextValue.trim());
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const actionOptions = useMemo(
    () => [...new Set(logs.map((log) => log.action).filter(Boolean))].sort(),
    [logs],
  );

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const searchableText = [
        getActionLabel(log.action),
        log.action || "",
        log.schedule_id || "",
        JSON.stringify(log.details || {}),
        new Date(log.created_at).toLocaleString(),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchQuery);
    });
  }, [actionFilter, logs, searchQuery]);

  const visibleLogs =
    preview && Number.isInteger(limit)
      ? filteredLogs.slice(0, limit)
      : filteredLogs;

  const emptyMessage = preview
    ? "No recent activity yet."
    : searchQuery || actionFilter !== "all"
      ? "No activity logs matched your current filters."
      : "No activity logs found.";

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

      {isFullPageView && (
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={searchParams.get("q") || ""}
            onChange={handleSearchChange}
            placeholder="Search logs, actions, schedule IDs..."
            className="pc-input"
            aria-label="Search activity logs"
          />

          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="pc-select min-w-[12rem]"
            aria-label="Filter logs by action"
          >
            <option value="all">All Activities</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <p className="rounded-lg border border-border bg-bg px-4 py-8 text-center text-sm text-textMuted">
          Loading activity logs...
        </p>
      )}

      {!loading && error && (
        <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {!loading && !error && visibleLogs.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-bg px-4 py-8 text-center text-sm text-textMuted">
          {emptyMessage}
        </p>
      )}

      {!loading && !error && visibleLogs.length > 0 && (
        <div>
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
                    label: getActionLabel(log.action),
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
                              {expanded[log.id]
                                ? "Hide details"
                                : "Show details"}
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

          {!preview && (
            <p className="mt-3 text-xs text-textMuted">
              Showing {visibleLogs.length} of {logs.length} events.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default ActivityLog;
