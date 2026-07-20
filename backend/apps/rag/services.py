"""
RAG App - Service Layer
========================
RAG = Retrieval Augmented Generation

HOW RAG WORKS:
1. User uploads a PDF
2. We extract text and split into chunks
3. Each chunk is converted to a "vector" (embedding) - a list of numbers
   that represents the MEANING of the text
4. These vectors are stored in FAISS (a vector database)
5. When generating a quiz, we find chunks that are semantically similar
   to the quiz topic using vector similarity search
6. These relevant chunks are given to Gemini as context for quiz generation

WHY EMBEDDINGS?
- Regular search is keyword-based: "find documents containing 'photosynthesis'"
- Semantic search understands meaning: it knows "plants making food from sunlight"
  is related to photosynthesis even without the exact word
- Embeddings are vectors in a high-dimensional space where similar meanings
  are closer together

FAISS (Facebook AI Similarity Search):
- Ultra-fast similarity search in vector spaces
- We save indexes to disk so they persist between server restarts
"""

import os
import logging
import requests
import pickle
import numpy as np
from pathlib import Path
from django.conf import settings
import cloudinary.uploader

logger = logging.getLogger('apps.rag')


class EmbeddingService:
    """
    Generates text embeddings using the Jina embeddings API.

    An embedding converts text to a vector (list of numbers).
    Example: "Hello world" -> [0.1, 0.5, -0.3, 0.8, ...]
    Similar texts have similar vectors (close in vector space).
    """

    def __init__(self):
        self.api_key = os.getenv('JINA_API_KEY') or getattr(settings, 'JINA_API_KEY', None)
        self.model_name = os.getenv('JINA_EMBEDDING_MODEL', 'jina-embeddings-v3')
        self.base_url = os.getenv('JINA_EMBEDDINGS_URL', 'https://api.jina.ai/v1/embeddings')

    def _generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        if not self.api_key:
            raise RuntimeError('JINA_API_KEY is not configured.')

        response = requests.post(
            self.base_url,
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'input': texts,
                'model': self.model_name,
            },
            timeout=60,
        )
        response.raise_for_status()

        payload = response.json()
        embeddings = []
        for item in payload.get('data', []):
            embedding = item.get('embedding')
            if embedding is None:
                raise ValueError('Jina API returned an embedding payload without vector data.')
            embeddings.append(embedding)

        if len(embeddings) != len(texts):
            raise ValueError('Jina API returned an unexpected number of embeddings.')

        return embeddings

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """
        Convert a list of texts to embeddings.

        Args:
            texts: List of text strings

        Returns:
            List of embedding vectors (each is a list of floats)
        """
        try:
            embeddings = self._generate_embeddings(list(texts))
            logger.info(f"Generated {len(embeddings)} embeddings")
            return embeddings
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise

    def embed_query(self, query: str) -> list[float]:
        """
        Convert a single query string to an embedding.
        Used for similarity search.
        """
        try:
            embeddings = self._generate_embeddings([query])
            return embeddings[0]
        except Exception as e:
            logger.error(f"Query embedding failed: {e}")
            raise


