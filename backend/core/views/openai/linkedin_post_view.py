import base64
from openai import OpenAI
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from core.utils.get_company_info import get_user_company

import logging
logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.OPENAI_KEY)

class LinkedinPostView(APIView):
    #  authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    parser_classes = [FormParser, MultiPartParser, JSONParser]
    permission_classes = [AllowAny]

    def post(self, request):
        # Accept a text (field names: 'text') and file ('file')
        text = request.data.get("text") or ''
        uploaded_file = request.FILES.get("file")
        company = get_user_company(request.user)

        # Prepare payload to send to the model. If there's a file, include it as base64 along with metadata.
        if uploaded_file:
            try:
                file_bytes = uploaded_file.read()
                file_b64 = base64.b64encode(file_bytes).decode("utf-8")
            except Exception:
                file_b64 = None

            content_type = getattr(uploaded_file, "content_type", "application/octet-stream")
            file_name = getattr(uploaded_file, "name", None) or getattr(uploaded_file, "filename", None)

            # Build content list: always include text and input_file; include input_image only if it's an image
            text_input = f"company_website: {company.website} \n text: {text}"
            content_items = [
                { "type": "input_text", "text": text }
            ]

            if file_b64:
                # image data URI when appropriate
                # if content_type.startswith("image/"):
                #     content_items.append({
                #         "type": "input_image",
                #         "image_url": f"data:{content_type};base64,{file_b64}",
                #     })

                # generic file entry with real filename and correct MIME type
                content_items.append({
                    "type": "input_file",
                    "filename": file_name,
                    "file_data": f"data:{content_type};base64,{file_b64}",
                })

            input_payload = [
                {
                    "role": "user",
                    "content": content_items
                }
            ]
        else:
            # If no file provided, send just the text (string) as before
            input_payload = text

        response = client.responses.create(
            model="gpt-5",
            prompt={"id": settings.OPENAI_PROMPT_ID_LINKEDIN_POST},
            input=input_payload,
            store=True,
            include=[
                "web_search_call.action.sources"
            ],
            timeout=900,
        ) 
        
        content = response.output_text

        return Response(content, status=200)
        
    def get(self, request):
        return Response({"detail": "GET not supported on this endpoint"}, status=405)