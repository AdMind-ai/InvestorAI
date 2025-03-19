# core/views/__init__.py
from .example_view import ExampleView
from .perplexity_api_view import PerplexityAPIView
from .translate_file_view import TranslateFileView
from .translate_text_view import TranslateTextView
from .audio_transcript_view import AudioTranscriptView


__all__ = [
    'ExampleView',
    'PerplexityAPIView',
    'TranslateFileView',
    'TranslateTextView',
    'AudioTranscriptView'
]