class FAISSService:
    """
    Manages FAISS vector indexes for semantic search.

    FAISS stores vectors and allows super-fast similarity search.
    We create one FAISS index per document.

    Index storage: faiss_indexes/<document_id>/
    - index.faiss: The FAISS index file
    - metadata.pkl: Chunk metadata (text content, chunk index, etc.)
    """

    def __init__(self):
        self.index_base_path = Path(settings.FAISS_INDEX_PATH)
        self.index_base_path.mkdir(parents=True, exist_ok=True)
        self.embedding_service = EmbeddingService()

    def _get_index_path(self, index_id: str) -> Path:
        return self.index_base_path / index_id

    def _normalize_vectors(self, vectors: np.ndarray) -> np.ndarray:
        """Normalize vectors to unit length for cosine similarity search."""
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return vectors / norms

    def _normalize_query_vector(self, vector: np.ndarray) -> np.ndarray:
        """Normalize a single query vector to unit length."""
        norm = np.linalg.norm(vector)
        if norm == 0:
            return vector
        return vector / norm

    def index_document(self, document) -> dict:
        """
        Generate embeddings for all chunks of a document and store in FAISS.

        Args:
            document: UploadedDocument instance

        Returns:
            dict with 'success', 'index_id', 'vector_count', 'error'
        """
        try:
            from apps.documents.models import DocumentChunk
            import faiss

            chunks = list(DocumentChunk.objects.filter(document=document).order_by('chunk_index'))

            if not chunks:
                raise ValueError("No chunks found. Run chunking first.")

            logger.info(f"Generating embeddings for {len(chunks)} chunks of document {document.id}")

            # Extract text from chunks
            texts = [chunk.content for chunk in chunks]

            # Generate embeddings
            embeddings = self.embedding_service.embed_texts(texts)

            if not embeddings:
                raise ValueError("No embeddings were generated.")

            # Convert to numpy array (FAISS requires this)
            embedding_matrix = np.array(embeddings, dtype='float32')
            dimension = embedding_matrix.shape[1]

            # Normalize embeddings for cosine similarity search
            embedding_matrix = self._normalize_vectors(embedding_matrix)

            # Create FAISS index
            # IndexFlatIP: Inner product search on normalized vectors equals cosine similarity
            faiss_index = faiss.IndexFlatIP(dimension)
            faiss_index.add(embedding_matrix)

            # Create metadata: maps vector index to chunk info
            metadata = {
                i: {
                    'chunk_id': str(chunks[i].id),
                    'chunk_index': chunks[i].chunk_index,
                    'content': chunks[i].content,
                    'document_id': str(document.id),
                    'document_title': document.title,
                }
                for i in range(len(chunks))
            }

            # Save to disk
            index_id = str(document.id)
            index_path = self._get_index_path(index_id)
            index_path.mkdir(parents=True, exist_ok=True)

            faiss.write_index(faiss_index, str(index_path / 'index.faiss'))
            with open(index_path / 'metadata.pkl', 'wb') as f:
                pickle.dump(metadata, f)

            # Upload FAISS index
            faiss_upload = cloudinary.uploader.upload(
                str(index_path / "index.faiss"),
                resource_type="raw",
                folder="faiss_indexes"
            )

            # Upload metadata
            metadata_upload = cloudinary.uploader.upload(
                str(index_path / "metadata.pkl"),
                resource_type="raw",
                folder="faiss_indexes"
            )

            logger.info(f"FAISS uploaded: {faiss_upload['secure_url']}")
            logger.info(f"Metadata uploaded: {metadata_upload['secure_url']}")

            document.faiss_index_url = faiss_upload["secure_url"]
            document.faiss_metadata_url = metadata_upload["secure_url"]
            
            # Update document with index ID
            document.faiss_index_id = index_id

            document.save(
                update_fields=[
                    'faiss_index_id',
                    'faiss_index_url',
                    'faiss_metadata_url'
                ]
            )

            logger.info(
                f"FAISS index created for document {document.id}. "
                f"Vectors: {faiss_index.ntotal}, Dimension: {dimension}"
            )

            return {
                'success': True,
                'index_id': index_id,
                'vector_count': faiss_index.ntotal,
                'error': None
            }

        except Exception as e:
            error_msg = str(e)
            logger.error(f"FAISS indexing failed for document {document.id}: {error_msg}")
            return {'success': False, 'index_id': None, 'vector_count': 0, 'error': error_msg}

    def search(self, index_id: str, query: str, top_k: int = 5) -> list[dict]:
        """
        Search for the most semantically similar chunks to a query.

        Args:
            index_id: The FAISS index ID (= document ID)
            query: The search query text
            top_k: Number of most similar results to return

        Returns:
            List of dicts with chunk content and similarity scores
        """
        try:
            import faiss

            index_path = self._get_index_path(index_id)
            index_file = index_path / 'index.faiss'
            metadata_file = index_path / 'metadata.pkl'

            if not index_file.exists():
                logger.warning(
                    f"FAISS index missing locally. Restoring from Cloudinary..."
                )

                self.restore_index(index_id)

            # Load the index and metadata
            faiss_index = faiss.read_index(str(index_file))
            with open(metadata_file, 'rb') as f:
                metadata = pickle.load(f)

            # Embed and normalize the query
            query_embedding = self.embedding_service.embed_query(query)
            query_vector = np.array([query_embedding], dtype='float32')
            query_vector = np.array([self._normalize_query_vector(query_vector[0])], dtype='float32')

            # Search: returns similarity scores and indices of top_k most similar vectors
            similarities, indices = faiss_index.search(query_vector, top_k)

            results = []
            for i, (sim, idx) in enumerate(zip(similarities[0], indices[0])):
                if idx == -1:  # FAISS returns -1 for missing results
                    continue
                chunk_meta = metadata.get(int(idx), {})
                results.append({
                    'rank': i + 1,
                    'score': float(sim),
                    'similarity': float(sim),
                    **chunk_meta
                })

            logger.info(f"FAISS search returned {len(results)} results for query: {query[:50]}")
            return results

        except Exception as e:
            logger.error(f"FAISS search failed for index {index_id}: {e}")
            return []

    def search_multiple_documents(
        self,
        document_ids: list[str],
        query: str,
        top_k: int = 5
    ) -> list[dict]:
        """
        Search across multiple documents and return the best results.
        Used when generating a quiz based on multiple documents.
        """
        all_results = []
        for doc_id in document_ids:
            results = self.search(str(doc_id), query, top_k=top_k)
            all_results.extend(results)

        # Sort by score (higher is better) and return top_k
        all_results.sort(key=lambda x: x['score'], reverse=True)
        return all_results[:top_k]



    def restore_index(self, index_id):
        from apps.documents.models import UploadedDocument

        document = UploadedDocument.objects.get(
            faiss_index_id=index_id
        )

        index_path = self._get_index_path(index_id)
        index_path.mkdir(parents=True, exist_ok=True)

        index_response = requests.get(
            document.faiss_index_url
        )

        metadata_response = requests.get(
            document.faiss_metadata_url
        )

        with open(index_path / "index.faiss", "wb") as f:
            f.write(index_response.content)

        with open(index_path / "metadata.pkl", "wb") as f:
            f.write(metadata_response.content)

        logger.info(
            f"Restored FAISS index: {index_id}"
        )

    def delete_index(self, index_id: str) -> bool:
        """Delete a FAISS index from disk."""
        import shutil
        index_path = self._get_index_path(index_id)
        if index_path.exists():
            shutil.rmtree(index_path)
            logger.info(f"FAISS index deleted: {index_id}")
            return True
        return False
