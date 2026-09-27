import os
import sys
import logging
import asyncio

# Ensure backend/ is on the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.pipeline import run_full_pipeline
from database.models import init_db

logging.basicConfig(level=logging.INFO)

def test():
    init_db()
    file_path = "resumes/Kiran_Babu_Bandela_Resume.pdf"
    if not os.path.exists(file_path):
        print(f"File {file_path} not found!")
        return

    print(f"Testing pipeline with {file_path}...")
    result = asyncio.run(run_full_pipeline(
        file_path=file_path,
        jd_text="Looking for an AI Engineer with experience in Python, LLMs, and RAG.",
        job_title="AI Engineer",
        send_email=False
    ))
    
    if result.get("success"):
        print("Pipeline SUCCESS!")
        print(f"Name: {result['parsed'].get('name')}")
        print(f"ATS Score: {result['ats'].get('score')}")
    else:
        print("Pipeline FAILED!")
        print(f"Error: {result.get('error')}")

if __name__ == "__main__":
    test()
