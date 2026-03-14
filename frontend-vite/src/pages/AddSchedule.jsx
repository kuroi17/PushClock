import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AddRepoForm from "../components/AddRepoForm";
import Notification from "../components/Notification";
import { scheduleAPI } from "../services/api";

const AddSchedule = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      // formData now contains: github_repo_url, repo_owner, repo_name, source_branch, target_branch, pushTime
      const scheduleData = {
        github_repo_url: formData.github_repo_url,
        repo_owner: formData.repo_owner,
        repo_name: formData.repo_name,
        source_branch: formData.source_branch,
        target_branch: formData.target_branch,
        push_time: formData.pushTime,
      };

      const response = await scheduleAPI.create(scheduleData);

      if (response.success) {
        setNotification({
          show: true,
          type: "success",
          message: `Merge scheduled successfully for ${formData.repo_owner}/${formData.repo_name} (${formData.source_branch} → ${formData.target_branch})`,
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to schedule push. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Navbar
      title="Create Merge Schedule"
      subtitle="Configure branch routing, preview diffs, and queue execution safely."
    >
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-5 items-start">
        <div className="space-y-5 min-w-0">
          <div className="pc-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-text">
                  Scheduling Workflow
                </h2>
                <p className="text-sm text-textMuted">
                  Follow each step to reduce failed merges and accidental branch
                  drift.
                </p>
              </div>
              {isSubmitting && (
                <span className="pc-badge border border-info/40 bg-info/10 text-info">
                  Saving...
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Select Repository",
                  text: "Pick the source repo and branch pair to merge.",
                },
                {
                  step: "02",
                  title: "Preview Changes",
                  text: "Review commit and file diffs before scheduling.",
                },
                {
                  step: "03",
                  title: "Set Execution",
                  text: "Choose date/time and confirm merge intent.",
                },
              ].map((item) => (
                <article
                  key={item.step}
                  className="rounded-xl border border-border bg-bg px-4 py-3"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
                    Step {item.step}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-text">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-textMuted">{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          <AddRepoForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        <aside className="space-y-5">
          <div className="pc-surface p-5">
            <h3 className="text-lg font-bold text-text">Best Practices</h3>
            <ul className="mt-3 space-y-2 text-sm text-textMuted">
              <li className="rounded-lg border border-border bg-bg px-3 py-2">
                Always preview merge content before scheduling.
              </li>
              <li className="rounded-lg border border-border bg-bg px-3 py-2">
                Keep source branches updated with remote before submit.
              </li>
              <li className="rounded-lg border border-border bg-bg px-3 py-2">
                Set schedules during off-peak deployment windows.
              </li>
              <li className="rounded-lg border border-border bg-bg px-3 py-2">
                Use rollback only when merge commit is still at branch head.
              </li>
            </ul>
          </div>

          <div className="pc-surface p-5 bg-gradient-to-br from-primary-dark to-primary text-white">
            <h3 className="text-lg font-bold text-white">
              Execution Checklist
            </h3>
            <p className="mt-1 text-sm text-white/80">
              Confirm these before submitting the schedule.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/90">
              <li>Source branch exists and has ready commits.</li>
              <li>Target branch aligns with release policy.</li>
              <li>Preview was acknowledged and reviewed.</li>
              <li>Scheduled time matches team timezone.</li>
            </ul>
          </div>
        </aside>
      </section>
    </Navbar>
  );
};

export default AddSchedule;
