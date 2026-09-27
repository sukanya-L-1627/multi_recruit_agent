import logging
from typing import Dict, Any, List
from agents.resume_parser import ResumeParserAgent
from agents.skill_extractor import SkillExtractionAgent
from agents.ats_scorer import ATSScoringAgent
from agents.ranker import CandidateRankingAgent
from agents.interview_generator import InterviewGeneratorAgent
from agents.recruiter import RecruiterSummaryAgent
from agents.email_agent import EmailAutomationAgent

logger = logging.getLogger(__name__)

class RecruitmentTasks:
    def __init__(self):
        self.parser = ResumeParserAgent()
        self.skill_extractor = SkillExtractionAgent()
        self.ats_scorer = ATSScoringAgent()
        self.ranker = CandidateRankingAgent()
        self.interview_gen = InterviewGeneratorAgent()
        self.recruiter = RecruiterSummaryAgent()
        self.email_agent = EmailAutomationAgent()

    async def process_resume_task(
        self, 
        file_path: str, 
        jd_text: str, 
        job_title: str, 
        send_email: bool = False,
        status_callback=None
    ) -> Dict[str, Any]:
        """Task to process a single resume through the pipeline with progress updates."""
        try:
            async def notify(agent: str, status: str, detail: str = ""):
                if status_callback:
                    await status_callback({
                        "agent": agent,
                        "status": status,
                        "message": detail,
                        "timestamp": __import__("datetime").datetime.now().isoformat()
                    })

            # 1. Parse Resume
            await notify("Resume Parser Agent", "working", "Extracting text and structure from PDF...")
            parsed = self.parser.run(file_path)
            raw_text = parsed.get("raw_text", "")
            if not raw_text:
                raise ValueError("Could not extract any text from the PDF. It might be empty or scanned.")
            await notify("Resume Parser Agent", "completed", f"Parsed: {parsed.get('name', 'Unknown')}")
            
            # 2. Extract Skills
            await notify("Skill Extraction Agent", "working", "Analyzing skills and categories...")
            skill_data = self.skill_extractor.run(raw_text)
            all_skills = skill_data.get("all_skills", [])
            await notify("Skill Extraction Agent", "completed", f"Found {len(all_skills)} relevant skills")
            
            # 3. ATS Scoring
            await notify("ATS Scoring Agent", "working", "Calculating semantic similarity and keyword match...")
            ats_data = self.ats_scorer.run(raw_text, jd_text)
            await notify("ATS Scoring Agent", "completed", f"ATS Score: {ats_data.get('score', 0)}%")
            
            # 4. Generate Interview Questions
            await notify("Interview Question Agent", "working", "Generating custom technical and behavioral questions...")
            interview_qs = self.interview_gen.run(parsed.get("name", "Candidate"), all_skills, jd_text)
            await notify("Interview Question Agent", "completed", "Questions generated successfully")
            
            # 5. Generate Recruiter Summary
            await notify("Recruiter Summary Agent", "working", "Writing executive summary and recommendations...")
            
            # Programmatically calculate missing skills from JD and candidate skills
            try:
                jd_skills = set(self.skill_extractor.extractor.get_flat_skills(jd_text))
                candidate_skills = set(all_skills)
                missing_skills = list(jd_skills - candidate_skills)
            except Exception as e:
                logger.error(f"Error computing missing skills programmatically: {e}")
                missing_skills = []

            summary = self.recruiter.run(
                candidate_name=parsed.get("name", "Candidate"), 
                skills=all_skills,
                ats_score=ats_data.get("score", 0), 
                years_exp=parsed.get("years_experience", 0), 
                jd_text=jd_text,
                education=parsed.get("education", []),
                experience=parsed.get("experience", []),
                projects=parsed.get("projects", []),
                alignment_reasoning=ats_data.get("alignment_reasoning", ""),
                missing_skills=missing_skills
            )
            await notify("Recruiter Summary Agent", "completed", f"Recommendation: {summary.get('recommendation', 'N/A')}")
            
            # 6. Email Automation
            email_result = None
            if send_email and parsed.get("email"):
                await notify("Email Automation Agent", "working", f"Sending {summary.get('recommendation')} email...")
                email_result = self.email_agent.run(
                    parsed.get("name", "Candidate"), 
                    parsed.get("email"),
                    job_title, 
                    summary.get("recommendation", "Consider")
                )
                await notify("Email Automation Agent", "completed", "Email delivery successful")
            
            return {
                "success": True,
                "parsed": parsed, 
                "skills": skill_data,
                "ats": ats_data, 
                "interview_questions": interview_qs,
                "summary": summary, 
                "email_result": email_result
            }
        except Exception as e:
            logger.error(f"Task error: {e}", exc_info=True)
            if status_callback:
                await status_callback({"agent": "System", "status": "failed", "message": str(e)})
            return {"success": False, "error": str(e)}

    def rank_candidates_task(self, candidates_data: List[Dict]) -> List[Dict]:
        """Task to rank a list of candidates."""
        return self.ranker.run(candidates_data)
