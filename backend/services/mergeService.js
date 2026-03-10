const axios = require("axios");

/**
 * GitHub Merge Service
 * Handles branch merging via GitHub API
 */
class MergeService {
  /**
   * Merge source branch into target branch
   * @param {string} accessToken - GitHub OAuth access token
   * @param {object} scheduleData - Schedule data containing repo and branch info
   * @returns {Promise<object>} - Merge result
   */
  static async mergeBranches(accessToken, scheduleData) {
    const {
      repo_owner,
      repo_name,
      source_branch,
      target_branch,
      commit_message,
    } = scheduleData;

    if (!repo_owner || !repo_name || !source_branch || !target_branch) {
      throw new Error(
        "Missing required fields: repo_owner, repo_name, source_branch, target_branch",
      );
    }

    try {
      console.log(
        `🔀 Merging ${repo_owner}/${repo_name}: ${source_branch} → ${target_branch}`,
      );

      // Validate branches exist before attempting merge
      const sourceExists = await this.branchExists(
        accessToken,
        repo_owner,
        repo_name,
        source_branch,
      );
      const targetExists = await this.branchExists(
        accessToken,
        repo_owner,
        repo_name,
        target_branch,
      );

      if (!sourceExists) {
        throw new Error(
          `Source branch "${source_branch}" does not exist in ${repo_owner}/${repo_name}`,
        );
      }

      if (!targetExists) {
        throw new Error(
          `Target branch "${target_branch}" does not exist in ${repo_owner}/${repo_name}`,
        );
      }

      const response = await axios.post(
        `https://api.github.com/repos/${repo_owner}/${repo_name}/merges`,
        {
          base: target_branch,
          head: source_branch,
          commit_message:
            commit_message ||
            `Scheduled merge via PushClock: ${source_branch} → ${target_branch}`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "PushClock-App",
          },
        },
      );

      console.log(`✅ Merge successful: ${response.data.sha.substring(0, 7)}`);

      return {
        success: true,
        sha: response.data.sha,
        message: response.data.commit.message,
        merged: true,
      };
    } catch (error) {
      // Handle specific GitHub API errors
      if (error.response) {
        const { status, data } = error.response;

        // 204 = Already merged or no changes
        if (status === 204) {
          console.log(
            `⚠️ Branches already merged or no changes: ${source_branch} → ${target_branch}`,
          );
          return {
            success: true,
            merged: false,
            message: "Already merged or no changes to merge",
          };
        }

        // 409 = Merge conflict
        if (status === 409) {
          throw new Error(
            `Merge conflict: ${source_branch} cannot be automatically merged into ${target_branch}. Manual resolution required.`,
          );
        }

        // 404 = Branch not found
        if (status === 404) {
          throw new Error(
            `Branch not found: ${data.message || "One or both branches do not exist"}`,
          );
        }

        // 422 = Validation failed
        if (status === 422) {
          throw new Error(
            `Validation failed: ${data.message || "Invalid branch names or repository"}`,
          );
        }

        throw new Error(
          `GitHub API error (${status}): ${data.message || error.message}`,
        );
      }

      throw new Error(`Merge failed: ${error.message}`);
    }
  }

  /**
   * Check if a branch exists in the repository
   * @param {string} accessToken - GitHub OAuth access token
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name to check
   * @returns {Promise<boolean>} - True if branch exists
   */
  static async branchExists(accessToken, owner, repo, branch) {
    try {
      await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "PushClock-App",
          },
        },
      );
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get the merge status between two branches
   * @param {string} accessToken - GitHub OAuth access token
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} base - Base branch (target)
   * @param {string} head - Head branch (source)
   * @returns {Promise<object>} - Comparison data
   */
  static async compareBranches(accessToken, owner, repo, base, head) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "PushClock-App",
          },
        },
      );

      return {
        ahead_by: response.data.ahead_by,
        behind_by: response.data.behind_by,
        status: response.data.status, // 'ahead', 'behind', 'identical', 'diverged'
        total_commits: response.data.total_commits,
      };
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Compare failed: ${error.response.data.message || error.message}`,
        );
      }
      throw error;
    }
  }
}

module.exports = MergeService;
