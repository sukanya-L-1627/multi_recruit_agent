import logging
from typing import Dict
from tools.ats_calculator import ATSCalculator

logger = logging.getLogger(__name__)

class ATSScoringAgent:
    def __init__(self):
        self.calculator = ATSCalculator()

    def run(self, resume_text: str, jd_text: str) -> Dict:
        result = self.calculator.calculate(resume_text, jd_text)
        logger.info(f"[ATS Agent] Score: {result['score']}")
        return result
