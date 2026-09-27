import numpy as np
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

_model_instance = None


def get_embedding_model():
    global _model_instance
    if _model_instance is None:
        _model_instance = SentenceTransformer("all-MiniLM-L6-v2")
    return _model_instance


class EmbeddingTool:
    """Generates text embeddings using Sentence Transformers."""

    def __init__(self):
        self.model = get_embedding_model()
        self.dimension = 384

    def embed(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.astype("float32")
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            return np.zeros(self.dimension, dtype="float32")

    def embed_batch(self, texts: list) -> np.ndarray:
        """Generate embeddings for a batch of texts."""
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings.astype("float32")
        except Exception as e:
            logger.error(f"Batch embedding error: {e}")
            return np.zeros((len(texts), self.dimension), dtype="float32")

    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Compute cosine similarity between two vectors."""
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.dot(vec1, vec2) / (norm1 * norm2))
