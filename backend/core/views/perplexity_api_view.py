import json
import os
from openai import OpenAI
from django.http import StreamingHttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from core.serializers import PerplexityRequestSerializer

SYSTEM_MESSAGE = (
    "You are an advanced deep search AI. Your role is to understand and process "
    "complex queries by dissecting the input, identifying key themes, and "
    "retrieving relevant and precise information. Ensure a thorough search "
    "through multiple data layers and provide well-structured, concise, and "
    "contextually appropriate results. Prioritize clarity, accuracy, and "
    "relevance in all of your responses."
)


class PerplexityAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [FormParser, MultiPartParser, JSONParser]
    serializer_class = PerplexityRequestSerializer

    def get(self, request):
        return Response({"system_message": SYSTEM_MESSAGE})

    def post(self, request):
        data = request.data.copy()
        if 'message' not in data:
            return Response({"error": "Message field is required"}, status=400)

        serializer = PerplexityRequestSerializer(data=data)
        if serializer.is_valid():
            message = serializer.validated_data['message']
            api_key = os.getenv("PERPLEXITY_KEY")

            if not api_key:
                return Response({"error": "API Key is missing"}, status=500)

            client = OpenAI(api_key=api_key,
                            base_url="https://api.perplexity.ai")

            def stream_response():
                try:
                    response_stream = client.chat.completions.create(
                        model="sonar-deep-research",
                        messages=[
                            {"role": "system", "content": SYSTEM_MESSAGE},
                            {"role": "user", "content": message},
                        ],
                        stream=True,
                    )

                    citations_sent = False

                    for response in response_stream:
                        if response.choices:
                            # Enviar citações no primeiro chunk se ainda não enviado
                            if not citations_sent:
                                citations_data = {
                                    "citations": response.citations
                                }
                                print("citations: ", citations_data)
                                yield f"_CITATIONS_START_{json.dumps(citations_data)}_CITATIONS_END_\n"
                                citations_sent = True

                            delta_content = response.choices[0].delta.content
                            if delta_content:
                                print(delta_content, end="")
                                yield delta_content

                except Exception as e:
                    yield f"Erro: {str(e)}"

            return StreamingHttpResponse(stream_response(), content_type="text/plain")

        return Response(serializer.errors, status=400)
