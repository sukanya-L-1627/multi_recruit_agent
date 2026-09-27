import logging
from typing import Dict
from tools.pdf_parser import PDFParser

logger = logging.getLogger(__name__)

class ResumeParserAgent:
    def __init__(self):
        self.parser = PDFParser()

    def run(self, file_path: str) -> Dict:
        parsed = self.parser.parse(file_path)
        logger.info(f"[Parser Agent] Parsed: {parsed.get('name', 'Unknown')}")
        return parsed
