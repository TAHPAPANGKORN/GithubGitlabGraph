import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";
import { ContributionData } from "../types/index.js";

const CELL_SIZE = 10;
const CELL_GAP = 2;
const TEXT_HEIGHT = 15;
const MARGIN = 20;

// GitHub Green Palette
const GITHUB_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
// GitLab Orange Palette
const GITLAB_COLORS = ["#ebedf0", "#ffdfc4", "#ffb380", "#ff8c42", "#e65100"];
// Merged Purple Palette
const MERGED_COLORS = ["#ebedf0", "#c2c2f0", "#9393e6", "#6464db", "#3a3ad1"];

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

function getColor(githubCount: number, gitlabCount: number): string {
  const total = githubCount + gitlabCount;
  const intensity = getIntensity(total);

  if (intensity === 0) return GITHUB_COLORS[0];

  if (githubCount > 0 && gitlabCount > 0) {
    return MERGED_COLORS[intensity];
  } else if (gitlabCount > 0) {
    return GITLAB_COLORS[intensity];
  } else {
    return GITHUB_COLORS[intensity];
  }
}

/**
 * Generates an SVG string for the contribution graph with separate colors for GitHub and GitLab.
 */
export function generateSVG(githubData: ContributionData, gitlabData: ContributionData): string {
  const endDate = new Date();
  const startDate = subDays(endDate, 364);
  const calendarStart = startOfWeek(startDate);
  const days = eachDayOfInterval({ start: calendarStart, end: endDate });

  let svgContent = "";
  let weekIndex = 0;
  let lastMonth = -1;
  let monthLabels = "";

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const x = weekIndex * (CELL_SIZE + CELL_GAP) + MARGIN;
    const y = (i % 7) * (CELL_SIZE + CELL_GAP) + MARGIN + TEXT_HEIGHT;

    const dateStr = format(day, "yyyy-MM-dd");
    const ghCount = githubData[dateStr] || 0;
    const glCount = gitlabData[dateStr] || 0;

    const color = getColor(ghCount, glCount);

    let title = `${dateStr}: `;
    if (ghCount > 0) title += `${ghCount} GitHub `;
    if (glCount > 0) title += `${glCount} GitLab `;
    if (ghCount === 0 && glCount === 0) title += `No contributions`;

    svgContent += `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="${color}" rx="2" ry="2">
      <title>${title.trim()}</title>
    </rect>\n`;

    if (i % 7 === 6) {
      const currentMonth = day.getMonth();
      if (currentMonth !== lastMonth) {
        // Only show month if it's the first time we see it in this week
        monthLabels += `<text x="${x}" y="${MARGIN + 10}" font-size="9" font-family="sans-serif" fill="#767676">${format(day, "MMM")}</text>\n`;
        lastMonth = currentMonth;
      }
      weekIndex++;
    }
  }

  const width = weekIndex * (CELL_SIZE + CELL_GAP) + MARGIN * 2;
  const height = 7 * (CELL_SIZE + CELL_GAP) + MARGIN * 2 + TEXT_HEIGHT;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
  </style>
  <rect width="100%" height="100%" fill="white" />
  ${monthLabels}
  ${svgContent}
  
  <!-- Legend -->
  <g transform="translate(${MARGIN}, ${height - MARGIN + 10})">
    <rect x="0" y="0" width="8" height="8" fill="${GITHUB_COLORS[2]}" rx="1" ry="1" />
    <text x="12" y="7" font-size="8" fill="#767676">GitHub (Green)</text>
    
    <rect x="85" y="0" width="8" height="8" fill="${GITLAB_COLORS[2]}" rx="1" ry="1" />
    <text x="97" y="7" font-size="8" fill="#767676">GitLab (Orange)</text>
    
    <rect x="180" y="0" width="8" height="8" fill="${MERGED_COLORS[2]}" rx="1" ry="1" />
    <text x="192" y="7" font-size="8" fill="#767676">Merged (Purple)</text>
  </g>
</svg>
  `.trim();
}
