import { graphql } from "@octokit/graphql";
import { ContributionData } from "../types/index.js";

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Fetches GitHub contributions for the last year using GraphQL API
   */
  async fetchContributions(): Promise<ContributionData> {
    if (!this.token) {
      console.warn("GITHUB_TOKEN is missing. Skipping GitHub data collection.");
      return {};
    }

    const query = `
      query {
        viewer {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response: any = await graphql(query, {
        headers: {
          authorization: `token ${this.token}`,
        },
      });

      const contributions: ContributionData = {};
      const weeks = response.viewer.contributionsCollection.contributionCalendar.weeks;

      for (const week of weeks) {
        for (const day of week.contributionDays) {
          contributions[day.date] = day.contributionCount;
        }
      }

      return contributions;
    } catch (error) {
      console.error("Error fetching GitHub contributions:", error);
      return {};
    }
  }
}
