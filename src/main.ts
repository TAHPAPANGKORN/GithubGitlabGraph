import * as fs from "fs/promises";
import * as path from "path";
import "dotenv/config";
import { GitHubService } from "./services/github.service.js";
import { GitLabService } from "./services/gitlab.service.js";
import { mergeContributions } from "./utils/data-merger.js";
import { generateSVG } from "./utils/svg-generator.js";

/**
 * Main workflow for the Unified Contribution Graph Generator
 */
async function main() {
  console.log("🚀 Starting Unified Contribution Graph Generator...");

  // 1. Initialize Services from Environment Variables
  const githubToken = process.env.GITHUB_TOKEN || "";
  const gitlabToken = process.env.GITLAB_TOKEN || "";
  const gitlabUsername = process.env.GITLAB_USERNAME || "";
  const gitlabInstanceUrl = process.env.GITLAB_INSTANCE_URL || "https://gitlab.com";

  const githubService = new GitHubService(githubToken);
  const gitlabService = new GitLabService(gitlabToken, gitlabUsername, gitlabInstanceUrl);

  try {
    // 2. Fetch Data from APIs
    console.log("Fetching data from GitHub...");
    const githubData = await githubService.fetchContributions();
    console.log(`Found ${Object.keys(githubData).length} days of data from GitHub.`);

    console.log("Fetching data from GitLab...");
    const gitlabData = await gitlabService.fetchContributions();
    console.log(`Found ${Object.keys(gitlabData).length} days of data from GitLab.`);

    // 3. Generate SVG (Passing both datasets to handle colors)
    console.log("Generating SVG with separate colors...");
    const svg = generateSVG(githubData, gitlabData);

    // 5. Save Output
    const outputPath = path.join(process.cwd(), "contribution-graph.svg");
    await fs.writeFile(outputPath, svg);
    console.log(`✅ Successfully generated contribution graph at: ${outputPath}`);

  } catch (error) {
    console.error("❌ An error occurred during the workflow:", error);
    process.exit(1);
  }
}

main();
