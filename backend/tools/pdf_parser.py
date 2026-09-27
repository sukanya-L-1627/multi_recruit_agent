import pdfplumber
import re
import logging
import json
from tools.gemini_client import generate_json

logger = logging.getLogger(__name__)


class PDFParser:
    """Extracts text and structured data from PDF resumes."""

    def extract_text(self, file_path: str) -> str:
        """Extract raw text from a PDF file."""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
        return text.strip()

    def sanitize_for_json(self, text: str) -> str:
        """
        Sanitize extracted PDF text so it is safe to embed in JSON strings.
        Replaces special Windows bullets, math symbols, control chars, and
        normalizes line endings to prevent unterminated-string JSON errors.
        """
        # Map Windows Wingdings / Symbol bullets to ASCII dash
        bullet_chars = [
            '\uf0b7', '\u2022', '\u2023', '\u25aa', '\u25cf',
            '\u2043', '\u204c', '\u204d', '\u2219',
        ]
        for ch in bullet_chars:
            text = text.replace(ch, '-')

        # Replace special math/comparison operators with ASCII equivalents
        text = text.replace('\u2265', '>=').replace('\u2264', '<=')
        text = text.replace('\u2013', '-').replace('\u2014', '-')
        text = text.replace('\u2018', "'").replace('\u2019', "'")
        text = text.replace('\u201c', '"').replace('\u201d', '"')
        text = text.replace('\u00a0', ' ')   # Non-breaking space
        text = text.replace('\u00b7', '-')   # Middle dot

        # Normalize line endings
        text = text.replace('\r\n', '\n').replace('\r', '\n')

        # Remove non-printable control characters (keep \n=0x0a and \t=0x09)
        text = re.sub(r'[^\x09\x0a\x20-\x7e\u00c0-\u024f]', ' ', text)

        # Collapse runs of spaces/tabs (but preserve newlines)
        text = re.sub(r'[ \t]{2,}', ' ', text)

        return text.strip()

    def extract_email(self, text: str) -> str:
        pattern = r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
        match = re.search(pattern, text)
        return match.group(0) if match else ""

    def extract_phone(self, text: str) -> str:
        pattern = r'(?:\+91[\-\s]?)?(?:\d{5}[\-\s]?\d{5}|\d{10}|\(\d{3}\)[\-\s]?\d{3}[\-\s]?\d{4})'
        match = re.search(pattern, text)
        return match.group(0) if match else ""

    def extract_name(self, text: str) -> str:
        """Heuristic: first non-empty line is usually the name."""
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if lines:
            first = lines[0]
            if len(first.split()) <= 5 and not re.search(r'[@\d]', first):
                return first
        return "Unknown Candidate"

    def extract_sections(self, text: str) -> dict:
        """Split resume text into labeled sections."""
        sections = {
            "education": [],
            "experience": [],
            "skills": [],
            "certifications": [],
            "projects": []
        }

        section_patterns = {
            "education": r'(education|academic|qualification)',
            "experience": r'(experience|employment|work history|career)',
            "skills": r'(skills|technical skills|core competencies|technologies)',
            "certifications": r'(certification|certificate|credential|achievement)',
            "projects": r'(project|portfolio)'
        }

        lines = text.split('\n')
        current_section = None

        for line in lines:
            line_lower = line.strip().lower()
            matched = False
            for section, pattern in section_patterns.items():
                if re.search(pattern, line_lower) and len(line.strip()) < 60:
                    current_section = section
                    matched = True
                    break
            if not matched and current_section and line.strip():
                sections[current_section].append(line.strip())

        return sections

    def estimate_experience(self, text: str, exp_lines: list = None) -> float:
        """Estimate years of experience from text."""
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*yrs?\s*(?:of\s*)?experience',
        ]
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return float(match.group(1))

        if exp_lines:
            exp_text = "\n".join(exp_lines)
            year_pattern = r'\b(19\d{2}|20\d{2})\b'
            years = re.findall(year_pattern, exp_text)
            if len(years) >= 2:
                try:
                    sorted_years = sorted([int(y) for y in years])
                    diff = float(sorted_years[-1] - sorted_years[0])
                    if 0 < diff <= 40:
                        return diff
                except Exception:
                    pass
        return 0.0

    def parse_with_gemini(self, text: str) -> dict:
        """Parse resume text into structured fields using Gemini."""
        # Sanitize text first to avoid JSON encoding problems
        safe_text = self.sanitize_for_json(text)

        prompt = f"""You are an advanced recruitment AI. Parse the following resume text into a structured JSON object.

Instructions:
- Extract all information exactly as stated, no inventions.
- Each entry in list fields must be a clean, complete single-line string with no embedded newlines.
- years_experience must be a number (float or int), estimate from dates if not explicit.

Return ONLY a single valid JSON object matching this exact schema:
{{
  "name": "Candidate Full Name",
  "email": "email@example.com",
  "phone": "+91-XXXXXXXXXX",
  "education": ["JNTUH - B.Tech in CSE AI and ML (Nov 2022 - May 2026)"],
  "experience": ["Placemantra - AI Intern (Jan 2025 - Mar 2025): Developed ML models, deployed FastAPI+Docker pipelines reducing latency 46%"],
  "skills": ["Python", "PyTorch", "TensorFlow", "LangChain", "FastAPI", "Docker", "AWS"],
  "certifications": ["Oracle Cloud Infrastructure 2025 Certified AI Professional"],
  "projects": ["FinPilot: Autonomous finance platform built with LangGraph, FastAPI, Next.js and SQLite"],
  "years_experience": 1.0
}}

Resume Text:
{safe_text[:8000]}
"""
        raw = "{}"
        try:
            raw = generate_json(prompt, max_tokens=2500)

            # Strip any accidental markdown code fences
            cleaned = raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            data = json.loads(cleaned)

            list_keys = ["education", "experience", "skills", "certifications", "projects"]
            str_keys = ["name", "email", "phone"]

            for key in list_keys + str_keys + ["years_experience"]:
                if key not in data:
                    data[key] = [] if key in list_keys else ""

            # Enforce list fields are lists of strings
            for key in list_keys:
                if not isinstance(data[key], list):
                    data[key] = []
                else:
                    data[key] = [str(item).replace('\n', ' ').strip() for item in data[key] if item]

            try:
                data["years_experience"] = float(data.get("years_experience", 0.0))
            except Exception:
                data["years_experience"] = 0.0

            return data

        except Exception as e:
            logger.error(f"Gemini resume parsing failed: {e}")
            logger.error(f"Raw Gemini response (first 500 chars): {raw[:500]}")
            return None

    def parse(self, file_path: str) -> dict:
        """Full parse pipeline: returns structured candidate data."""
        text = self.extract_text(file_path)

        if text:
            parsed = self.parse_with_gemini(text)
            if parsed:
                parsed["raw_text"] = text
                logger.info(f"[Parser Agent - Gemini] Successfully parsed: {parsed.get('name', 'Unknown')}")
                return parsed

        logger.warning("[Parser Agent - Fallback] Using regex-based heuristics for parsing.")
        sections = self.extract_sections(text)

        return {
            "raw_text": text,
            "name": self.extract_name(text),
            "email": self.extract_email(text),
            "phone": self.extract_phone(text),
            "education": sections["education"],
            "experience": sections["experience"],
            "skills": sections["skills"],
            "certifications": sections["certifications"],
            "projects": sections["projects"],
            "years_experience": self.estimate_experience(text, sections.get("experience", []))
        }
