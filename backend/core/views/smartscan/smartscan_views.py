from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
import tempfile
import os

# Assumindo OpenAI SDK já configurado:
from openai import OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

# --- /smartscan/extract ---


class SmartScanExtractView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        files = request.FILES.getlist('files')
        tmp_file_paths = []

        # 1. Salve arquivos temporariamente para upload (simula upload real para OpenAI)
        file_streams = []
        for f in files:
            ext = os.path.splitext(f.name)[1] or ""
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
            tmp.write(f.read())
            tmp.close()
            tmp_file_paths.append(tmp.name)
            file_streams.append(open(tmp.name, "rb"))

        try:
            # 2. Cria vector store e faz upload dos arquivos
            vector_store = client.vector_stores.create(
                name="SmartScan VectorStore")
            file_batch = client.vector_stores.file_batches.upload_and_poll(
                vector_store_id=vector_store.id,
                files=file_streams
            )

            # 3. Cria assistant atrelado ao vector store
            assistant = client.beta.assistants.create(
                name="SmartScan Assistant",
                instructions="Sei un estrattore di dati. Rispondi solo in italiano.",
                model="gpt-4o",
                tools=[{"type": "file_search"}],
                tool_resources={"file_search": {
                    "vector_store_ids": [vector_store.id]}},
            )

            # 4. Cria thread e pergunta de extração (em italiano)
            filenames = [f.name for f in files]
            filenames_str = ", ".join(filenames)
            prompt = (
                f"I documenti allegati sono: {filenames_str}.\n"
                "Leggi ATTENTAMENTE TUTTI i documenti allegati (non tralasciare nessuna parte, nessun paragrafo, né dati tabellari). "
                "Per ogni documento, indica chiaramente quale stai riassumendo e poi estrai e numerai i fatti/dati chiave in italiano. "
                "Infine, fornisci anche un riassunto integrato che evidenzi le principali informazioni raccolte da tutti i documenti."
            )
            thread = client.beta.threads.create(
                messages=[{"role": "user", "content": prompt}]
            )

            # 5. Roda assistant, aguarda resultado (run)
            run = client.beta.threads.runs.create_and_poll(
                thread_id=thread.id, assistant_id=assistant.id
            )
            # Pega resposta
            messages = list(client.beta.threads.messages.list(
                thread_id=thread.id, run_id=run.id))
            # depende do formato retornado!
            summary = messages[0].content[0].text.value
            return Response({'summary': summary, 'assistant_id': assistant.id})

        finally:
            # 6. Remove arquivos temporários (cleanup)
            for fs in file_streams:
                fs.close()
            for fp in tmp_file_paths:
                try:
                    os.unlink(fp)
                except Exception as e:
                    print("Erro ao remover tmp:", fp, e)

# --- /smartscan/chat ---


class SmartScanChatView(APIView):
    def post(self, request):
        assistant_id = request.data.get('assistant_id')
        messages = request.data.get('messages', [])

        # Cria uma thread nova (ou você pode armazenar/reutilizar se quiser)
        thread = client.beta.threads.create(messages=messages)

        # Roda assistant com file_search habilitado
        run = client.beta.threads.runs.create_and_poll(
            thread_id=thread.id, assistant_id=assistant_id
        )
        # Pega resposta
        response_msgs = list(client.beta.threads.messages.list(
            thread_id=thread.id, run_id=run.id))
        # depende do formato retornado!
        answer = response_msgs[0].content[0].text.value
        return Response({'answer': answer})
