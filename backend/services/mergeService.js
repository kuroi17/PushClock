/**
 * GitHub Merge Service
 * Handles branch merging via GitHub API
 */
const axios = require("axios");

class MergeService {
  /**
   * Revert a merge commit using GitHub API
   * Note: GitHub REST API doesn't have a direct "revert" endpoint.
   * This implementation creates a new commit that reverses the merge changes.
   *
   * @param {string} accessToken - GitHub OAuth access token
   * @param {object} params - { owner, repo, commitSha, branch }
   * @returns {Promise<object>} - Revert result
   */
  static async revertCommit(accessToken, { owner, repo, commitSha, branch }) {
    try {
      console.log(
        `🔄 Attempting to revert commit ${commitSha.substring(0, 7)} in ${owner}/${repo}`,
      );

      // Get the merge commit details
      const commitResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "PushClock-App",
          },
        },
      );

      const commit = commitResponse.data;

      // Check if it's a merge commit (has multiple parents)
      if (!commit.parents || commit.parents.length < 2) {
        return {
          success: false,
          message:
            "This is not a merge commit. Only merge commits can be reverted.",
        };
      }

      // To revert a merge commit, we need to:
      // 1. Get the tree of the first parent (state before merge)
      // 2. Create a new commit with that tree and current HEAD as parent
      // 3. Update the branch reference

      const firstParentSha = commit.parents[0].sha;

      // Get the tree of the first parent (state before merge)
      const parentCommitResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/commits/${firstParentSha}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "PushClock-App",
          },
        },
      );

      const revertTreeSha = parentCommitResponse.data.tree.sha;

      // Create a new commit with the old tree (reverts the merge)
      const newCommitResponse = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/git/commits`,
        {
          message: `Revert merge ${commitSha.substring(0, 7)}\n\nThis reverts commit ${commitSha}`,
          tree: revertTreeSha,
          parents: [commitSha], // Current HEAD is the parent
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "PushClock-App",
          },
        },
      );

      const newCommitSha = newCommitResponse.data.sha;

      // Update the branch to point to the new revert commit
      await axios.patch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
        {
          sha: newCommitSha,
          force: false,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "PushClock-App",
          },
        },
      );

      console.log(`✅ Revert successful: ${newCommitSha.substring(0, 7)}`);

      return {
        success: true,
        sha: newCommitSha,
        message: `Revert merge ${commitSha.substring(0, 7)}`,
      };
    } catch (error) {
      console.error("Error reverting commit:", error.message);
      let message = error.message;
      if (error.response) {
        const { status, data } = error.response;
        if (status === 409)
          message =
            "Cannot automatically revert: merge conflicts detected. Please revert manually in GitHub.";
        else if (status === 404)
          message =
            "Commit or branch not found. The merge may have been already reverted or deleted.";
        else if (status === 422)
          message = `Revert validation failed: ${data?.message || "Unknown error"}`;
        else
          message = `GitHub API error (${status}): ${data?.message || error.message}`;
      }

      return {
        success: false,
        sha: null,
        message,
      };
    }
  }

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
