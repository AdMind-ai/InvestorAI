import os

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from core.utils.deepl_translation import DeeplTranslation
from core.services.deepl_glossary_service import DeepLGlossaryService
from core.utils.get_company_info import get_user_company


class DeeplTranslateTextView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        text = request.data.get('text')
        origin = request.data.get('origin')
        target = request.data.get('target')

        if not text or not origin or not target:
            return Response({'detail': 'Missing parameter'}, status=400)

        deepl_key = os.getenv('DEEPL_KEY')
        translation = DeeplTranslation(deepl_key)
        
        # Try to get glossary_id from database
        glossary_id = None
        try:
            company = get_user_company(request.user)
            glossary_service = DeepLGlossaryService(deepl_key)
            
            # Map app language names (english, italian, etc.) to DeepL codes (EN, IT, etc.)
            source_lang_code = DeeplTranslation.TARGET.get(origin, '').split('-')[0]
            target_lang_code = DeeplTranslation.TARGET.get(target, '').split('-')[0]
            
            # Try company glossary first
            glossary_id = glossary_service.get_glossary_id_for_translation(
                company_id=company.id,
                user_id=request.user.id,
                scope="company",
                source_lang=source_lang_code.upper(),
                target_lang=target_lang_code.upper()
            )
        except Exception as e:
            # Log but continue without glossary
            print(f"Could not fetch glossary: {e}")
        
        translated_text = translation.translate_text(
            text, origin, target, glossary_id=glossary_id
        )

        return Response({'translated_text': translated_text}, status=200)
