import React, { useEffect, useState } from "react";
import githubAPI from "../services/github";
import { scheduleAPI } from "../services/api";

const AddRepoForm = ({ onSubmit, isSubmitting = false }) => {
  const [repositories, setRepositories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);

  const [formData, setFormData] = useState({
    sourceBranch: "",
    targetBranch: "",
    pushDate: "",
    pushTime: "",
  });

  const [errors, setErrors] = useState({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [mergePreview, setMergePreview] = useState(null);
  const [previewSelectionKey, setPreviewSelectionKey] = useState("");
  const [previewAcknowledged, setPreviewAcknowledged] = useState(false);

  const buildPreviewSelectionKey = (repo, sourceBranch, targetBranch) => {
    if (!repo || !sourceBranch || !targetBranch) return "";
    return `${repo.owner}/${repo.name}:${sourceBranch}->${targetBranch}`;
  };

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        const repos = await githubAPI.getUserRepositories();
        setRepositories(repos);
      } catch (error) {
        alert("Failed to fetch repositories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepo) {
        setBranches([]);
        setMergePreview(null);
        setPreviewError("");
        setPreviewSelectionKey("");
        setPreviewAcknowledged(false);
        return;
      }

      try {
        setLoadingBranches(true);
        const repoBranches = await githubAPI.getBranches(
          selectedRepo.owner,
          selectedRepo.name,
        );
        setBranches(repoBranches);

        if (selectedRepo.default_branch) {
          setFormData((prev) => ({
            ...prev,
            targetBranch: selectedRepo.default_branch,
            sourceBranch: "pushclock-temp",
          }));
        } else if (repoBranches.length > 0) {
          setFormData((prev) => ({
            ...prev,
            targetBranch: repoBranches[0].name,
            sourceBranch: "pushclock-temp",
          }));
        }
      } catch (error) {
        alert("Failed to fetch branches. Please try again.");
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [selectedRepo]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "sourceBranch" || name === "targetBranch") {
      setMergePreview(null);
      setPreviewError("");
      setPreviewSelectionKey("");
      setPreviewAcknowledged(false);
      setErrors((prev) => ({ ...prev, preview: "" }));
    }
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    setSearchQuery(repo.full_name);
    setErrors((prev) => ({ ...prev, repository: "" }));
    setMergePreview(null);
    setPreviewError("");
    setPreviewSelectionKey("");
    setPreviewAcknowledged(false);
  };

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const validateForm = () => {
    const nextErrors = {};

    if (!selectedRepo) {
      nextErrors.repository = "Please select a repository";
    }

    if (!formData.sourceBranch.trim()) {
      nextErrors.sourceBranch = "Source branch name is required";
    }

    if (!formData.targetBranch.trim()) {
      nextErrors.targetBranch = "Target branch name is required";
    }

    if (!formData.pushDate) {
      nextErrors.pushDate = "Push date is required";
    }

    if (!formData.pushTime) {
      nextErrors.pushTime = "Push time is required";
    }

    const currentSelectionKey = buildPreviewSelectionKey(
      selectedRepo,
      formData.sourceBranch,
      formData.targetBranch,
    );

    if (!mergePreview || previewSelectionKey !== currentSelectionKey) {
      nextErrors.preview =
        "Please run Preview Changes for the current source and target branches before scheduling.";
    } else {
      const filesChanged = mergePreview.summary?.files_changed || 0;
      const commitsCount = mergePreview.total_commits || 0;

      if (
        mergePreview.status === "identical" ||
        filesChanged === 0 ||
        commitsCount === 0
      ) {
        nextErrors.preview =
          "No mergeable changes found for this branch pair. Select a different source/target branch.";
      } else if (!previewAcknowledged) {
        nextErrors.preview = "Please confirm that you reviewed the merge preview.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePreview = async () => {
    const nextErrors = {};

    if (!selectedRepo) {
      nextErrors.repository = "Please select a repository";
    }

    if (!formData.sourceBranch.trim()) {
      nextErrors.sourceBranch = "Source branch name is required";
    }

    if (!formData.targetBranch.trim()) {
      nextErrors.targetBranch = "Target branch name is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewError("");
      setMergePreview(null);

      const response = await scheduleAPI.previewMerge({
        repo_owner: selectedRepo.owner,
        repo_name: selectedRepo.name,
        source_branch: formData.sourceBranch,
        target_branch: formData.targetBranch,
      });

      setMergePreview(response.preview || null);
      setPreviewSelectionKey(
        buildPreviewSelectionKey(
          selectedRepo,
          formData.sourceBranch,
          formData.targetBranch,
        ),
      );
      setPreviewAcknowledged(false);
      setErrors((prev) => ({ ...prev, preview: "" }));
    } catch (error) {
      setPreviewError(error.message || "Failed to preview merge changes");
      setPreviewSelectionKey("");
      setPreviewAcknowledged(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (validateForm()) {
      const pushDateTime = `${formData.pushDate}T${formData.pushTime}:00`;
      const localDate = new Date(pushDateTime);
      const isoDateTime = localDate.toISOString();

      const submitData = {
        github_repo_url: selectedRepo.html_url,
        repo_owner: selectedRepo.owner,
        repo_name: selectedRepo.name,
        source_branch: formData.sourceBranch,
        target_branch: formData.targetBranch,
        pushTime: isoDateTime,
      };

      if (onSubmit) {
        onSubmit(submitData);
      }

      setSelectedRepo(null);
      setSearchQuery("");
      setFormData({
        sourceBranch: "",
        targetBranch: "",
        pushDate: "",
        pushTime: "",
      });
      setBranches([]);
      setMergePreview(null);
      setPreviewError("");
      setPreviewSelectionKey("");
      setPreviewAcknowledged(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      added: "border-emerald-200 bg-emerald-50 text-emerald-700",
      modified: "border-amber-200 bg-amber-50 text-amber-700",
      removed: "border-red-200 bg-red-50 text-red-700",
      renamed: "border-sky-200 bg-sky-50 text-sky-700",
      copied: "border-indigo-200 bg-indigo-50 text-indigo-700",
      changed: "border-slate-200 bg-slate-50 text-slate-700",
    };

    return styles[status] || "border-slate-200 bg-slate-50 text-slate-700";
  };

  const getPreviewStatusStyle = (status) => {
    const styles = {
      ahead: "border-emerald-200 bg-emerald-50 text-emerald-700",
      identical: "border-slate-200 bg-slate-50 text-slate-700",
      diverged: "border-amber-200 bg-amber-50 text-amber-700",
      behind: "border-sky-200 bg-sky-50 text-sky-700",
    };

    return styles[status] || "border-slate-200 bg-slate-50 text-slate-700";
  };

  const currentSelectionKey = buildPreviewSelectionKey(
    selectedRepo,
    formData.sourceBranch,
    formData.targetBranch,
  );

  const hasFreshPreview =
    Boolean(mergePreview) && previewSelectionKey === currentSelectionKey;

  const hasNoMergeableChanges =
    hasFreshPreview &&
    (mergePreview.status === "identical" ||
      (mergePreview.summary?.files_changed || 0) === 0 ||
      (mergePreview.total_commits || 0) === 0);

  const previewGuardBlocked =
    !selectedRepo ||
    !hasFreshPreview ||
    !previewAcknowledged ||
    hasNoMergeableChanges;

  const inputClass = (hasError) =>
    `pc-input ${hasError ? "border-error focus:border-error focus:ring-error/20" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="pc-surface space-y-6 p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text">Schedule Configuration</h2>
          <p className="mt-1 text-sm text-textMuted">
            Choose repository, preview merge impact, and set execution timing.
          </p>
        </div>
        <span className="pc-badge border border-primary/30 bg-primary/10 text-primary">
          Merge-first workflow
        </span>
      </div>

      <section>
        <label htmlFor="repository" className="pc-label">
          GitHub Repository
        </label>

        {loading ? (
          <div className="rounded-xl border border-border bg-bg px-4 py-4 text-sm text-textMuted">
            Loading repositories...
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              id="repository"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                if (
                  selectedRepo &&
                  !event.target.value.includes(selectedRepo.full_name)
                ) {
                  setSelectedRepo(null);
                }
              }}
              placeholder="Search repositories..."
              className={inputClass(errors.repository)}
            />

            {searchQuery && !selectedRepo && filteredRepos.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-white shadow-md pc-scrollbar">
                {filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => handleRepoSelect(repo)}
                    className="w-full border-b border-border px-3 py-3 text-left transition-colors hover:bg-bg last:border-b-0"
                  >
                    <p className="text-sm font-semibold text-text">{repo.full_name}</p>
                    {repo.description && (
                      <p className="mt-1 text-xs text-textMuted">{repo.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedRepo && (
              <div className="mt-2 flex items-start justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-primary-dark">
                    {selectedRepo.full_name}
                  </p>
                  {selectedRepo.description && (
                    <p className="mt-0.5 text-xs text-primary">{selectedRepo.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRepo(null);
                    setSearchQuery("");
                    setBranches([]);
                    setMergePreview(null);
                    setPreviewError("");
                    setPreviewSelectionKey("");
                    setPreviewAcknowledged(false);
                  }}
                  className="pc-icon-btn h-8 w-8"
                  aria-label="Clear repository"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {errors.repository && <p className="mt-2 text-xs text-error">{errors.repository}</p>}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="sourceBranch" className="pc-label">
            Source Branch
          </label>
          <input
            type="text"
            id="sourceBranch"
            name="sourceBranch"
            value={formData.sourceBranch}
            onChange={handleChange}
            placeholder="pushclock-temp"
            className={inputClass(errors.sourceBranch)}
            disabled={!selectedRepo}
          />
          {errors.sourceBranch && (
            <p className="mt-2 text-xs text-error">{errors.sourceBranch}</p>
          )}
          <p className="pc-help">
            Push branch first with <span className="rounded bg-bg px-1 py-0.5 font-mono">git push origin {formData.sourceBranch || "pushclock-temp"}</span>
          </p>
        </div>

        <div>
          <label htmlFor="targetBranch" className="pc-label">
            Target Branch
          </label>

          {loadingBranches ? (
            <div className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-textMuted">
              Loading branches...
            </div>
          ) : branches.length > 0 ? (
            <select
              id="targetBranch"
              name="targetBranch"
              value={formData.targetBranch}
              onChange={handleChange}
              className={`pc-select ${errors.targetBranch ? "border-error" : ""}`}
              disabled={!selectedRepo}
            >
              <option value="">Select branch</option>
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name} {branch.protected ? "(Protected)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="targetBranch"
              name="targetBranch"
              value={formData.targetBranch}
              onChange={handleChange}
              placeholder="main"
              className={inputClass(errors.targetBranch)}
              disabled={!selectedRepo}
            />
          )}

          {errors.targetBranch && (
            <p className="mt-2 text-xs text-error">{errors.targetBranch}</p>
          )}
          <p className="pc-help">Usually main or master.</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-bg p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-text">Merge Preview</h3>
            <p className="mt-1 text-xs text-textMuted">
              Review commits and file-level changes before scheduling.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading || !selectedRepo}
            className="pc-btn pc-btn-secondary"
          >
            {previewLoading ? "Loading..." : "Preview Changes"}
          </button>
        </div>

        {previewError && (
          <p className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
            {previewError}
          </p>
        )}

        {errors.preview && (
          <p className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
            {errors.preview}
          </p>
        )}

        {mergePreview && (
          <div className="mt-4 rounded-xl border border-border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-textMuted">
                {mergePreview.repository} | {mergePreview.from} to {mergePreview.to}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`pc-badge border ${getPreviewStatusStyle(mergePreview.status)}`}
                >
                  {mergePreview.status || "unknown"}
                </span>

                {mergePreview.html_url && (
                  <a
                    href={mergePreview.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-info underline"
                  >
                    Open Full Diff
                  </a>
                )}
              </div>
            </div>

            {mergePreview.status === "diverged" && (
              <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Branches are diverged. Merge may require manual conflict resolution.
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-border bg-bg px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.07em] text-textMuted">Commits</p>
                <p className="mt-1 text-lg font-bold text-text">{mergePreview.total_commits || 0}</p>
              </div>
              <div className="rounded-lg border border-border bg-bg px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.07em] text-textMuted">Files</p>
                <p className="mt-1 text-lg font-bold text-text">
                  {mergePreview.summary?.files_changed || 0}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bg px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.07em] text-textMuted">Additions</p>
                <p className="mt-1 text-lg font-bold text-success">
                  +{mergePreview.summary?.total_additions || 0}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bg px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.07em] text-textMuted">Deletions</p>
                <p className="mt-1 text-lg font-bold text-error">
                  -{mergePreview.summary?.total_deletions || 0}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-textMuted">
                  Commits To Be Merged
                </h4>
                {mergePreview.commits?.length > 0 ? (
                  <div className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1 pc-scrollbar">
                    {mergePreview.commits.slice(0, 10).map((commit) => (
                      <div
                        key={commit.sha}
                        className="rounded-lg border border-border bg-bg px-3 py-2"
                      >
                        <p className="text-sm font-semibold text-text">
                          {commit.short_message || commit.message}
                        </p>
                        <p className="mt-1 text-xs text-textMuted">
                          {commit.sha.substring(0, 7)} | {commit.author}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-textMuted">
                    No commits to merge. Branches may already be synchronized.
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-textMuted">
                  Files Changed
                </h4>
                {mergePreview.files?.length > 0 ? (
                  <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1 pc-scrollbar">
                    {mergePreview.files.slice(0, 12).map((file) => (
                      <div
                        key={file.filename}
                        className="rounded-lg border border-border bg-bg px-3 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="break-all text-xs font-semibold text-text">
                            {file.filename}
                          </p>
                          <span
                            className={`pc-badge border ${getStatusStyle(file.status)}`}
                          >
                            {file.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-textMuted">
                          +{file.additions || 0} / -{file.deletions || 0}
                        </p>

                        {file.patch ? (
                          <pre className="mt-2 max-h-36 overflow-x-auto rounded-lg border border-border bg-white p-2 text-[11px] text-textMuted pc-scrollbar whitespace-pre-wrap break-all">
                            {file.patch.split("\n").slice(0, 10).join("\n")}
                          </pre>
                        ) : (
                          <p className="mt-2 text-[11px] text-textMuted">
                            No textual diff available (binary or large file).
                          </p>
                        )}
                      </div>
                    ))}

                    {mergePreview.files.length > 12 && (
                      <p className="text-[11px] text-textMuted">
                        Showing first 12 files. Open compare URL for the full diff.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-textMuted">
                    No file changes detected for this merge.
                  </p>
                )}
              </div>
            </div>

            <label className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text">
              <input
                type="checkbox"
                checked={previewAcknowledged}
                onChange={(event) => {
                  setPreviewAcknowledged(event.target.checked);
                  if (event.target.checked) {
                    setErrors((prev) => ({ ...prev, preview: "" }));
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-border"
              />
              <span>
                {mergePreview.status === "diverged"
                  ? "I reviewed this preview and understand this merge may need conflict resolution."
                  : "I reviewed this preview and confirm the merge content is correct."}
              </span>
            </label>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="pushDate" className="pc-label">
            Push Date
          </label>
          <input
            type="date"
            id="pushDate"
            name="pushDate"
            value={formData.pushDate}
            onChange={handleChange}
            className={inputClass(errors.pushDate)}
          />
          {errors.pushDate && <p className="mt-2 text-xs text-error">{errors.pushDate}</p>}
        </div>

        <div>
          <label htmlFor="pushTime" className="pc-label">
            Push Time
          </label>
          <input
            type="time"
            id="pushTime"
            name="pushTime"
            value={formData.pushTime}
            onChange={handleChange}
            className={inputClass(errors.pushTime)}
          />
          {errors.pushTime && <p className="mt-2 text-xs text-error">{errors.pushTime}</p>}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || previewLoading || previewGuardBlocked || isSubmitting}
          className="pc-btn pc-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {isSubmitting ? "Scheduling..." : "Schedule Merge"}
        </button>
      </div>
    </form>
  );
};

export default AddRepoForm;
