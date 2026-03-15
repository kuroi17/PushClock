import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import RepoCard from "../components/RepoCard";
import Notification from "../components/Notification";
import { scheduleAPI } from "../services/api";
import ActivityLog from "../components/ActivityLog";

const Dashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Fetch schedules from backend API
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await scheduleAPI.getAll();

      if (response.success) {
        const mappedSchedules = response.data.map((schedule) => ({
          id: schedule.id,
          repoPath: schedule.repo_path,
          repo_owner: schedule.repo_owner,
          repo_name: schedule.repo_name,
          github_repo_url: schedule.github_repo_url,
          source_branch: schedule.source_branch,
          target_branch: schedule.target_branch,
          pushTime: schedule.push_time,
          status: schedule.status,
          error_message: schedule.error_message,
          merge_commit_sha: schedule.merge_commit_sha, // <-- ensure this is mapped
          revert_commit_sha: schedule.revert_commit_sha,
        }));
        setSchedules(mappedSchedules);
      }
    } catch (error) {
      showNotification("error", "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const handleDelete = async (id) => {
    try {
      const response = await scheduleAPI.delete(id);

      if (response.success) {
        setSchedules(schedules.filter((schedule) => schedule.id !== id));
        showNotification("success", "Schedule deleted successfully");
      }
    } catch (error) {
      showNotification("error", "Failed to delete schedule");
    }
  };

  const statusCounts = schedules.reduce(
    (acc, schedule) => {
      const currentStatus = schedule.status || "scheduled";
      acc[currentStatus] = (acc[currentStatus] || 0) + 1;
      return acc;
    },
    {
      scheduled: 0,
      active: 0,
      pending: 0,
      completed: 0,
      "rollback-completed": 0,
      failed: 0,
      error: 0,
      paused: 0,
    },
  );

  const activeSchedules =
    statusCounts.scheduled + statusCounts.active + statusCounts.pending;
  const completedSchedules =
    statusCounts.completed + statusCounts["rollback-completed"];
  const failedSchedules = statusCounts.failed + statusCounts.error;

  const upcomingSchedules = [...schedules]
    .filter((schedule) => schedule.pushTime)
    .sort(
      (a, b) => new Date(a.pushTime).getTime() - new Date(b.pushTime).getTime(),
    );

  const nextUpcoming = upcomingSchedules.find(
    (schedule) => new Date(schedule.pushTime).getTime() > Date.now(),
  );

  const getCountdown = (dateTime) => {
    if (!dateTime) {
      return { days: "00", hours: "00", minutes: "00" };
    }

    const diff = Math.max(new Date(dateTime).getTime() - Date.now(), 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return {
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
    };
  };

  const countdown = getCountdown(nextUpcoming?.pushTime);

  const healthRows = [
    {
      label: "Stable Schedules",
      value: activeSchedules + completedSchedules,
      tone: "text-success bg-green-50 border-green-200",
    },
    {
      label: "Paused Schedules",
      value: statusCounts.paused,
      tone: "text-warning bg-amber-50 border-amber-200",
    },
    {
      label: "Failed Schedules",
      value: failedSchedules,
      tone: "text-error bg-red-50 border-red-200",
    },
  ];

  const metrics = [
    {
      label: "Total Schedules",
      value: schedules.length,
      delta: `${activeSchedules > 0 ? "+" : ""}${activeSchedules} active`,
    },
    {
      label: "Pending Merges",
      value: statusCounts.pending,
      delta: `${statusCounts.scheduled} scheduled`,
    },
    {
      label: "Completed",
      value: completedSchedules,
      delta: `${statusCounts["rollback-completed"]} rolled back`,
    },
    {
      label: "Risk Alerts",
      value: failedSchedules,
      delta: failedSchedules === 0 ? "All healthy" : "Needs review",
    },
  ];

  const formatCompactDate = (value) => {
    if (!value) return "Not scheduled";
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Navbar
      title="Merge Operations Overview"
      subtitle="Manage schedules, track branch health, and keep rollback actions transparent."
    >
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="pc-surface pc-kpi">
            <p className="pc-kpi-label">{metric.label}</p>
            <p className="pc-kpi-value">{metric.value}</p>
            <span className="pc-kpi-delta">{metric.delta}</span>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.9fr_1fr] gap-5 items-start">
        <div className="space-y-5 min-w-0">
          <div className="pc-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-text">
                  Upcoming Schedules
                </h2>
                <p className="text-sm text-textMuted">
                  Monitor active pipelines and rollback-ready merge jobs.
                </p>
              </div>
              <Link to="/add" className="pc-btn pc-btn-secondary">
                Create Schedule
              </Link>
            </div>

            {loading ? (
              <div className="rounded-xl border border-border bg-bg py-14 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-4 text-sm text-textMuted">
                  Loading schedules...
                </p>
              </div>
            ) : schedules.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                {schedules.map((schedule) => (
                  <RepoCard
                    key={schedule.id}
                    schedule={schedule}
                    onDelete={handleDelete}
                    onUpdate={fetchSchedules}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-bg px-6 py-14 text-center">
                <h3 className="text-lg font-semibold text-text">
                  No schedules yet
                </h3>
                <p className="mt-1 text-sm text-textMuted">
                  Start with one merge schedule, then scale your automation
                  workflow.
                </p>
                <Link to="/add" className="pc-btn pc-btn-primary mt-5">
                  Schedule Your First Merge
                </Link>
              </div>
            )}
          </div>

          <ActivityLog preview limit={5} />
        </div>

        <aside className="space-y-5">
          <div className="pc-surface overflow-hidden">
            <div className="bg-gradient-to-br from-primary-dark via-primary to-secondary p-5 text-white">
              <p className="text-xs uppercase tracking-[0.1em] text-white/80">
                Next Production Release
              </p>
              <p className="mt-2 text-sm text-white/85">
                {nextUpcoming
                  ? `${nextUpcoming.repo_owner}/${nextUpcoming.repo_name}`
                  : "No upcoming release queued"}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Mins", value: countdown.minutes },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg bg-white/15 px-2 py-3"
                  >
                    <p className="text-2xl font-bold leading-none">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.08em] text-white/80">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 rounded-lg bg-white/20 px-3 py-2 text-xs font-medium text-white/95">
                {nextUpcoming
                  ? `Scheduled: ${formatCompactDate(nextUpcoming.pushTime)}`
                  : "Plan your next release by adding a schedule."}
              </p>
            </div>
          </div>

          <div className="pc-surface p-5">
            <h3 className="text-lg font-bold text-text">Branch Health</h3>
            <p className="mt-1 text-sm text-textMuted">
              Snapshot of pipeline readiness and risk signals.
            </p>
            <div className="mt-4 space-y-3">
              {healthRows.map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${row.tone}`}
                >
                  <span className="text-sm font-semibold">{row.label}</span>
                  <span className="text-base font-bold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </Navbar>
  );
};

export default Dashboard;
