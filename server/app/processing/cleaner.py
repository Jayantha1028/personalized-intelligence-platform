import re
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from typing import Optional
import httpx
import trafilatura

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Antigravity/1.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# Tracking parameters to strip
TRACKING_PARAMS = {
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "gclid", "fbclid", "msclkid", "mc_cid", "mc_eid", "ref", "referrer"
}

PUBLISHER_SUFFIX_REGEX = re.compile(
    r"\s*(?:[-–|—]\s*(?:TechCrunch|The Verge|PIB|Reuters|Hacker News|GitHub Blog|Economic Times|Mint|NDTV|The Hindu|AICTE)).*$",
    re.IGNORECASE
)

# Non-English / Devanagari script detection
DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")


def is_english_content(text: str) -> bool:
    """Check if content is in English and does not contain Hindi/Devanagari script."""
    if not text:
        return True
    if DEVANAGARI_REGEX.search(text):
        return False
    return True


def normalize_url(url: str) -> str:
    """Strip marketing query parameters, fragments, and trailing slashes."""
    if not url:
        return ""
    parsed = urlparse(url)
    clean_query = [
        (k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=True)
        if k.lower() not in TRACKING_PARAMS
    ]
    path = parsed.path.rstrip("/") if parsed.path != "/" else "/"
    normalized = urlunparse((
        parsed.scheme.lower(),
        parsed.netloc.lower(),
        path,
        parsed.params,
        urlencode(clean_query),
        ""  # strip fragment
    ))
    return normalized


def normalize_title(title: str) -> str:
    """Remove publisher branding suffixes and extra whitespace."""
    if not title:
        return ""
    clean = PUBLISHER_SUFFIX_REGEX.sub("", title).strip()
    return re.sub(r"\s+", " ", clean)


async def extract_clean_article(url: str, fallback_text: str = "") -> str:
    """
    Fetch webpage and extract clean, distraction-free article text using Trafilatura.
    Strips navigation, advertisements, cookie notices, and footers.
    """
    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True, headers=DEFAULT_HEADERS) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                html = resp.text
                extracted = trafilatura.extract(
                    html,
                    include_comments=False,
                    include_tables=False,
                    no_fallback=False,
                    output_format="txt",
                )
                if extracted and len(extracted.strip()) > 100:
                    return extracted.strip()
    except Exception:
        pass

    # If extraction fails, clean and return fallback text (feed description)
    clean_fallback = re.sub(r"<[^>]+>", " ", fallback_text)
    clean_fallback = re.sub(r"\s+", " ", clean_fallback).strip()
    return clean_fallback
