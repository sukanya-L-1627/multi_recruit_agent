import re
from typing import Dict, List

SKILL_TAXONOMY = {
    "programming": [
        "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
        "ruby", "swift", "kotlin", "scala", "r", "matlab", "bash", "shell", "perl"
    ],
    "ai_ml": [
        "machine learning", "deep learning", "neural network", "tensorflow", "pytorch",
        "keras", "scikit-learn", "xgboost", "lightgbm", "computer vision", "reinforcement learning",
        "generative ai", "llm", "transformers", "bert", "gpt", "stable diffusion",
        "crewai", "langchain", "langgraph", "autogen", "hugging face", "openai",
        "gemini", "claude", "mistral", "rag", "vector database", "embeddings"
    ],
    "nlp": [
        "nlp", "natural language processing", "spacy", "nltk", "text classification",
        "named entity recognition", "ner", "sentiment analysis", "text generation",
        "question answering", "summarization", "tokenization", "word2vec", "fasttext"
    ],
    "databases": [
        "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle",
        "cassandra", "elasticsearch", "dynamodb", "neo4j", "influxdb", "supabase"
    ],
    "cloud": [
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
        "ansible", "ci/cd", "jenkins", "github actions", "cloudformation", "lambda",
        "ec2", "s3", "gke", "aks", "eks"
    ],
    "frameworks": [
        "fastapi", "flask", "django", "spring", "express", "react", "next.js",
        "vue", "angular", "svelte", "node.js", "graphql", "rest api", "grpc",
        "streamlit", "gradio", "celery", "airflow", "spark", "kafka"
    ],
    "vector_db": [
        "faiss", "pinecone", "weaviate", "chroma", "milvus", "qdrant", "pgvector"
    ],
    "tools": [
        "git", "github", "gitlab", "jira", "confluence", "notion", "postman",
        "jupyter", "vscode", "linux", "unix", "agile", "scrum", "devops"
    ]
}


class SkillExtractor:
    """Extracts and categorizes technical skills from resume text."""

    def __init__(self):
        self._build_flat_map()

    def _build_flat_map(self):
        """Build a flat mapping of skill → category for fast lookup."""
        self.skill_to_category = {}
        for category, skills in SKILL_TAXONOMY.items():
            for skill in skills:
                self.skill_to_category[skill.lower()] = category

    def extract(self, text: str) -> Dict[str, List[str]]:
        """Extract skills from text and return categorized dict."""
        text_lower = text.lower()
        found: Dict[str, List[str]] = {cat: [] for cat in SKILL_TAXONOMY}

        for skill, category in self.skill_to_category.items():
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                # Normalize to title case
                normalized = skill.title()
                if normalized not in found[category]:
                    found[category].append(normalized)

        # Also extract any comma-separated words in skill lines
        skill_line_pattern = r'(?:skills?|technologies|tools?)[\s:]*([^\n]+)'
        for match in re.finditer(skill_line_pattern, text_lower):
            items = re.split(r'[,|•·\|/]', match.group(1))
            for item in items:
                item = item.strip()
                if item and item in self.skill_to_category:
                    cat = self.skill_to_category[item]
                    normalized = item.title()
                    if normalized not in found[cat]:
                        found[cat].append(normalized)

        return found

    def get_flat_skills(self, text: str) -> List[str]:
        """Get a flat list of all skills found."""
        categorized = self.extract(text)
        all_skills = []
        for skills in categorized.values():
            all_skills.extend(skills)
        return list(set(all_skills))
