import math
from datetime import datetime, timezone
from typing import List, Dict, Optional


def calculate_relevance_score(
    title: str,
    content: str,
    published_at: Optional[datetime],
    source_trust_level: str,
    user_interests: List[Dict[str, float]],  # list of {"topic": str, "weight": float}
    user_skills: List[str],
) -> float:
    """
    Implements NewsScore formula from Section 8.2 of the build plan:
    NewsScore = 0.35R + 0.20Q + 0.15A + 0.10F + 0.10T + 0.10P
    """
    text_corpus = f"{title} {content}".lower()

    # 1. Relevance (R): Match against user interests & skills
    interest_hits = 0.0
    for interest in user_interests:
        t = interest.get("topic", "").lower()
        w = interest.get("weight", 1.0)
        if t and t in text_corpus:
            interest_hits += 0.3 * w

    for skill in user_skills:
        if skill.lower() in text_corpus:
            interest_hits += 0.15

    R = min(1.0, max(0.2, interest_hits))

    # 2. Content Quality (Q): length, structural density, absence of clickbait tokens
    clickbait_words = ["you won't believe", "shocking", "mind-blowing", "secret trick", "miracle"]
    has_clickbait = any(cb in text_corpus for cb in clickbait_words)
    has_numbers = bool(any(c.isdigit() for c in title))

    Q = 0.8
    if len(content) > 600:
        Q += 0.1
    if has_numbers:
        Q += 0.1
    if has_clickbait:
        Q -= 0.3
    Q = min(1.0, max(0.1, Q))

    # 3. Source Authority (A)
    authority_map = {
        "official": 1.0,
        "verified_publisher": 0.85,
        "aggregator": 0.6,
    }
    A = authority_map.get(source_trust_level.lower(), 0.7)

    # 4. Freshness (F): Exponential time decay
    now = datetime.now(timezone.utc)
    if published_at:
        hours_old = max(0.0, (now - published_at).total_seconds() / 3600.0)
        # Half-life of 48 hours
        F = math.exp(-0.693 * (hours_old / 48.0))
    else:
        F = 0.5

    # 5. Topic importance (T)
    T = 0.8 if any(k in text_corpus for k in ["policy", "semiconductor", "ai", "cloud", "security"]) else 0.5

    # 6. Personal Impact (P)
    P = 0.9 if ("india" in text_corpus or "karnataka" in text_corpus or "student" in text_corpus) else 0.5

    # Composite Score
    score = (0.35 * R) + (0.20 * Q) + (0.15 * A) + (0.10 * F) + (0.10 * T) + (0.10 * P)
    return round(min(1.0, max(0.0, score)), 2)
