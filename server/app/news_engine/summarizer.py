import re
import json
from typing import List, Dict, Any, Optional
import httpx
from app.config import settings


class SummarizerResult:
    def __init__(
        self,
        summary_bullets: List[str],
        personal_impact: Optional[str] = None,
        practical_actions: Optional[List[str]] = None,
        is_llm_generated: bool = False,
    ):
        self.summary_bullets = summary_bullets
        self.personal_impact = personal_impact
        self.practical_actions = practical_actions or []
        self.is_llm_generated = is_llm_generated


class HybridSummarizer:
    """
    Hybrid Summarizer:
    1. Zero-GPU Local Extractive Engine (default, CPU-only, 0 hallucination).
    2. Cloud Gemini 1.5 Flash (if GEMINI_API_KEY is configured in .env).
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

    async def summarize(
        self,
        title: str,
        content: str,
        user_context: str = "B.Tech Computer Science student in Karnataka, India interested in AI, Cloud, and Startups",
    ) -> SummarizerResult:
        if not content or len(content.strip()) < 80:
            # Short content fallback
            return SummarizerResult(
                summary_bullets=[title],
                personal_impact="Relevant update in your tracked technical domains.",
                practical_actions=["Review the source page for full release notes."],
                is_llm_generated=False,
            )

        # 1. Try Gemini Cloud if API key is present
        if self.api_key:
            try:
                llm_result = await self._call_gemini_api(title, content, user_context)
                if llm_result:
                    return llm_result
            except Exception as e:
                # Log error and gracefully fall back to local CPU summarizer
                pass

        # 2. Local Extractive CPU Summarizer (Zero-GPU, fast, guaranteed factual)
        return self._extractive_summarize(title, content)

    def _extractive_summarize(self, title: str, content: str) -> SummarizerResult:
        """Extract top 3 factual sentences based on information density & title overlap."""
        # Clean text into sentences
        raw_sentences = re.split(r"(?<=[.!?])\s+", content)
        clean_sentences = []
        for s in raw_sentences:
            s_clean = s.strip()
            # Filter boilerplate sentences
            if (
                len(s_clean) >= 40
                and not s_clean.lower().startswith(("cookie", "subscribe", "sign up", "advertisement", "all rights"))
            ):
                clean_sentences.append(s_clean)

        if not clean_sentences:
            return SummarizerResult(
                summary_bullets=[title],
                personal_impact="Updates on technology and policy development.",
                practical_actions=["Open original article for full context."],
                is_llm_generated=False,
            )

        # Tokenize title
        title_words = set(re.findall(r"\b[a-zA-Z0-9]{3,}\b", title.lower()))

        scored_sentences = []
        for idx, sentence in enumerate(clean_sentences[:25]):  # focus on top 25 sentences
            words = set(re.findall(r"\b[a-zA-Z0-9]{3,}\b", sentence.lower()))
            overlap = len(title_words.intersection(words))
            has_numbers = 1 if re.search(r"\b\d+[\d,.]*\b|₹|\$|%|crore|lakh", sentence, re.IGNORECASE) else 0
            position_bias = max(0, 1.0 - (idx * 0.04))  # earlier sentences are more factual

            score = (overlap * 2.0) + (has_numbers * 1.5) + position_bias
            scored_sentences.append((score, sentence))

        scored_sentences.sort(key=lambda x: x[0], reverse=True)
        top_sentences = [s[1] for s in scored_sentences[:3]]

        # Practical action heuristic
        practical_actions = [
            "Check the official documentation or announcement linked above.",
            "Verify how this impacts existing libraries and tooling in your projects.",
        ]

        return SummarizerResult(
            summary_bullets=top_sentences,
            personal_impact=f"Important ecosystem update regarding {title[:60]}...",
            practical_actions=practical_actions,
            is_llm_generated=False,
        )

    async def _call_gemini_api(
        self, title: str, content: str, user_context: str
    ) -> Optional[SummarizerResult]:
        """Call Gemini 1.5 Flash via REST API with strict JSON schema constraints."""
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"

        prompt = f"""
You are an evidence-grounded news intelligence analyst.
Analyze the article below and produce a structured summary.
User context: {user_context}

RULES:
1. summary_bullets must be EXACTLY 3 concise factual bullet points directly supported by the article.
2. personal_impact must explain why this matters specifically to the user context in 1-2 clear sentences.
3. practical_actions must be 1-2 concrete next steps the user can take.
4. Strictly NO hallucinated facts, dates, or financial amounts.
5. Return JSON ONLY matching this format:
{{
  "summary_bullets": ["bullet 1", "bullet 2", "bullet 3"],
  "personal_impact": "impact string",
  "practical_actions": ["action 1", "action 2"]
}}

Article Title: {title}
Article Text:
{content[:4000]}
"""

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"},
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(endpoint, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)
                return SummarizerResult(
                    summary_bullets=parsed.get("summary_bullets", [])[:3],
                    personal_impact=parsed.get("personal_impact"),
                    practical_actions=parsed.get("practical_actions", []),
                    is_llm_generated=True,
                )
        return None
