import os
import unittest
from unittest.mock import patch

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django

django.setup()

from apps.rag.services import EmbeddingService


class EmbeddingServiceTests(unittest.TestCase):
    @patch('apps.rag.services.requests.post')
    def test_embed_texts_uses_jina_api(self, mock_post):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'data': [
                {'embedding': [0.1, 0.2], 'index': 0, 'object': 'embedding'},
                {'embedding': [0.3, 0.4], 'index': 1, 'object': 'embedding'},
            ]
        }
        mock_post.return_value.raise_for_status.return_value = None

        with patch.dict(os.environ, {'JINA_API_KEY': 'test-key'}, clear=False):
            service = EmbeddingService()
            embeddings = service.embed_texts(['hello world', 'python'])

        self.assertEqual(embeddings, [[0.1, 0.2], [0.3, 0.4]])
        mock_post.assert_called_once()
        _, kwargs = mock_post.call_args
        self.assertEqual(kwargs['headers']['Authorization'], 'Bearer test-key')
        self.assertEqual(kwargs['json']['input'], ['hello world', 'python'])
        self.assertEqual(kwargs['json']['model'], 'jina-embeddings-v3')


if __name__ == '__main__':
    unittest.main()
