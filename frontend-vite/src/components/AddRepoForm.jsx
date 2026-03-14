import React, { useState, useEffect } from "react";
import githubAPI from "../services/github";
import { scheduleAPI } from "../services/api";

const AddRepoForm = ({ onSubmit }) => {
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

  // Fetch user's repositories on mount
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        const repos = await githubAPI.getUserRepositories();
        setRepositories(repos);
      } catch (error) {
        console.error("Error fetching repositories:", error);
        alert("Failed to fetch repositories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  // Fetch branches when a repository is selected
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

        // Auto-select target branch (usually main/master)
        if (selectedRepo.default_branch) {
          setFormData((prev) => ({
            ...prev,
            targetBranch: selectedRepo.default_branch,
            sourceBranch: "pushclock-temp", // Default source branch
          }));
        } else if (repoBranches.length > 0) {
          setFormData((prev) => ({
            ...prev,
            targetBranch: repoBranches[0].name,
            sourceBranch: "pushclock-temp",
          }));
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        alert("Failed to fetch branches. Please try again.");
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [selectedRepo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
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
    const newErrors = {};

    if (!selectedRepo) {
      newErrors.repository = "Please select a repository";
    }

    if (!formData.sourceBranch.trim()) {
      newErrors.sourceBranch = "Source branch name is required";
    }

    if (!formData.targetBranch.trim()) {
      newErrors.targetBranch = "Target branch name is required";
    }

    if (!formData.pushDate) {
      newErrors.pushDate = "Push date is required";
    }

    if (!formData.pushTime) {
      newErrors.pushTime = "Push time is required";
    }

    const currentSelectionKey = buildPreviewSelectionKey(
      selectedRepo,
      formData.sourceBranch,
      formData.targetBranch,
    );

    if (!mergePreview || previewSelectionKey !== currentSelectionKey) {
      newErrors.preview =
        "Please run Preview Changes for the current source and target branches before scheduling.";
    } else {
      const filesChanged = mergePreview.summary?.files_changed || 0;
      const commitsCount = mergePreview.total_commits || 0;

      if (
        mergePreview.status === "identical" ||
        filesChanged === 0 ||
        commitsCount === 0
      ) {
        newErrors.preview =
          "No mergeable changes found for this branch pair. Select a different source/target branch.";
      } else if (!previewAcknowledged) {
        newErrors.preview =
          "Please confirm that you reviewed the merge preview.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = async () => {
    const newErrors = {};

    if (!selectedRepo) {
      newErrors.repository = "Please select a repository";
    }

    if (!formData.sourceBranch.trim()) {
      newErrors.sourceBranch = "Source branch name is required";
    }

    if (!formData.targetBranch.trim()) {
      newErrors.targetBranch = "Target branch name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Convert local datetime to ISO string (UTC)
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

      // Reset form
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
      added: "bg-green-100 text-green-700 border-green-300",
      modified: "bg-yellow-100 text-yellow-800 border-yellow-300",
      removed: "bg-red-100 text-red-700 border-red-300",
      renamed: "bg-blue-100 text-blue-700 border-blue-300",
      copied: "bg-indigo-100 text-indigo-700 border-indigo-300",
      changed: "bg-gray-100 text-gray-700 border-gray-300",
    };

    return styles[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getPreviewStatusStyle = (status) => {
    const styles = {
      ahead: "bg-green-100 text-green-700 border-green-300",
      identical: "bg-gray-100 text-gray-700 border-gray-300",
      diverged: "bg-orange-100 text-orange-800 border-orange-300",
      behind: "bg-blue-100 text-blue-700 border-blue-300",
    };

    return styles[status] || "bg-gray-100 text-gray-700 border-gray-300";
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bgSecondary rounded-xl shadow-md p-8 max-w-2xl mx-auto border border-border"
    >
      <h2 className="text-2xl font-bold text-text mb-6 flex items-center">
        <svg
          className="w-7 h-7 mr-2 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Schedule New Push
      </h2>

      {/* Repository Selection */}
      <div className="mb-6">
        <label
          htmlFor="repository"
          className="block text-sm font-semibold text-text mb-2"
        >
          GitHub Repository
        </label>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-textMuted">Loading repositories...</span>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              id="repository"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (
                  selectedRepo &&
                  !e.target.value.includes(selectedRepo.full_name)
                ) {
                  setSelectedRepo(null);
                }
              }}
              placeholder="Search your repositories..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
                errors.repository ? "border-error" : "border-border"
              }`}
            />

            {/* Repository Dropdown */}
            {searchQuery && !selectedRepo && filteredRepos.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-bgSecondary border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => handleRepoSelect(repo)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-text">
                          {repo.full_name}
                        </p>
                        {repo.description && (
                          <p className="text-sm text-textMuted mt-1">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      {repo.private && (
                        <span className="ml-2 px-2 py-1 text-xs bg-warning/10 text-warning rounded">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Repository Display */}
            {selectedRepo && (
              <div className="mt-2 p-3 bg-primary/10 border border-primary rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary-dark">
                    {selectedRepo.full_name}
                  </p>
                  {selectedRepo.description && (
                    <p className="text-sm text-primary mt-1">
                      {selectedRepo.description}
                    </p>
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
                  className="ml-2 text-primary hover:text-primary-dark"
                  aria-label="Remove selected repository"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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
        {errors.repository && (
          <p className="mt-2 text-sm text-error flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.repository}
          </p>
        )}
      </div>

      {/* Branch Selection */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Branch */}
        <div>
          <label
            htmlFor="sourceBranch"
            className="block text-sm font-semibold text-text mb-2"
          >
            Source Branch (FROM)
            <span className="text-textMuted text-xs ml-2">
              Where your commits are
            </span>
          </label>
          <input
            type="text"
            id="sourceBranch"
            name="sourceBranch"
            value={formData.sourceBranch}
            onChange={handleChange}
            placeholder="e.g., pushclock-temp"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
              errors.sourceBranch ? "border-error" : "border-border"
            }`}
            disabled={!selectedRepo}
          />
          {errors.sourceBranch && (
            <p className="mt-2 text-sm text-error flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.sourceBranch}
            </p>
          )}
          <p className="mt-1 text-xs text-textMuted">
            Push your commits here first:{" "}
            <code className="bg-bg px-1 rounded">
              git push origin {formData.sourceBranch || "pushclock-temp"}
            </code>
          </p>
        </div>

        {/* Target Branch */}
        <div>
          <label
            htmlFor="targetBranch"
            className="block text-sm font-semibold text-text mb-2"
          >
            Target Branch (TO)
            <span className="text-textMuted text-xs ml-2">
              Where commits will be merged
            </span>
          </label>
          {loadingBranches ? (
            <div className="flex items-center py-3 px-4 border border-border rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="ml-3 text-textMuted">Loading branches...</span>
            </div>
          ) : branches.length > 0 ? (
            <select
              id="targetBranch"
              name="targetBranch"
              value={formData.targetBranch}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
                errors.targetBranch ? "border-error" : "border-border"
              }`}
              disabled={!selectedRepo}
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name} {branch.protected && "(Protected)"}
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
              placeholder="e.g., main"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
                errors.targetBranch ? "border-error" : "border-border"
              }`}
              disabled={!selectedRepo}
            />
          )}
          {errors.targetBranch && (
            <p className="mt-2 text-sm text-error flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.targetBranch}
            </p>
          )}
          <p className="mt-1 text-xs text-textMuted">
            Usually <code className="bg-bg px-1 rounded">main</code> or{" "}
            <code className="bg-bg px-1 rounded">master</code>
          </p>
        </div>
      </div>

      {/* Merge Preview */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-semibold text-text">Merge Preview</h3>
            <p className="text-sm text-textMuted">
              Review commits and file diffs before scheduling the merge.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading || !selectedRepo}
            className="px-4 py-2 bg-info text-white rounded-lg hover:bg-info/90 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {previewLoading ? "Loading preview..." : "Preview Changes"}
          </button>
        </div>

        {previewError && (
          <div className="mb-3 p-3 rounded-lg border border-error/30 bg-error/10 text-error text-sm">
            {previewError}
          </div>
        )}

        {errors.preview && (
          <div className="mb-3 p-3 rounded-lg border border-error/30 bg-error/10 text-error text-sm">
            {errors.preview}
          </div>
        )}

        {mergePreview && (
          <div className="rounded-xl border border-border bg-bg p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-textMuted">
                {mergePreview.repository} | {mergePreview.from} to{" "}
                {mergePreview.to}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold border ${getPreviewStatusStyle(mergePreview.status)}`}
                >
                  {mergePreview.status || "unknown"}
                </span>
                {mergePreview.html_url && (
                  <a
                    href={mergePreview.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold underline text-info"
                  >
                    Open Full Diff on GitHub
                  </a>
                )}
              </div>
            </div>

            {mergePreview.status === "diverged" && (
              <div className="mb-4 p-3 rounded-lg border border-orange-300 bg-orange-50 text-orange-900 text-sm">
                Branches are diverged. Auto-merge may fail with conflicts unless
                history is reconciled first.
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg border border-border bg-bgSecondary p-3">
                <p className="text-xs text-textMuted">Commits</p>
                <p className="text-lg font-bold text-text">
                  {mergePreview.total_commits || 0}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bgSecondary p-3">
                <p className="text-xs text-textMuted">Files Changed</p>
                <p className="text-lg font-bold text-text">
                  {mergePreview.summary?.files_changed || 0}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bgSecondary p-3">
                <p className="text-xs text-textMuted">Additions</p>
                <p className="text-lg font-bold text-success">
                  +{mergePreview.summary?.total_additions || 0}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bgSecondary p-3">
                <p className="text-xs text-textMuted">Deletions</p>
                <p className="text-lg font-bold text-error">
                  -{mergePreview.summary?.total_deletions || 0}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-text mb-2">
                Commits To Be Merged
              </h4>
              {mergePreview.commits?.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {mergePreview.commits.slice(0, 10).map((commit) => (
                    <div
                      key={commit.sha}
                      className="rounded-md border border-border bg-bgSecondary p-3"
                    >
                      <p className="text-sm font-medium text-text">
                        {commit.short_message || commit.message}
                      </p>
                      <p className="text-xs text-textMuted mt-1">
                        {commit.sha.substring(0, 7)} | {commit.author}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-textMuted">
                  No commits to merge. Branches may already be synchronized.
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text mb-2">
                Files Changed
              </h4>
              {mergePreview.files?.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {mergePreview.files.slice(0, 12).map((file) => (
                    <div
                      key={file.filename}
                      className="rounded-md border border-border bg-bgSecondary p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-text break-all">
                          {file.filename}
                        </p>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded border ${getStatusStyle(file.status)}`}
                        >
                          {file.status}
                        </span>
                      </div>
                      <p className="text-xs text-textMuted mt-1">
                        +{file.additions || 0} / -{file.deletions || 0}
                      </p>

                      {file.patch ? (
                        <pre className="mt-2 text-xs text-text bg-bg rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                          {file.patch.split("\n").slice(0, 10).join("\n")}
                        </pre>
                      ) : (
                        <p className="mt-2 text-xs text-textMuted">
                          No textual diff available (binary or large file).
                        </p>
                      )}
                    </div>
                  ))}

                  {mergePreview.files.length > 12 && (
                    <p className="text-xs text-textMuted">
                      Showing first 12 files. Open compare URL in GitHub for
                      full diff.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-textMuted">
                  No file changes detected for this merge.
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <label className="flex items-start gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={previewAcknowledged}
                  onChange={(e) => {
                    setPreviewAcknowledged(e.target.checked);
                    if (e.target.checked) {
                      setErrors((prev) => ({ ...prev, preview: "" }));
                    }
                  }}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>
                  {mergePreview.status === "diverged"
                    ? "I reviewed this preview and understand this merge may require manual conflict resolution."
                    : "I reviewed this preview and confirm the merge content is correct."}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label
            htmlFor="pushDate"
            className="block text-sm font-semibold text-text mb-2"
          >
            Push Date
          </label>
          <input
            type="date"
            id="pushDate"
            name="pushDate"
            value={formData.pushDate}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
              errors.pushDate ? "border-error" : "border-border"
            }`}
          />
          {errors.pushDate && (
            <p className="mt-2 text-sm text-error">{errors.pushDate}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="pushTime"
            className="block text-sm font-semibold text-text mb-2"
          >
            Push Time
          </label>
          <input
            type="time"
            id="pushTime"
            name="pushTime"
            value={formData.pushTime}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
              errors.pushTime ? "border-error" : "border-border"
            }`}
          />
          {errors.pushTime && (
            <p className="mt-2 text-sm text-error">{errors.pushTime}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || previewLoading || previewGuardBlocked}
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Schedule Push
        </button>
      </div>
    </form>
  );
};

export default AddRepoForm;
