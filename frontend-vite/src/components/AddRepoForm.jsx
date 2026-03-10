import React, { useState, useEffect } from "react";
import githubAPI from "../services/github";

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
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    setSearchQuery(repo.full_name);
    setErrors((prev) => ({ ...prev, repository: "" }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const pushDateTime = `${formData.pushDate}T${formData.pushTime}:00`;
      const submitData = {
        github_repo_url: selectedRepo.html_url,
        repo_owner: selectedRepo.owner,
        repo_name: selectedRepo.name,
        source_branch: formData.sourceBranch,
        target_branch: formData.targetBranch,
        pushTime: pushDateTime,
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
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <svg
          className="w-7 h-7 mr-2 text-blue-600"
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
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          GitHub Repository
        </label>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading repositories...</span>
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.repository ? "border-red-500" : "border-gray-300"
              }`}
            />

            {/* Repository Dropdown */}
            {searchQuery && !selectedRepo && filteredRepos.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => handleRepoSelect(repo)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {repo.full_name}
                        </p>
                        {repo.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      {repo.private && (
                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
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
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">
                    {selectedRepo.full_name}
                  </p>
                  {selectedRepo.description && (
                    <p className="text-sm text-blue-700 mt-1">
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
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
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
          <p className="mt-2 text-sm text-red-600 flex items-center">
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
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Source Branch (FROM)
            <span className="text-gray-500 text-xs ml-2">
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.sourceBranch ? "border-red-500" : "border-gray-300"
            }`}
            disabled={!selectedRepo}
          />
          {errors.sourceBranch && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
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
          <p className="mt-1 text-xs text-gray-500">
            Push your commits here first:{" "}
            <code className="bg-gray-100 px-1 rounded">
              git push origin {formData.sourceBranch || "pushclock-temp"}
            </code>
          </p>
        </div>

        {/* Target Branch */}
        <div>
          <label
            htmlFor="targetBranch"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Target Branch (TO)
            <span className="text-gray-500 text-xs ml-2">
              Where commits will be merged
            </span>
          </label>
          {loadingBranches ? (
            <div className="flex items-center py-3 px-4 border border-gray-300 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading branches...</span>
            </div>
          ) : branches.length > 0 ? (
            <select
              id="targetBranch"
              name="targetBranch"
              value={formData.targetBranch}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.targetBranch ? "border-red-500" : "border-gray-300"
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.targetBranch ? "border-red-500" : "border-gray-300"
              }`}
              disabled={!selectedRepo}
            />
          )}
          {errors.targetBranch && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
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
          <p className="mt-1 text-xs text-gray-500">
            Usually <code className="bg-gray-100 px-1 rounded">main</code> or{" "}
            <code className="bg-gray-100 px-1 rounded">master</code>
          </p>
        </div>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label
            htmlFor="pushDate"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Push Date
          </label>
          <input
            type="date"
            id="pushDate"
            name="pushDate"
            value={formData.pushDate}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.pushDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.pushDate && (
            <p className="mt-2 text-sm text-red-600">{errors.pushDate}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="pushTime"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Push Time
          </label>
          <input
            type="time"
            id="pushTime"
            name="pushTime"
            value={formData.pushTime}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.pushTime ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.pushTime && (
            <p className="mt-2 text-sm text-red-600">{errors.pushTime}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !selectedRepo}
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
