import os

from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from core.utils.deepl_translation_file import DeeplTranslationFile


import os


class TranslateTextView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        text = request.data.get('text')
        origin = request.data.get('origin')
        target = request.data.get('target')

        if not text or not origin or not target:
            return Response({'detail': 'Missing parameter'}, status=400)

        translation = DeeplTranslationFile(os.getenv('OPENAI_KEY'))
        translated_text = translation.translate_text(text, origin, target)

        return Response({'translated_text': translated_text}, status=200)
