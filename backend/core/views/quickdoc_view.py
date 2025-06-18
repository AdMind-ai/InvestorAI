from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.utils import timezone
from core.models.quickdoc_model import GeneratedDocument
from core.utils.quickdoc import generate_doc_with_assistant, create_pdf_with_header_footer, create_word_with_header_footer
import os


class QuickDocGenerateView(APIView):

    def post(self, request):
        format = request.data.get('format')
        language = request.data.get('language')
        instructions = request.data.get('instructions')
        if not (format and language and instructions):
            return Response({'error': 'Faltam dados.'}, status=400)

        nome_arquivo, title, data, generated_text = generate_doc_with_assistant(
            format, language, instructions)

        # print(
        #     f"Generated file: {nome_arquivo}, Date: {data}, Text: {generated_text}")

        pdf_path = f"{settings.MEDIA_ROOT}/quick-documents/{nome_arquivo}.pdf"
        word_path = f"{settings.MEDIA_ROOT}/quick-documents/{nome_arquivo}.docx"

        # Gerar PDF
        create_pdf_with_header_footer(
            pdf_path, generated_text, title)
        create_word_with_header_footer(
            word_path, generated_text, title)

        # Salvar no banco
        doc = GeneratedDocument.objects.create(
            name=nome_arquivo, date=timezone.now().date(),
            doc_format=format, language=language, text=generated_text
        )
        doc.pdf_file.name = f"quick-documents/{nome_arquivo}.pdf"
        doc.word_file.name = f"quick-documents/{nome_arquivo}.docx"
        doc.save()

        return Response({
            "name": nome_arquivo,
            "date": data,
            "type": ["pdf", "word"],
            "text": generated_text,
            "urls": {
                "pdf": request.build_absolute_uri(f"{settings.MEDIA_URL}quick-documents/{nome_arquivo}.pdf"),
                "word": request.build_absolute_uri(f"{settings.MEDIA_URL}quick-documents/{nome_arquivo}.docx")
            }
        })
