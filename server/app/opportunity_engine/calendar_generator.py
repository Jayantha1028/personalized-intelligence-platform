from datetime import datetime, timezone, timedelta
from typing import List, Optional
from app.database.models import Opportunity


def format_ics_datetime(dt: datetime) -> str:
    """Format datetime as UTC iCalendar timestamp: YYYYMMDDTHHMMSSZ"""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt.strftime("%Y%m%dT%H%M%SZ")


def escape_ics_text(text: str) -> str:
    """Escape special characters in ICS values."""
    if not text:
        return ""
    return (
        text.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\n", "\\n")
    )


def generate_single_event_ics(opp: Opportunity) -> str:
    """Generates an RFC 5545 .ics calendar string for a single opportunity deadline."""
    return generate_bundle_ics([opp], calendar_name=f"Deadline - {opp.title[:40]}")


def generate_bundle_ics(opportunities: List[Opportunity], calendar_name: str = "Antigravity Intelligence Deadlines") -> str:
    """Generates an RFC 5545 .ics string containing multiple deadline events with reminders."""
    now_str = format_ics_datetime(datetime.now(timezone.utc))

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Antigravity Dual Engine//Opportunity Deadline Tracker//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{escape_ics_text(calendar_name)}",
        "X-WR-TIMEZONE:UTC",
    ]

    for opp in opportunities:
        if not opp.application_deadline:
            continue

        deadline = opp.application_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

        # Start 1 hour before deadline or day of deadline
        start_time = deadline - timedelta(hours=1)
        end_time = deadline

        dtstamp = now_str
        dtstart = format_ics_datetime(start_time)
        dtend = format_ics_datetime(end_time)
        uid = f"opp-{opp.id}-deadline@antigravity.platform"

        description_text = (
            f"Opportunity: {opp.title}\\n"
            f"Provider: {opp.provider}\\n"
            f"Category: {opp.category.replace('_', ' ').title()}\\n"
            f"Benefit: {opp.benefit_summary or 'See official details'}\\n"
            f"Official Link: {opp.official_url}\\n\\n"
            f"Summary: {opp.description[:300]}..."
        )

        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{dtstamp}",
            f"DTSTART:{dtstart}",
            f"DTEND:{dtend}",
            f"SUMMARY:⏳ DEADLINE: {escape_ics_text(opp.title[:65])}",
            f"DESCRIPTION:{description_text}",
            f"URL:{opp.official_url}",
            f"ORGANIZER;CN={escape_ics_text(opp.provider)}:mailto:noreply@antigravity.platform",
            "STATUS:CONFIRMED",
            "PRIORITY:1",
            # 24h Reminder Alarm
            "BEGIN:VALARM",
            "TRIGGER:-PT24H",
            "ACTION:DISPLAY",
            f"DESCRIPTION:Reminder: {escape_ics_text(opp.title)} closes tomorrow!",
            "END:VALARM",
            # 48h Reminder Alarm
            "BEGIN:VALARM",
            "TRIGGER:-PT48H",
            "ACTION:DISPLAY",
            f"DESCRIPTION:Early Warning: {escape_ics_text(opp.title)} closes in 2 days!",
            "END:VALARM",
            "END:VEVENT",
        ])

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines) + "\r\n"
