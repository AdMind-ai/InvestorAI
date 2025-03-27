from openai import OpenAI
import requests
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


class PerplexityCEONewsView(APIView):
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
                                                  personality)},
                                             ],
                                         })

                response.raise_for_status()
                data = response.json()

                try:
                    print(data)
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


def generate_perplexity_system():
    today = datetime.now()
    two_days_ago = today - timedelta(days=2)
    formattedTwoDaysAgo = two_days_ago.strftime("%Y-%m-%d")
    formattedDate = today.strftime("%Y-%m-%d")

    return f"""
    Sei un'assistente specializzata nella ricerca di articoli, notizie o pubblicazioni che menzionano una persona specifica, pubblicati tra il {formattedTwoDaysAgo} e il {formattedDate}.

    Requisiti:
    - Assicurati che la risposta includa il contenuto completo di ogni articolo o pubblicazione e limita i risultati a un massimo di 3 elementi.
    - Solo fonti autorevoli nazionali e riconosciute.
    - Evita fonti dubbie o non verificabili.
    - Includi il contenuto completo dell'articolo.
    - Assicurati che il JSON sia valido: tratta correttamente i caratteri speciali e usa escaping dove necessario.
    - Risposta ESCLUSIVAMENTE in formato JSON:
    {{
        "articles": [
        {{
            "title": "<Titolo accurato dell'articolo>",
            "author": "<Nome autore o 'Sconosciuto'>",
            "content": "<Contenuto completo dell'articolo>",
            "source": "<Fonte ufficiale dell'articolo>",
            "url": "<Link diretto e funzionante all'articolo>",
            "language": "Italian",
            "date_published": "<YYYY-MM-DD nel formato ISO 8601>"
        }}
        ]
    }}

    Non aggiungere nulla oltre al JSON. Il tuo output deve essere ESCLUSIVAMENTE il JSON nel formato specificato.
    """


def generate_perplexity_prompt(personality):
    today = datetime.now()
    two_days_ago = today - timedelta(days=2)
    formattedTwoDaysAgo = two_days_ago.strftime("%Y-%m-%d")
    formattedDate = today.strftime("%Y-%m-%d")

    return f"""
    Trova articoli, notizie o pubblicazioni recenti e rilevanti che menzionano '{personality}'.

    ### Istruzioni dettagliate:
    1. Cerca solo i contenuti pubblicati intorno al {formattedDate}.
    2. Seleziona fonti autorevoli, affidabili e ben conosciute.
    3. Gli URL devono essere link diretti ai contenuti funzionanti (senza paywall o reindirizzamenti).
    4. Fornisci il contenuto completo dell'articolo.
    5. Usa rigorosamente il formato ISO 8601 (YYYY-MM-DD) per la data di pubblicazione.
    6. Escludi contenuti troppo simili fra loro o dello stesso editore/rete.

    Risposta: Solo JSON valido. Assicurati che i caratteri speciali siano gestiti correttamente:
    {{
        "articles": [
        {{
            "title": "<Titolo accurato dell'articolo>",
            "author": "<Nome autore o 'Sconosciuto'>",
            "content": "<Contenuto completo dell'articolo>",
            "source": "<Fonte ufficiale dell'articolo>",
            "url": "<Link diretto e funzionante all'articolo>",
            "language": "Italian",
            "date_published": "<YYYY-MM-DD nel formato ISO 8601>"
        }}
        ]
    }}

    Se non trovi nessun articolo, ritorna la struttura JSON con "articles" vuoto. 
    """


def sanitize_json(content):
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1].rsplit("\n", 1)[0]

    return content.replace('\r', '').replace('\t', '')


client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


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
