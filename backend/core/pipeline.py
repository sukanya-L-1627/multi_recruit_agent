"""
Core recruitment pipeline - orchestrates all 7 AI agents sequentially using the new task-based structure.
"""
from typing import Dict, Any, List
from tasks.recruitment_tasks import RecruitmentTasks

# Initialize tasks
tasks = RecruitmentTasks()

async def run_full_pipeline(
    file_path: str, jd_text: str,
    job_title: str, send_email: bool = False,
    status_callback=None
) -> Dict[str, Any]:
    """Orchestrates the full pipeline using RecruitmentTasks."""
    return await tasks.process_resume_task(file_path, jd_text, job_title, send_email, status_callback)

def candidate_ranking_agent(candidates_data: List[Dict]) -> List[Dict]:
    """Ranks candidates using the ranking task."""
    return tasks.rank_candidates_task(candidates_data)

def skill_extraction_agent(raw_text: str) -> Dict:
    """Extracts skills using the skill extraction agent within tasks."""
    return tasks.skill_extractor.run(raw_text)
