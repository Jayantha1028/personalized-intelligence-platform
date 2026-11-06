import re
from typing import Optional, Set
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import Article, ArticleCluster


def tokenize(text: str) -> Set[str]:
    """Extract lowercase alphanumeric tokens, stripping common plural suffixes and stopwords."""
    words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
    stopwords = {
        "the", "and", "for", "with", "from", "that", "this", "are", "was", "will",
        "has", "have", "its", "new", "about", "into", "over", "after", "how", "why"
    }
    tokens = set()
    for w in words:
        if w not in stopwords:
            # Simple stemming: strip trailing 's'
            stemmed = w[:-1] if w.endswith("s") and len(w) > 4 else w
            tokens.add(stemmed)
    return tokens


def title_jaccard_similarity(t1: str, t2: str) -> float:
    """Calculate token Jaccard overlap between two headlines."""
    tokens1 = tokenize(t1)
    tokens2 = tokenize(t2)
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union)


async def check_url_exists(db: AsyncSession, canonical_url: str) -> bool:
    """Check if the exact canonical URL was already ingested."""
    stmt = select(Article.id).where(Article.canonical_url == canonical_url)
    res = await db.execute(stmt)
    return res.scalar() is not None


async def find_or_create_cluster(db: AsyncSession, title: str, topic: str) -> Optional[int]:
    """
    Find an existing story cluster with >= 65% token overlap,
    or create a new cluster to group related coverage together.
    """
    # Fetch recent clusters in the same topic
    stmt = select(ArticleCluster).where(ArticleCluster.primary_topic == topic).order_by(ArticleCluster.last_updated_at.desc()).limit(30)
    res = await db.execute(stmt)
    clusters = res.scalars().all()

    for c in clusters:
        sim = title_jaccard_similarity(title, c.title)
        if sim >= 0.55:
            c.article_count += 1
            await db.flush()
            return c.id

    # Create new cluster
    new_cluster = ArticleCluster(
        title=title,
        primary_topic=topic,
        article_count=1,
    )
    db.add(new_cluster)
    await db.flush()
    return new_cluster.id
