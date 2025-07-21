from openai import OpenAI
import logging
import os
import json
from datetime import datetime, timedelta
from core.models.company_info.company_info import CompanyInfo
logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


def get_ceos_dict():
    ceos_dict = {}
    for company in CompanyInfo.objects.all():
        for ceo in company.ceos.all():
            ceos_dict[ceo.name.lower()] = ceo.role
    return ceos_dict


leaders = get_ceos_dict()


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
