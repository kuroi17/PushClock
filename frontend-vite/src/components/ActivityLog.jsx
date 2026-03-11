import React, { useEffect, useState } from "react";
import { activityLogAPI } from "../services/api";

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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">User Activity Log</h2>
      {loading ? (
        <p>Loading activity logs...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : logs.length === 0 ? (
        <p>No activity logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Schedule</th>
                <th className="px-4 py-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{log.action}</td>
                  <td className="px-4 py-2">{log.schedule_id || "-"}</td>
                  <td className="px-4 py-2">
                    <pre className="bg-gray-50 rounded p-2 overflow-x-auto max-w-xs">
                      {log.details ? JSON.stringify(log.details, null, 2) : "-"}
                    </pre>
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
