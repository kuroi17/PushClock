import React, { useEffect, useState } from "react";
import { activityLogAPI } from "../services/api";

const ACTION_COLORS = {
  "rollback-success": "bg-blue-100 text-blue-800 border-blue-300",
  "rollback-failed": "bg-red-100 text-red-800 border-red-300",
  "create-schedule": "bg-green-100 text-green-800 border-green-300",
  "update-schedule": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "delete-schedule": "bg-red-100 text-red-800 border-red-300",
};

const ACTION_ICONS = {
  "rollback-success": (
    <span title="Rollback" className="mr-1">
      ↩️
    </span>
  ),
  "rollback-failed": (
    <span title="Rollback Failed" className="mr-1">
      ❌
    </span>
  ),
  "create-schedule": (
    <span title="Create" className="mr-1">
      ➕
    </span>
  ),
  "update-schedule": (
    <span title="Update" className="mr-1">
      ✏️
    </span>
  ),
  "delete-schedule": (
    <span title="Delete" className="mr-1">
      🗑️
    </span>
  ),
};

const ActivityLog = () => {
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

  return (
    <div className="bg-bgSecondary rounded-xl shadow-md p-6 mt-8 border border-border">
      <h2 className="text-xl font-bold text-text mb-4">User Activity Log</h2>
      {loading ? (
        <p className="text-textMuted">Loading activity logs...</p>
      ) : error ? (
        <p className="text-error">{error}</p>
      ) : logs.length === 0 ? (
        <p className="text-textMuted">No activity logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-bg border-b border-border">
                <th className="px-4 py-2 text-left text-textMuted">Time</th>
                <th className="px-4 py-2 text-left text-textMuted">Action</th>
                <th className="px-4 py-2 text-left text-textMuted">Schedule</th>
                <th className="px-4 py-2 text-left text-textMuted">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr
                  key={log.id}
                  className={
                    idx % 2 === 0
                      ? "bg-bgSecondary border-t border-border"
                      : "bg-bg border-t border-border"
                  }
                >
                  {/* Time */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  {/* Action with badge and icon */}
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${
                        ACTION_COLORS[log.action] ||
                        "bg-bg border border-border text-textMuted"
                      }`}
                      aria-label={`Action: ${log.action}`}
                    >
                      {ACTION_ICONS[log.action] || null}
                      {log.action.replace(/-/g, " ")}
                    </span>
                  </td>
                  {/* Schedule ID with ellipsis and tooltip */}
                  <td
                    className="px-4 py-2 max-w-[10rem] truncate"
                    title={log.schedule_id || "-"}
                  >
                    {log.schedule_id ? (
                      <span className="font-mono text-xs">
                        {log.schedule_id.slice(0, 8)}...
                        {log.schedule_id.slice(-4)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  {/* Collapsible Details */}
                  <td className="px-4 py-2">
                    {log.details ? (
                      <div>
                        <button
                          className="text-primary underline text-xs mb-1"
                          onClick={() => toggleExpand(log.id)}
                        >
                          {expanded[log.id] ? "Hide details" : "Show details"}
                        </button>
                        {expanded[log.id] && (
                          <pre className="bg-bg rounded p-2 overflow-x-auto max-w-xs text-xs font-mono border border-border mt-1 text-textMuted">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
