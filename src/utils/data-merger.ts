import { ContributionData } from "../types/index.js";

/**
 * Merges multiple contribution datasets into one by summing values for the same dates.
 */
export function mergeContributions(...datasets: ContributionData[]): ContributionData {
  const merged: ContributionData = {};

  for (const dataset of datasets) {
    for (const [date, count] of Object.entries(dataset)) {
      merged[date] = (merged[date] || 0) + count;
    }
  }

  return merged;
}
