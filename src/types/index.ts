/**
 * Key: Date string (YYYY-MM-DD)
 * Value: Number of contributions
 */
export type ContributionData = Record<string, number>;

export interface DayContribution {
  date: string;
  count: number;
}
