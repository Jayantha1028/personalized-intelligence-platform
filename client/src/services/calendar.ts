/**
 * Calendar Utilities for Deadline Tracking and Event Reminders
 * Generates Google Calendar Web URLs and triggers .ICS downloads.
 */

export function formatGoogleCalendarDate(dateString: string): { start: string; end: string } {
  try {
    const d = new Date(dateString);
    const start = new Date(d.getTime() - 60 * 60 * 1000); // 1 hour window
    const format = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    return {
      start: format(start),
      end: format(d),
    };
  } catch {
    const now = new Date();
    const format = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    return { start: format(now), end: format(now) };
  }
}

export function generateGoogleCalendarUrl(
  title: string,
  deadlineDate: string,
  description?: string,
  officialUrl?: string,
  provider?: string
): string {
  const { start, end } = formatGoogleCalendarDate(deadlineDate);
  const eventTitle = `⏳ Deadline: ${title}`;
  const details = [
    provider ? `Provider: ${provider}` : "",
    officialUrl ? `Official Portal: ${officialUrl}` : "",
    description ? `Summary: ${description}` : "",
    "\nAuto-synced from Antigravity Intelligence Platform",
  ]
    .filter(Boolean)
    .join("\n\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle,
    dates: `${start}/${end}`,
    details,
    location: officialUrl || "Online",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
