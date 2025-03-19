import os

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from core.serializers.audio_transcript_serializer import AudioTranscriptSerializer
from core.utils.openai_audio_transcript import OpenAISpeechToText
from ..utils.is_authorization import is_authorization

import os


class AudioTranscriptView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = AudioTranscriptSerializer

    def get(self, request, format=None):
        return Response(
            {'detail': 'Get request.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def post(self, request, format=None):
        serializer = AudioTranscriptSerializer(data=request.data)

        if serializer.is_valid():
            openai_key = os.getenv("OPENAI_KEY")
            if not is_authorization(openai_key):
                return Response(
                    {'detail': 'Unauthorized access.'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            file = serializer._validated_data.get('file', None)
            speech = OpenAISpeechToText(openai_key)
            return Response(
                {'text': speech.send(file)}, status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
