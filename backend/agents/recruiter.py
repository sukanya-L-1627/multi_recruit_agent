import json
import re
import logging
from typing import List, Dict
from tools.gemini_client import generate_json

logger = logging.getLogger(__name__)

class RecruiterSummaryAgent:
    def run(self, candidate_name: str, skills: List[str], ats_score: float, years_exp: float, jd_text: str,
            education: List = None, experience: List = None, projects: List = None, alignment_reasoning: str = None,
            missing_skills: List[str] = None) -> Dict:
        
        skills_str = ", ".join(skills[:25]) if skills else "N/A"
        missing_skills_str = ", ".join(missing_skills[:25]) if missing_skills else "N/A"
        education_str = "\n".join([f"- {e}" for e in education]) if education else "N/A"
        experience_str = "\n".join([f"- {e}" for e in experience]) if experience else "N/A"
        projects_str = "\n".join([f"- {p}" for p in projects]) if projects else "N/A"
        alignment_context = f"Candidate qualitative fit insight: {alignment_reasoning}" if alignment_reasoning else ""

        prompt = f"""You are a seasoned HR director and technical recruitment expert. Create an impactful and highly detailed executive candidate assessment report.
Candidate Name: {candidate_name}
Years of Experience: {years_exp} years
ATS Score: {ats_score}/100
Skills Identified: {skills_str}
Missing Skills Identified: {missing_skills_str}

Candidate Education:
{education_str}

Candidate Experience Details:
{experience_str}

Candidate Projects:
{projects_str}

Job Description Details:
{jd_text[:4000]}

{alignment_context}

Follow these candidate recommendation rules:
- ATS Score >= 85: "Strongly Recommend"
- ATS Score >= 70: "Recommend"
- ATS Score >= 50: "Consider"
- ATS Score < 50: "Reject"

Your output must be a highly detailed, professional, and comprehensive candidate evaluation.
Return ONLY valid JSON matching this schema exactly. Do not include any formatting, explanations, or markdown code blocks:
{{
  "summary": "An insightful 3-4 sentence professional executive summary highlighting the candidate's career level, main specialties, and alignment with the team's needs.",
  "strengths": [
    "A concise, concrete strength with specific mention of their projects or achievements",
    "Another specific concrete strength from their job history",
    "A technical strength matching the job description"
  ],
  "weaknesses": [
    "A professional, constructive area for improvement or a minor technical gap relative to the job requirements",
    "Another constructive gap or ramp-up area"
  ],
  "missing_skills": ["Missing technical skill 1", "Missing technical skill 2"],
  "recommendation": "Strongly Recommend",
  "fit_score": 85.0
}}"""

        try:
            raw = generate_json(prompt, max_tokens=1000)
            cleaned = raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            match = re.search(r'\{[\s\S]*\}', cleaned)
            if match:
                data = json.loads(match.group())
                
                # Validate essential keys are present and not empty
                if not data.get("summary") or not data.get("strengths") or not data.get("weaknesses"):
                    raise ValueError("LLM response is missing required summary, strengths, or weaknesses keys.")
                
                # Enforce thresholds even for LLM output
                if ats_score >= 85: data["recommendation"] = "Strongly Recommend"
                elif ats_score >= 70: data["recommendation"] = "Recommend"
                elif ats_score >= 50: data["recommendation"] = "Consider"
                else: data["recommendation"] = "Reject"
                data["fit_score"] = ats_score
                # Ensure missing_skills is populated
                if (not data.get("missing_skills") or len(data.get("missing_skills")) == 0) and missing_skills:
                    data["missing_skills"] = missing_skills
                return data
        except Exception as e:
            logger.error(f"Gemini recruiter summary generation failed or returned incomplete data: {e}")

        # Fallback
        rec = (
            "Strongly Recommend" if ats_score >= 85 else
            "Recommend" if ats_score >= 70 else
            "Consider" if ats_score >= 50 else "Reject"
        )

        # 1. Dynamic Strengths
        dynamic_strengths = []
        if years_exp > 0:
            dynamic_strengths.append(f"Demonstrates a solid background of {years_exp} years of relevant professional experience.")
        else:
            dynamic_strengths.append("Possesses foundational technical knowledge and academic/project exposure.")

        if skills:
            top_skills = [s.title() for s in skills[:3]]
            dynamic_strengths.append(f"Proficient in core technical competencies, particularly in {', '.join(top_skills)}.")
        else:
            dynamic_strengths.append("Shows basic technical knowledge and familiarity with software concepts.")

        if ats_score >= 70:
            dynamic_strengths.append(f"Strong overall alignment with job description requirements, achieving an ATS score of {ats_score}/100.")
        else:
            dynamic_strengths.append("Maintains basic skill alignment with the key expectations of the position.")

        # 2. Dynamic Areas to Improve / Weaknesses
        dynamic_weaknesses = []
        if missing_skills:
            top_missing = [s.title() for s in missing_skills[:2]]
            dynamic_weaknesses.append(f"Needs to acquire and ramp up on critical job requirements: {', '.join(top_missing)}.")
        else:
            dynamic_weaknesses.append("Requires standard onboarding on team-specific development methodologies.")

        if years_exp < 2:
            dynamic_weaknesses.append("Could benefit from technical mentorship to accelerate professional growth.")
        else:
            dynamic_weaknesses.append("May need to adjust to different engineering patterns and enterprise scale constraints.")

        # 3. Dynamic 3-4 sentence Summary
        exp_phrase = f"{years_exp} years of professional experience" if years_exp > 0 else "a fresh professional profile"
        skills_phrase = f" with competencies in {', '.join(skills[:3])}" if skills else ""
        missing_phrase = f" though additional learning is required for {', '.join(missing_skills[:2])}" if missing_skills else ""
        
        # Sentence 1: General profile and experience
        sentence_1 = f"{candidate_name} presents {exp_phrase}{skills_phrase}."
        
        # Sentence 2: Strengths & technical focus
        if skills:
            sentence_2 = f"Their technical specialties include {', '.join(skills[:4])}, indicating a strong baseline in software development."
        else:
            sentence_2 = f"Their resume demonstrates a foundational focus in engineering, supporting their potential for further growth."
            
        # Sentence 3: Alignment & missing items
        sentence_3 = f"They achieved an ATS compatibility score of {ats_score}/100{missing_phrase}."
        
        # Sentence 4: Final Recommendation
        sentence_4 = f"Consequently, they are evaluated as a candidate to '{rec.lower()}' for the recruitment pipeline."

        dynamic_summary = f"{sentence_1} {sentence_2} {sentence_3} {sentence_4}"

        return {
            "summary": dynamic_summary,
            "strengths": dynamic_strengths,
            "weaknesses": dynamic_weaknesses,
            "missing_skills": missing_skills or [],
            "recommendation": rec,
            "fit_score": ats_score
        }
