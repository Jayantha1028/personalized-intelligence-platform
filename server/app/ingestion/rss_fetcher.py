from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import httpx
import feedparser
from dateutil import parser as date_parser


DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 AntigravityIntelligence/1.0",
    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
}


class RSSFetcher:
    """Robust RSS/Atom fetcher with timeouts, headers, and error isolation."""

    def __init__(self, timeout_seconds: float = 15.0):
        self.timeout = timeout_seconds

    async def fetch_feed(self, feed_url: str) -> List[Dict[str, Any]]:
        """Fetch and parse feed entries asynchronously."""
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True, headers=DEFAULT_HEADERS) as client:
            response = await client.get(feed_url)
            response.raise_for_status()
            content = response.text

        # feedparser works on text or bytes
        parsed = feedparser.parse(content)
        if parsed.bozo and not parsed.entries:
            raise ValueError(f"Failed to parse XML from {feed_url}: {getattr(parsed, 'bozo_exception', 'Malformed feed')}")

        items = []
        for entry in parsed.entries:
            item = self._normalize_entry(entry)
            if item:
                items.append(item)

        return items

    def _normalize_entry(self, entry: Any) -> Optional[Dict[str, Any]]:
        link = getattr(entry, "link", None)
        title = getattr(entry, "title", None)
        if not link or not title:
            return None

        # Parse publication date
        published_at = None
        for date_field in ["published", "updated", "created", "pubDate"]:
            val = getattr(entry, date_field, None)
            if val:
                try:
                    dt = date_parser.parse(val)
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                    else:
                        dt = dt.astimezone(timezone.utc)
                    published_at = dt
                    break
                except Exception:
                    pass

        if not published_at:
            published_at = datetime.now(timezone.utc)

        summary = getattr(entry, "summary", "") or getattr(entry, "description", "")
        author = getattr(entry, "author", None)

        return {
            "title": title.strip(),
            "url": link.strip(),
            "published_at": published_at,
            "raw_summary": summary.strip() if summary else "",
            "author": author.strip() if author else None,
        }
