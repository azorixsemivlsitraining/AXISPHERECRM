/**
 * Utility functions for formatting dates in IST (UTC+5:30) timezone
 */

const IST_OFFSET = 5.5; // UTC+5:30

/**
 * Convert a date to IST timezone and format it
 * @param dateString - ISO date string or Date object
 * @param format - 'datetime' (default) or 'date'
 * @returns Formatted date string in IST timezone
 */
export function formatDateIST(
  dateString: string | Date,
  format: "datetime" | "date" = "datetime",
): string {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return typeof dateString === "string" ? dateString : "Invalid date";
    }

    // Get UTC time and convert to IST
    const utcTime = date.getTime();
    const istTime = utcTime + IST_OFFSET * 60 * 60 * 1000;
    const istDate = new Date(istTime);

    if (format === "date") {
      return istDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }

    // datetime format
    return istDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return typeof dateString === "string" ? dateString : "Invalid date";
  }
}

/**
 * Format a date for display in activity logs with timestamp
 * @param dateString - ISO date string or Date object
 * @returns Formatted date and time string in IST timezone
 */
export function formatActivityLogDate(dateString: string | Date): string {
  return formatDateIST(dateString, "datetime");
}

/**
 * Format a date for display without time component
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string in IST timezone
 */
export function formatDateOnlyIST(dateString: string | Date): string {
  return formatDateIST(dateString, "date");
}

/**
 * Get relative time display (e.g., "2 hours ago", "3 days ago")
 * Useful for activity feeds
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | Date): string {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return formatDateIST(dateString, "date");
  } catch {
    return "Invalid date";
  }
}
