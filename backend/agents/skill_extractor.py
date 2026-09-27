import json
import re
import logging
from typing import Dict
from tools.skill_extractor import SkillExtractor
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

class SkillExtractionAgent:
    def __init__(self):
        self.extractor = SkillExtractor()

    def run(self, raw_text: str) -> Dict:
        # 1. Extract taxonomy-based skills
        categorized = self.extractor.extract(raw_text)
        flat_skills = self.extractor.get_flat_skills(raw_text)
        
        # 2. Enrich with Gemini semantic skill extraction
        # Sanitize text before passing to Gemini
        safe_text = _sanitize_text(raw_text)

        prompt = f"""You are a technical recruitment specialist. Extract all technical skills, programming languages, software tools, developer packages, libraries, frameworks, databases, and major methodologies from the following resume text.
Exclude these already identified skills: {", ".join(flat_skills) if flat_skills else "None"}.

Return ONLY a valid JSON list of strings (no other text, explanations, or markdown code blocks):
["Skill 1", "Skill 2", ...]

Resume Text:
{safe_text[:6000]}
"""
        try:
            raw = generate_json(prompt, max_tokens=600)
            cleaned = raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            gemini_skills = json.loads(cleaned)
            if isinstance(gemini_skills, list):
                # Standardize to title case and merge
                for skill in gemini_skills:
                    skill_title = str(skill).strip().title()
                    if skill_title and skill_title not in flat_skills:
                        flat_skills.append(skill_title)
                        if "additional_skills" not in categorized:
                            categorized["additional_skills"] = []
                        categorized["additional_skills"].append(skill_title)
                logger.info(f"[Skill Agent - Gemini] Extracted {len(gemini_skills)} additional skills semantically.")
        except Exception as e:
            logger.error(f"Gemini skill extraction fallback: {e}")
            
        return {"categorized_skills": categorized, "all_skills": flat_skills}
