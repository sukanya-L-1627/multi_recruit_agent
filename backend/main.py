"""
Backend entry point — run with: uvicorn main:app --reload --port 8000
"""
import sys
import os

# Ensure the backend directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.main import app  # noqa: F401 - imported for uvicorn
