import os
import uuid
from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.core.files.storage import default_storage

from core.serializers.translate_file_serializer import TranslateFileSerializer
from core.utils.deepl_translation import DeeplTranslation
from core.utils.quickdoc.upload_to_blob_storage import upload_to_blob_storage
from core.services.deepl_glossary_service import DeepLGlossaryService
from core.utils.get_company_info import get_user_company

from core.tasks.tasks import async_translate_file
from core.utils.quickdoc.upload_to_blob_storage import generate_sas_token
from azure.storage.blob import BlobServiceClient


class DeeplTranslateFileViewAsync(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = TranslateFileSerializer

    def get(self, request, format=None):
        document = request.query_params.get('document', '')
        if not document:
            return Response(
                {'detail': 'Document parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Garante que o blob existe no storage
        blob_service_client = BlobServiceClient.from_connection_string(
            settings.AZURE_CONNECTION_STRING)
        blob_client = blob_service_client.get_blob_client(
            container=settings.AZURE_CONTAINER_NAME, blob=document)
        try:
            props = blob_client.get_blob_properties()
        except Exception:
            raise Http404('File not found on Azure Blob.')

        sas_token = generate_sas_token(document)
        blob_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{settings.AZURE_CONTAINER_NAME}/{document}?{sas_token}"
        return Response({"url": blob_url}, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        target = serializer.validated_data.get('target')
        origin = serializer.validated_data.get('origin')
        file = serializer.validated_data.get('file')
        target_supported = DeeplTranslation.TARGET.keys()

        if origin not in target_supported:
            return Response(
                {
                    'detail': f'Invalid origin language. Select from the following options: {", ".join(target_supported)}'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if target not in target_supported:
            return Response(
                {
                    'detail': f'Invalid target language. Select from the following options: {", ".join(target_supported)}'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Salva arquivo original no blob
        username = str(request.user.id)
        blob_name = f"{username}/{file.name}"
        file.file.seek(0)
        original_blob_url = upload_to_blob_storage(
            file.file, blob_name
        )

        filename = file.name         # ex: 'documento.pdf'
        filename_no_ext, _ = os.path.splitext(filename)

        deepl_key = settings.DEEPL_KEY
        
        # Try to get glossary_id from database
        glossary_id = None
        try:
            company = get_user_company(request.user)
            glossary_service = DeepLGlossaryService(deepl_key)
            
            # Map language names to codes
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
            print(f"Could not fetch glossary for async file translation: {e}")
        
        task = async_translate_file.delay(
            deepl_key,
            blob_name,
            target,
            origin,
            filename_no_ext,
            glossary_id
        )
        return Response(
            {"task_id": task.id, "filename": blob_name},
            status=status.HTTP_202_ACCEPTED
        )
