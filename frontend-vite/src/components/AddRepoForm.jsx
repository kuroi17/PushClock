import React, { useState } from "react";

const AddRepoForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    repoPath: "",
    branch: "main",
    pushDate: "",
    pushTime: "",
  });

  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.repoPath.trim()) {
      newErrors.repoPath = "Repository path is required";
    }

    if (!formData.branch.trim()) {
      newErrors.branch = "Branch name is required";
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
        ...formData,
        pushTime: pushDateTime,
      };

      if (onSubmit) {
        onSubmit(submitData);
      }

      // Reset form
      setFormData({
        repoPath: "",
        branch: "main",
        pushDate: "",
        pushTime: "",
      });
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

      {/* Repository Path */}
      <div className="mb-6">
        <label
          htmlFor="repoPath"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Repository Path
        </label>
        <input
          type="text"
          id="repoPath"
          name="repoPath"
          value={formData.repoPath}
          onChange={handleChange}
          placeholder="C:\\Users\\YourName\\Projects\\my-repo"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.repoPath ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.repoPath && (
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
            {errors.repoPath}
          </p>
        )}
      </div>

      {/* Branch Name */}
      <div className="mb-6">
        <label
          htmlFor="branch"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Branch Name
        </label>
        <input
          type="text"
          id="branch"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          placeholder="main"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.branch ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.branch && (
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
            {errors.branch}
          </p>
        )}
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
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          Schedule Push
        </button>
      </div>
    </form>
  );
};

export default AddRepoForm;
