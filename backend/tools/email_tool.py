import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class EmailTool:
    """Sends automated recruitment emails via SMTP."""

    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.enabled = bool(self.smtp_user and self.smtp_password)

    def send(self, to_email: str, subject: str, body: str) -> dict:
        """Send an email. Falls back to mock if SMTP not configured."""
        if not self.enabled:
            logger.info(f"[MOCK EMAIL] To: {to_email} | Subject: {subject}")
            return {"status": "mock_sent", "to": to_email, "subject": subject}

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = "HR Team <hr@gmail.com>"
            msg["To"] = to_email
            msg.attach(MIMEText(body, "html"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.smtp_user, to_email, msg.as_string())

            logger.info(f"Email sent to {to_email}")
            return {"status": "sent", "to": to_email}
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            return {"status": "failed", "error": str(e)}

    def shortlist_email(self, candidate_name: str, to_email: str, job_title: str) -> dict:
        subject = f"🎉 Congratulations! You've been Shortlisted – {job_title}"
        body = f"""
        <html><body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#4F46E5;">Dear {candidate_name},</h2>
        <p>We are pleased to inform you that your application for <strong>{job_title}</strong> 
        has been shortlisted after a thorough review by our AI recruitment system.</p>
        <p>Our team will contact you soon with next steps for the interview process.</p>
        <p>Best regards,<br><strong>Recruitment Team</strong></p>
        </body></html>
        """
        return self.send(to_email, subject, body)

    def rejection_email(self, candidate_name: str, to_email: str, job_title: str) -> dict:
        subject = f"Update on Your Application – {job_title}"
        body = f"""
        <html><body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Dear {candidate_name},</h2>
        <p>Thank you for applying for the <strong>{job_title}</strong> position. 
        After careful consideration, we have decided to move forward with other candidates 
        whose experience more closely matches our current needs.</p>
        <p>We encourage you to apply for future openings. Best of luck!</p>
        <p>Best regards,<br><strong>Recruitment Team</strong></p>
        </body></html>
        """
        return self.send(to_email, subject, body)

    def interview_invite_email(self, candidate_name: str, to_email: str, job_title: str) -> dict:
        subject = f"Interview Invitation – {job_title}"
        body = f"""
        <html><body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#10B981;">Dear {candidate_name},</h2>
        <p>We are excited to invite you for an interview for the <strong>{job_title}</strong> role.</p>
        <p>Please reply to this email with your availability for the next 5 business days.</p>
        <p>Best regards,<br><strong>Recruitment Team</strong></p>
        </body></html>
        """
        return self.send(to_email, subject, body)
