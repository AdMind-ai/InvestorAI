from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
import os

from core.serializers.text_to_speech_serializer import ElevenlabsTextToSpeechSerializer
from core.utils.elevenlabs_text_to_speech import ElevenlabsTextToSpeech


class ElevenlabsTextToSpeechView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = ElevenlabsTextToSpeechSerializer

    def post(self, request, format=None):
        serializer = ElevenlabsTextToSpeechSerializer(data=request.data)
        print('passou aqui 1')
        if serializer.is_valid():
            try:
                print('passou aqui 2')
                send = serializer._validated_data.get('send')
                language = serializer._validated_data.get('language')
                id_voice = serializer._validated_data.get('id_voice')
                stability = serializer._validated_data.get('stability', 0.8)
                similarity_boost = serializer._validated_data.get('similarity_boost', 0.5)
                style = serializer._validated_data.get('style', 0.0)
                use_speaker_boost = serializer._validated_data.get('use_speaker_boost', True)

                elevenlabs_key = os.getenv("ELEVENLABS_KEY")
                speech = ElevenlabsTextToSpeech(elevenlabs_key)

                audio = speech.send(
                    send=send,
                    language=language,
                    id_voice=id_voice,
                    stability=stability,
                    similarity_boost=similarity_boost,
                    style=style,
                    use_speaker_boost=use_speaker_boost,
                )

                return Response({'audio': audio}, status=status.HTTP_201_CREATED)

            except TimeoutError:
                return Response(
                    {'detail': 'A requisição ao ElevenLabs excedeu o tempo limite'},
                    status=status.HTTP_504_GATEWAY_TIMEOUT,
                )
            except Exception as e:
                # Mantém o tratamento genérico de erros
                return Response(
                    {'detail': 'Erro na chamada para ElevenLabs ou chave incorreta'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
