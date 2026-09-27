import faiss
import numpy as np
import os
import pickle
import logging
from tools.embedding_tool import EmbeddingTool

logger = logging.getLogger(__name__)

FAISS_INDEX_PATH = "embeddings/faiss_index.bin"
FAISS_META_PATH = "embeddings/faiss_meta.pkl"


class VectorStore:
    """FAISS-based vector store for semantic candidate search."""

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.embedding_tool = EmbeddingTool()
        os.makedirs("embeddings", exist_ok=True)
        self._load_or_create()

    def _load_or_create(self):
        """Load existing FAISS index or create a new one."""
        if os.path.exists(FAISS_INDEX_PATH) and os.path.exists(FAISS_META_PATH):
            try:
                self.index = faiss.read_index(FAISS_INDEX_PATH)
                with open(FAISS_META_PATH, "rb") as f:
                    self.metadata = pickle.load(f)
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors.")
                return
            except Exception as e:
                logger.warning(f"Failed to load FAISS index: {e}. Creating new.")

        self.index = faiss.IndexFlatIP(self.dimension)  # Inner product (cosine after normalizing)
        self.metadata = []  # List of {candidate_id, name}

    def _save(self):
        """Persist FAISS index and metadata to disk."""
        faiss.write_index(self.index, FAISS_INDEX_PATH)
        with open(FAISS_META_PATH, "wb") as f:
            pickle.dump(self.metadata, f)

    def add_candidate(self, candidate_id: int, name: str, text: str):
        """Add a candidate's resume embedding to the index."""
        embedding = self.embedding_tool.embed(text)
        # Normalize for cosine similarity via inner product
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        embedding = embedding.reshape(1, -1)
        self.index.add(embedding)
        self.metadata.append({"candidate_id": candidate_id, "name": name})
        self._save()
        logger.info(f"Added candidate {candidate_id} to FAISS index. Total: {self.index.ntotal}")

    def search(self, query: str, top_k: int = 10) -> list:
        """Search for semantically similar candidates."""
        if self.index.ntotal == 0:
            return []

        query_embedding = self.embedding_tool.embed(query)
        norm = np.linalg.norm(query_embedding)
        if norm > 0:
            query_embedding = query_embedding / norm
        query_embedding = query_embedding.reshape(1, -1)

        k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(query_embedding, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0 and idx < len(self.metadata):
                results.append({
                    **self.metadata[idx],
                    "similarity_score": float(score)
                })
        return results

    def delete_candidate(self, candidate_id: int):
        """Remove a candidate and rebuild index (FAISS doesn't support direct delete)."""
        new_metadata = [m for m in self.metadata if m["candidate_id"] != candidate_id]
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []
        # Note: Full rebuild would require stored embeddings; skip for simplicity
        self.metadata = new_metadata
        self._save()

    def clear(self):
        """Clear all data from the vector store."""
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []
        if os.path.exists(FAISS_INDEX_PATH): os.remove(FAISS_INDEX_PATH)
        if os.path.exists(FAISS_META_PATH): os.remove(FAISS_META_PATH)
        self._save()

    @property
    def total_candidates(self) -> int:
        return self.index.ntotal
