import axios from "axios";
import { format, subYears } from "date-fns";
import { ContributionData } from "../types/index.js";

export class GitLabService {
  private token: string;
  private username: string;
  private instanceUrl: string;

  constructor(token: string, username: string, instanceUrl: string = "https://gitlab.com") {
    this.token = token;
    this.username = username;
    this.instanceUrl = instanceUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  /**
   * Fetches GitLab events and aggregates them into contribution counts by date.
   * Note: This fetches events from the last year.
   */
  async fetchContributions(): Promise<ContributionData> {
    if (!this.token || !this.username) {
      console.warn("GITLAB_TOKEN or GITLAB_USERNAME is missing. Skipping GitLab data collection.");
      return {};
    }

    const contributions: ContributionData = {};
    const oneYearAgo = format(subYears(new Date(), 1), "yyyy-MM-dd");
    
    try {
      // GitLab REST API: /users/:id_or_username/events
      // We'll fetch multiple pages if necessary, but for a start, let's fetch a reasonable amount.
      // GitLab events API is limited. For a more accurate graph, we might need more effort.
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 10) {
        const response = await axios.get(`${this.instanceUrl}/api/v4/events`, {
          params: {
            after: oneYearAgo,
            per_page: 100,
            page: page,
          },
          headers: {
            "PRIVATE-TOKEN": this.token,
          },
        });

        const events = response.data;
        if (events.length === 0) {
          hasMore = false;
          break;
        }

        for (const event of events) {
          const date = format(new Date(event.created_at), "yyyy-MM-dd");
          contributions[date] = (contributions[date] || 0) + 1;
        }

        if (events.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }

      return contributions;
    } catch (error) {
      console.error("Error fetching GitLab contributions:", error);
      return {};
    }
  }
}
