import re
from typing import Dict, List
from tools.embedding_tool import EmbeddingTool
from tools.skill_extractor import SkillExtractor
import logging
import json
from tools.gemini_client import generate_json

logger = logging.getLogger(__name__)


def _sanitize_text(text: str) -> str:
    """Remove/replace PDF special chars that break JSON encoding."""
    for ch in ['\uf0b7', '\u2022', '\u2023', '\u25aa', '\u25cf', '\u2043', '\u2219']:
        text = text.replace(ch, '-')
    text = text.replace('\u2265', '>=').replace('\u2264', '<=')
    text = text.replace('\u2013', '-').replace('\u2014', '-')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\u00a0', ' ')
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'[^\x09\x0a\x20-\x7e\u00c0-\u024f]', ' ', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return text.strip()


class ATSCalculator:
    """Calculates ATS compatibility score between a resume and job description."""

    def __init__(self):
        self.embedding_tool = EmbeddingTool()
        self.skill_extractor = SkillExtractor()

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords from text."""
        # Remove punctuation and split
        words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9\+\#\.]{2,}\b', text.lower())
        stop_words = {
            "the", "and", "for", "are", "with", "this", "that", "will",
            "have", "from", "our", "you", "your", "they", "their", "has",
            "was", "not", "but", "can", "all", "been", "had", "his", "her",
            "is", "it", "to", "in", "of", "a", "an", "on", "as", "at", "by",
            "we", "us", "or", "if", "be", "so", "up", "out", "about", "who",
            "which", "there", "some", "could", "would", "should", "what",
            "when", "where", "why", "how", "any", "such", "into", "over",
            "after", "before", "then", "than", "also", "very", "much",
            "more", "most", "other", "these", "those", "only", "new", "used",
            "experience", "years", "work", "job", "role", "team", "company",
            "skills", "knowledge", "ability", "working", "required", "preferred",
            "candidate", "business", "development", "strong", "excellent",
            "good", "including", "using", "through", "well", "must", "make",
            "support", "environment", "design", "build", "create", "help",
            "ensure", "provide", "within", "need", "needs", "best", "part"
        }
        return [w for w in words if w not in stop_words]

    def calculate(self, resume_text: str, jd_text: str) -> Dict:
        """
        Calculate ATS score based on:
        - Exact Skill matching (30%)
        - Keyword matching (20%)
        - Semantic similarity via embeddings (50%)
        """
        if not resume_text or not jd_text:
            return {
                "score": 0.0,
                "matched_keywords": [],
                "missing_keywords": [],
                "semantic_similarity": 0.0,
                "skill_match_percent": 0.0
            }

        # Skill matching using the taxonomy
        jd_skills = set(self.skill_extractor.get_flat_skills(jd_text))
        resume_skills = set(self.skill_extractor.get_flat_skills(resume_text))
        
        matched_skills = list(jd_skills & resume_skills)
        missing_skills = list(jd_skills - resume_skills)
        skill_score = (len(matched_skills) / len(jd_skills) * 100) if jd_skills else 100.0

        # Keyword analysis (fallback for non-taxonomy skills)
        jd_keywords = set(self._extract_keywords(jd_text))
        resume_keywords = set(self._extract_keywords(resume_text))

        matched_keywords = list(jd_keywords & resume_keywords)
        missing_keywords = list(jd_keywords - resume_keywords)

        keyword_score = (len(matched_keywords) / len(jd_keywords) * 100) if jd_keywords else 100.0

        # Semantic similarity (increased context up to 6000 chars)
        resume_emb = self.embedding_tool.embed(resume_text[:6000])
        jd_emb = self.embedding_tool.embed(jd_text[:6000])
        semantic_sim = self.embedding_tool.cosine_similarity(resume_emb, jd_emb)
        semantic_score = max(0.0, semantic_sim * 100)

        # Weighted mechanical score
        mechanical_score = (skill_score * 0.30) + (keyword_score * 0.20) + (semantic_score * 0.50)
        mechanical_score = min(round(mechanical_score, 2), 100.0)

        # Gemini Qualitative Role Alignment Evaluation
        alignment_score = mechanical_score
        reasoning = "Calculated via keyword match and semantic vector embeddings."
        
        # Sanitize both texts before sending to Gemini
        safe_resume = _sanitize_text(resume_text)
        safe_jd = _sanitize_text(jd_text)

        prompt = f"""You are a senior technical hiring manager. Evaluate the alignment of this Candidate Resume against the Job Description.
Evaluate based on:
1. Technical depth and relevant skillset.
2. Experience seniority level, leadership responsibilities, and years of experience versus what is requested.
3. Quality of achievements and projects compared to the target role.

Return ONLY valid JSON matching this schema exactly. No other text or markdown code blocks:
{{
  "alignment_score": 85.0,
  "reasoning": "A highly precise 2-sentence summary of the candidate's strengths and core fit gaps for this specific job."
}}

Job Description:
{safe_jd[:4000]}

Candidate Resume:
{safe_resume[:6000]}
"""
        try:
            raw = generate_json(prompt, max_tokens=500)
            cleaned = raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            data = json.loads(cleaned)
            if "alignment_score" in data:
                alignment_score = float(data["alignment_score"])
                reasoning = data.get("reasoning", reasoning)
                logger.info(f"[ATS Scorer - Gemini] Qualitative alignment score: {alignment_score}%")
        except Exception as e:
            logger.warning(f"[ATS Scorer - Gemini] Falling back to mechanical scoring: {e}")
            logger.warning(f"[ATS Scorer - Gemini] Raw response was: {raw}")

        # Blend mechanical score (40%) and LLM alignment score (60%)
        final_score = (mechanical_score * 0.40) + (alignment_score * 0.60)
        final_score = min(round(final_score, 2), 100.0)

        # Merge for output
        matched_out = list(set(matched_skills + matched_keywords))
        missing_out = list(set(missing_skills + missing_keywords))

        return {
            "score": final_score,
            "matched_keywords": matched_out[:30],
            "missing_keywords": missing_out[:20],
            "semantic_similarity": round(semantic_score, 2),
            "skill_match_percent": round(skill_score, 2),
            "alignment_reasoning": reasoning
        }
