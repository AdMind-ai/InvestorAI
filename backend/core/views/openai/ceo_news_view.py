from openai import OpenAI
import json
import os
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser

from core.serializers.ceo_news_serializer import CEONewsSerializer
from core.models.ceo_article_model import CEOArticle

import logging
logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


class OpenAICEONewsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [FormParser, MultiPartParser, JSONParser]
    serializer_class = CEONewsSerializer

    def post(self, request):
        serializer = CEONewsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        personality = serializer.validated_data['personality']

        max_retries = 2
        for attempt in range(max_retries + 1):
            print(
                f"----------------------------------------Attempt {attempt}: {personality}----------------------------------------")
            try:
                completion = client.chat.completions.create(
                    model="gpt-4o-search-preview",
                    messages=[
                        {"role": "system", "content": generate_openai_system()},
                        {"role": "user",
                            "content": generate_openai_prompt(personality)},
                    ],
                    max_tokens=16000
                )

                content = completion.choices[0].message.content
                # logger.debug(f"Resposta bruta do endpoint: {content}")

                try:
                    json_content = json.loads(content)
                except json.JSONDecodeError as e:
                    logger.error(f"JSON inválido recebido: {content}")
                    return Response({"error": "Invalid JSON response", "details": str(e), "raw_content": content}, status=500)

                if 'articles' not in json_content:
                    logger.error(
                        f"Campo 'articles' ausente na resposta: {json_content}")
                    return Response({"error": "Missing 'articles' key", "raw_content": json_content}, status=500)

                break

            except Exception as e:
                logger.error(f"Erro ao tentar buscar dados: {e}")
                if attempt == max_retries:
                    return Response({"error": "Failed to fetch data after retries"}, status=500)

        created_articles = []
        num_created = 0
        for article_data in json_content["articles"]:
            sentiment_score = get_sentiment_analysis(
                personality, article_data["content"])
            article, created = CEOArticle.objects.get_or_create(
                title=article_data["title"],
                url=article_data["url"],
                defaults={
                    "personality": personality,
                    "author": article_data.get('author', 'Sconosciuto'),
                    "content": article_data["content"],
                    "source": article_data["source"],
                    "language": article_data["language"],
                    "date_published": article_data["date_published"],
                    "sentiment": sentiment_score
                }
            )
            if created:
                num_created += 1
                article.sentiment = sentiment_score
                article.save()

            created_articles.append(article)

        serialized_articles = [
            {
                "id": article.id,
                "title": article.title,
                "author": article.author,
                "content": article.content,
                "source": article.source,
                "url": article.url,
                "language": article.language,
                "date_published": article.date_published,
                "personality": article.personality,
                "created_at": article.created_at.isoformat(),
                "sentiment": article.sentiment
            }
            for article in created_articles
        ]
        print(
            f"----------------------------------------{personality}----------------------------------------")
        logger.debug(
            f"articles: {serialized_articles}, num_created: {num_created}")
        return Response({
            "articles": serialized_articles,
            "num_created": num_created,
            "personality": personality
        })


def generate_openai_system():
    today = datetime.now()
    two_days_ago = today - timedelta(days=2)
    formattedTwoDaysAgo = two_days_ago.strftime("%Y-%m-%d")
    formattedDate = today.strftime("%Y-%m-%d")

    return f"""
    Sei un'assistente specializzata in ricerca di articoli che menzionano personalità specifiche e il loro legame con i criteri ESG, pubblicati tra il {formattedTwoDaysAgo} e il {formattedDate}.

    Requisiti:
    - Solo fonti autorevoli, nazionali e riconosciute.
    - No fonti dubbie.
    - Devi selezionare massimo 2 articoli che menzionano la personalità.
    - Includi il contenuto completo dell'articolo.
    - Risposta ESCLUSIVAMENTE in formato JSON:
      {{
        "articles": [
          {{
            "title": "<Titolo accurato dell'articolo>",
            "author": "<Nome autore o 'Sconosciuto'>",
            "content": "<Contenuto completo dell'articolo (max 3000 characters)>",
            "source": "<Fonte ufficiale dell'articolo>",
            "url": "<Link diretto e funzionante all'articolo>",
            "language": "Italian",
            "date_published": "<YYYY-MM-DD nel formato ISO 8601>"
          }}
        ]
      }}

    Non aggiungere nulla oltre al JSON. Il tuo output deve essere ESCLUSIVAMENTE il JSON nel formato specificato.
    """


def generate_openai_prompt(personality):
    today = datetime.now()
    two_days_ago = today - timedelta(days=2)
    formattedTwoDaysAgo = two_days_ago.strftime("%Y-%m-%d")
    formattedDate = today.strftime("%Y-%m-%d")

    return f"""
    Trova almeno 1 e al massimo 2 articoli recenti e altamente rilevanti che menzionano '{personality}'.

    ### Istruzioni dettagliate:
    1. Cerca esclusivamente articoli pubblicati dal {formattedTwoDaysAgo} al {formattedDate}.
    2. Seleziona fonti autorevoli, affidabili e ben conosciute.
    3. Gli URL devono essere link diretti agli articoli funzionanti (senza paywall o reindirizzamenti).
    4. Fornisce il contenuto completo dell'articolo.
    5. Usa rigorosamente il formato ISO 8601 (YYYY-MM-DD) per la data di pubblicazione.
    6. Escludi articoli troppo simili fra loro o dello stesso editore/rete.

    Risposta: Solo JSON, come:
      {{
        "articles": [
          {{
            "title": "<Titolo accurato dell'articolo>",
            "author": "<Nome autore o 'Sconosciuto'>",
            "content": "<Contenuto completo dell'articolo (max 3000 characters)>",
            "source": "<Fonte ufficiale dell'articolo>",
            "url": "<Link diretto e funzionante all'articolo>",
            "language": "Italian",
            "date_published": "<YYYY-MM-DD nel formato ISO 8601>"
          }}
        ]
      }}
    """


def get_sentiment_analysis(person, text):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert in sentiment analysis. Your task is to evaluate the sentiment of articles "
                    "related to a specific person. Respond ONLY with a JSON in the following format:\n"
                    "{\n"
                    "  \"analysis\": \"A detailed analysis of the sentiment towards the person.\",\n"
                    "  \"percent\": <a number representing the sentiment percentage>\n"
                    "}\n"
                    "0% indicates a very negative sentiment about the person, while 100% signifies a very positive sentiment."
                )
            },
            {
                "role": "user",
                "content": (
                    f"The person you need to analyze is {person}. The text to analyze is:\n{text}"
                )
            },
        ],
    )

    content = completion.choices[0].message.content.strip()
    logger.debug("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    logger.debug(content)

    try:
        result = json.loads(content)
        sentiment_percent = result.get("percent", None)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON: {e}")
        return None

    logger.debug(f"Sentiment Analysis JSON: {result}")
    print(sentiment_percent)

    return sentiment_percent
