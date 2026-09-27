from typing import Dict
from tools.email_tool import EmailTool

class EmailAutomationAgent:
    def __init__(self):
        self.email_tool = EmailTool()

    def run(self, candidate_name: str, candidate_email: str, job_title: str, recommendation: str) -> Dict:
        if recommendation in ["Strongly Recommend", "Recommend"]:
            result = self.email_tool.shortlist_email(candidate_name, candidate_email, job_title)
            email_type = "shortlist"
        elif recommendation == "Consider":
            result = self.email_tool.interview_invite_email(candidate_name, candidate_email, job_title)
            email_type = "interview_invite"
        else:
            result = self.email_tool.rejection_email(candidate_name, candidate_email, job_title)
            email_type = "rejection"
        return {"email_type": email_type, **result}
