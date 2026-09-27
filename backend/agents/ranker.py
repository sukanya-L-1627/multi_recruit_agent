from typing import List, Dict

class CandidateRankingAgent:
    def run(self, candidates_data: List[Dict]) -> List[Dict]:
        def rank_key(c):
            ats = c.get("ats_score", 0) or 0
            exp = min(c.get("years_experience", 0) or 0, 15) * 2
            skill_count = len(c.get("all_skills", [])) * 0.5
            return ats * 0.6 + exp + skill_count
        
        ranked = sorted(candidates_data, key=rank_key, reverse=True)
        for i, c in enumerate(ranked):
            c["rank"] = i + 1
        return ranked
