import requests
import json
import os
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser

from core.serializers.esg_news_serializer import ESGNewsSerializer
from core.models.esg_article_model import ESGArticle

import logging
logger = logging.getLogger(__name__)


class PerplexityESGNewsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [FormParser, MultiPartParser, JSONParser]
    serializer_class = ESGNewsSerializer

    def post(self, request):
        serializer = ESGNewsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        topic = serializer.validated_data['topic']

        max_retries = 2
        for attempt in range(max_retries + 1):
            print(
                f"----------------------------------------Attempt {attempt}: {topic}----------------------------------------")
            try:

                headers = {
                    "Authorization": f"Bearer {os.getenv('PERPLEXITY_KEY')}",
                    "Content-Type": "application/json"
                }

                response = requests.post("https://api.perplexity.ai/chat/completions",
                                         headers=headers, json={
                                             "model": "sonar-pro",
                                             "messages": [
                                                 {"role": "system",
                                                  "content": generate_perplexity_system()},
                                                 {"role": "user", "content": generate_perplexity_prompt(
                                                  topic)},
                                             ],
                                         })

                response.raise_for_status()
                data = response.json()

                try:
                    content = data['choices'][0]['message']['content']
                    content = sanitize_json(content)
                    json_content = json.loads(content)
                except json.JSONDecodeError as e:
                    logger.error(f"Erro ao decodificar JSON: {e}")
                    logger.error(f"Conteúdo Bruto: {content}")
                    return Response({"error": "Invalid JSON response", "details": str(e), "raw_content": content}, status=500)

                break
            except Exception as e:
                logger.error(f"Failed to fetch data after retries: {e}")
                if attempt == max_retries:
                    return Response({"error": "Failed to fetch data after retries"}, status=500)

        created_articles = []
        num_created = 0
        for article_data in json_content["articles"]:
            article, created = ESGArticle.objects.get_or_create(
                title=article_data["title"],
                url=article_data["url"],
                defaults={
                    "topic": topic,
                    "author": article_data.get('author', 'Sconosciuto'),
                    "summary": article_data["summary"],
                    "source": article_data["source"],
                    "language": article_data["language"],
                    "date_published": article_data["date_published"]
                }
            )
            if created:
                num_created += 1
            created_articles.append(article)

        serialized_articles = [
            {
                "id": article.id,
                "title": article.title,
                "author": article.author,
                "summary": article.summary,
                "source": article.source,
                "url": article.url,
                "language": article.language,
                "date_published": article.date_published,
                "topic": article.topic,
                "created_at": article.created_at.isoformat()
            }
            for article in created_articles
        ]

        print(
            f"----------------------------------------{topic}----------------------------------------")
        logger.debug(
            f"articles: {serialized_articles}, num_created: {num_created}")
        return Response({
            "articles": serialized_articles,
            "num_created": num_created,
            "topic": topic
        })


def generate_perplexity_system():
    today = datetime.now()
    two_days_ago = today - timedelta(days=2)
    formattedTwoDaysAgo = two_days_ago.strftime("%Y-%m-%d")
    formattedDate = today.strftime("%Y-%m-%d")

    return f"""
  Sei un'assistente specializzata in ricerca di articoli ESG (Environmental, Social, Governance) in Italia, pubblicati tra il {formattedTwoDaysAgo} e il {formattedDate}.

  Requisiti:
  - Solo fonti autorevoli, nazionali e riconosciute.
  - No fonti dubbie.
  - Devi selezionare massimo 5 articoli.
  - Risposta ESCLUSIVAMENTE in formato JSON:
    {{
      "articles": [
        {{
          "title": "<Titolo accurato dell'articolo>",
          "author": "<Nome autore o 'Sconosciuto'>",
          "summary": "<Riassunto significativo e ben strutturato di almeno 2000 caratteri oppure meno se l'articolo è troppo breve>",
          "source": "<Fonte ufficiale dell'articolo>",
          "url": "<Link diretto e funzionante all'articolo>",
          "language": "Italian",
          "date_published": "<YYYY-MM-DD nel formato ISO 8601>"
        }}
      ]
    }}

  Non aggiungere nulla oltre al JSON. Il tuo output deve essere ESCLUSIVAMENTE il JSON nel formato specificato.
  """


def generate_perplexity_prompt(topic):
    today = datetime.now()
    two_days_ago = today - timedelta(days=2)
    formattedTwoDaysAgo = two_days_ago.strftime("%Y-%m-%d")
    formattedDate = today.strftime("%Y-%m-%d")

    return f"""
  Trova almeno 2 e al massimo 5 articoli recenti e altamente rilevanti sul tema '{topic}' relativi all'ESG in Italia.

  ### Istruzioni dettagliate:
  1. Cerca esclusivamente articoli pubblicati dal {formattedTwoDaysAgo} al {formattedDate}, relativi specificamente all'argomento ESG in Italia.
  2. Seleziona fonti autorevoli, affidabili e ben conosciute (grandi editori nazionali, testate giornalistiche rinomate o portali specializzati nel settore economico-finanziario).
  3. Gli URL devono essere link diretti agli articoli funzionanti (senza paywall o reindirizzamenti).
  4. Riassumi ogni articolo in modo conciso, concentrandoti sui punti chiave. Minimo 1500 caratteri per riassunto se possibile, altrimenti meno ma significativo.
  5. Evita contenuti duplicati, assicurando varietà delle fonti.
  6. Usa rigorosamente il formato ISO 8601 (YYYY-MM-DD) per la data di pubblicazione.
  7. Non inserire articoli troppo simili fra loro o dello stesso editore/rete.
  8. Se l'articolo è più breve di 2000 caratteri, puoi fare il riassunto minore.

  Risposta: Solo JSON, come:
    {{
      "articles": [
        {{
          "title": "<Titolo accurato dell'articolo>",
          "author": "<Nome autore o 'Sconosciuto'>",
          "summary": "<Riassunto significativo e ben strutturato di almeno 2000 caratteri oppure meno se l'articolo è troppo breve>",
          "source": "<Fonte ufficiale dell'articolo>",
          "url": "<Link diretto e funzionante all'articolo>",
          "language": "Italian",
          "date_published": "<YYYY-MM-DD nel formato ISO 8601>"
        }}
      ]
    }}
  """


def sanitize_json(content):
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1].rsplit("\n", 1)[0]

    return content.replace('\r', '').replace('\t', '')
