import json
import os
import requests
from django.http import StreamingHttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from core.serializers.perplexity_serializer import PerplexityRequestSerializer

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

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            request_body = {
                "model": "sonar-deep-research",
                "messages": [
                    {"role": "system", "content": SYSTEM_MESSAGE},
                    {"role": "user", "content": message},
                ],
                "stream": True
            }

            def stream_response():
                try:
                    response = requests.post(
                        "https://api.perplexity.ai/chat/completions",
                        headers=headers,
                        json=request_body,
                        stream=True,
                        timeout=(10, 120)
                    )
                    response.raise_for_status()

                    citations_sent = False

                    for line in response.iter_lines(decode_unicode=True):
                        if not line.strip():
                            continue

                        if line.startswith("data: "):
                            line = line[len("data: "):].strip()

                        if line == "[DONE]":
                            break

                        try:
                            json_response = json.loads(line)
                        except json.JSONDecodeError:
                            continue

                        if not citations_sent and "citations" in json_response:
                            citations_data = {
                                "citations": json_response["citations"]
                            }
                            yield f"_CITATIONS_START_{json.dumps(citations_data)}_CITATIONS_END_\n"
                            citations_sent = True

                        delta = json_response.get("choices", [{}])[
                            0].get("delta", {})
                        delta_content = delta.get("content")
                        if delta_content:
                            yield delta_content

                except requests.RequestException as e:
                    yield f"Erro: {str(e)}"

            return StreamingHttpResponse(stream_response(), content_type="text/plain")

        return Response(serializer.errors, status=400)
