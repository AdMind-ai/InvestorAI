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
from core.utils.get_company_info import get_ceos, get_company_info

import logging
logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


def get_ceos_dict():
    company = get_company_info()
    if not company:
        return {}
    return {ceo.name.lower(): ceo.role for ceo in company.ceos.all()}


leaders = get_ceos_dict()


class OpenAICEONewsView(APIView):
    # authentication_classes = [JWTAuthentication]
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
                f"---------------------Attempt {attempt}: {personality}---------------------")
            try:
                # Using Chat Completions
                # response = client.chat.completions.create(
                #     model="gpt-4o-search-preview",
                #     messages=[
                #         {"role": "system", "content": generate_openai_system()},
                #         {"role": "user",
                #             "content": generate_openai_prompt(personality)},
                #     ],
                # )
                # content = response.choices[0].message.content
                # logger.debug(f"Resposta bruta do endpoint: {content}")

                # Using Response API
                response = response_openai_api(personality)
                response_text = ''
                for output in response.output:
                    if output.type == 'message':
                        for content in output.content:
                            if content.type == 'output_text':
                                response_text = content.text

                print(
                    f"Response {personality} ======================================================")
                print(response_text)
                print(
                    "============================================================================")

                if response_text == '':
                    response_text = '{"articles":[]}'

                usage = response.usage
                print("Input Tokens:", usage.input_tokens)
                print("Output Tokens:", usage.output_tokens)
                print("Total Tokens:", usage.total_tokens)

                try:
                    json_content = json.loads(response_text)
                except json.JSONDecodeError as e:
                    logger.error(f"JSON inválido recebido: {response_text}")
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

            ceo = get_ceos().get(name=personality)
            article, created = CEOArticle.objects.get_or_create(
                title=article_data["title"],
                url=article_data["url"],
                defaults={
                    "personality": ceo,
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
                "personality": personality,
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
    formattedTwoDaysAgo = two_days_ago.strftime("%d/%m/%Y")
    formattedDate = today.strftime("%d/%m/%Y")

    return f"""
    Sei un'assistente specializzata in ricerca di articoli che menzionano personalità specifiche e il loro legame con i criteri ESG, pubblicati tra il {formattedTwoDaysAgo} e il {formattedDate}.

    Requisiti:
    - Solo fonti autorevoli, nazionali e riconosciute.
    - No fonti dubbie.
    - Devi selezionare massimo 2 articoli che menzionano la personalità.
    - Includi il contenuto completo dell'articolo.
    - Assicurati che il JSON sia valido: tratta correttamente i caratteri speciali e usa escaping dove necessario.
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
    Se non trovi nessun articolo, ritorna la struttura JSON con "articles" vuoto.
    """


def generate_openai_prompt(personality):
    today = datetime.now()
    two_days_ago = today - timedelta(days=2)
    formattedTwoDaysAgo = two_days_ago.strftime("%d/%m/%Y")
    formattedDate = today.strftime("%d/%m/%Y")

    return f"""
    Trova almeno 1 articoli recenti e altamente rilevanti che menzionano '{personality}'.

    ### Istruzioni dettagliate:
    1. Cerca esclusivamente articoli pubblicati dal {formattedTwoDaysAgo} al {formattedDate}.
    2. Gli URL devono essere link diretti agli articoli funzionanti (senza paywall o reindirizzamenti).
    3. Fornisce il contenuto completo dell'articolo.
    4. Usa rigorosamente il formato ISO 8601 (YYYY-MM-DD) per la data di pubblicazione.
    5. Escludi articoli troppo simili fra loro o dello stesso editore/rete.
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
    logger.debug(
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Sentiment Analysis JSON XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    logger.debug("Sentiment Analysis JSON:")
    logger.debug(content)
    logger.debug(
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

    try:
        result = json.loads(content)
        sentiment_percent = result.get("percent", None)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON: {e}")
        return None

    return sentiment_percent


def response_openai_api(personality):
    today = datetime.now()
    two_days_ago = today - timedelta(days=100)
    formattedTwoDaysAgo = two_days_ago.strftime("%d %B %Y")
    formattedDate = today.strftime("%d %B %Y")

    personality_role = leaders.get(personality.lower(), "")

    response = client.responses.create(
        model="gpt-4o",
        input=[
            {
                "role": "system",
                "content": [
                    {
                        "type": "input_text",
                        "text": """
                            Sei un assistente specializzato nella ricerca e nell'identificazione di articoli, notizie e pubblicazioni recenti. 
                            Aspetta che l'utente fornisca una breve descrizione della persona di cui vuole cercare informazioni. 
                            Il tuo obiettivo è trovare informazioni da fonti affidabili e riconosciute per fornire risultati accurati e pertinenti. 
                            Verifica che ogni articolo e URL siano autentici e funzionanti. 
                            Gli URL devono essere link diretti a articoli genuini, accessibili gratuitamente e senza reindirizzamenti inutili.
                            Assicurati che la risposta includa il contenuto completo di ogni articolo o pubblicazione e limita i risultati a un massimo di 3 articoli.
                            Se non riesci a trovare articoli pertinenti, continua a cercare. se ancora non ci sono risultati, non creare articoli fittizi; restituisci un json vuoto.
                        """
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": f"""
                            Descrizione: {personality_role}. 
                            Si prega di trovare articoli, notizie e pubblicazioni recenti su {personality} pubblicati intorno al {formattedDate}. 
                            Assicurati che le informazioni provengano da fonti affidabili e riconosciute, che gli articoli siano reali, e che gli URL siano validi e contengano l'articolo cercato. 
                            Evita di includere articoli con contenuti molto simili. 
                            Assicurati che la risposta includa il contenuto completo di ogni articolo o pubblicazione.
                            Se non riesci a trovare articoli pertinenti, continua a cercare. se ancora non ci sono risultati, non creare articoli fittizi; restituisci un json vuoto.
                        """
                    }
                ]
            }
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "article_collection",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "articles": {
                            "type": "array",
                            "description": "A collection of articles.",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {
                                        "type": "string",
                                        "description": "Accurate title of the article."
                                    },
                                    "author": {
                                        "type": "string",
                                        "description": "Name of the author or 'Unknown'."
                                    },
                                    "content": {
                                        "type": "string",
                                        "description": "Complete content of the article (max 3000 characters)."
                                    },
                                    "source": {
                                        "type": "string",
                                        "description": "Official source of the article."
                                    },
                                    "url": {
                                        "type": "string",
                                        "description": "Direct and functioning link to the article."
                                    },
                                    "language": {
                                        "type": "string",
                                        "description": "Language of the article.",
                                        "enum": [
                                            "Italian"
                                        ]
                                    },
                                    "date_published": {
                                        "type": "string",
                                        "description": "Publication date in ISO 8601 format (YYYY-MM-DD)."
                                    }
                                },
                                "required": [
                                    "title",
                                    "author",
                                    "content",
                                    "source",
                                    "url",
                                    "language",
                                    "date_published"
                                ],
                                "additionalProperties": False
                            }
                        }
                    },
                    "required": [
                        "articles"
                    ],
                    "additionalProperties": False
                }
            }
        },
        reasoning={},
        tools=[
            {
                "type": "web_search_preview",
                "user_location": {
                    "type": "approximate",
                    "country": "IT"
                },
                "search_context_size": "medium"
            }
        ],
        tool_choice={
            "type": "web_search_preview"
        },
        temperature=0.20,
        max_output_tokens=10000,
        top_p=0.70,
        store=False
    )

    return response
