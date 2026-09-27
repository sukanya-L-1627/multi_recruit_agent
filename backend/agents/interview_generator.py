import json
import re
from typing import List, Dict
from tools.gemini_client import generate_json

class InterviewGeneratorAgent:
    def run(self, candidate_name: str, skills: List[str], jd_text: str) -> Dict:
        skills_str = ", ".join(skills[:15]) if skills else "General Programming"
        prompt = f"""You are an expert technical interviewer. Generate interview questions.
Candidate Skills: {skills_str}
Job Description: {jd_text[:400]}

Return ONLY valid JSON:
{{
  "technical_questions": ["Q1","Q2","Q3","Q4","Q5"],
  "behavioral_questions": ["Q1","Q2","Q3"],
  "project_questions": ["Q1","Q2","Q3"]
}}"""
        raw = generate_json(prompt, max_tokens=800)
        try:
            match = re.search(r'\{[\s\S]*\}', raw)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        
        return {
            "technical_questions": [
                f"Explain your experience with {skills[0] if skills else 'Python'}.",
                "Describe a challenging technical problem you solved.",
                "How do you approach system design at scale?",
                "Explain the difference between REST and GraphQL.",
                "How do you handle production incidents?"
            ],
            "behavioral_questions": [
                "Tell me about a time you led a team under pressure.",
                "Describe a conflict and how you resolved it.",
                "How do you prioritize competing deadlines?"
            ],
            "project_questions": [
                "Walk me through your most impactful project.",
                "What was the biggest challenge in that project?",
                "How did you measure project success?"
            ]
        }
