from datetime import datetime, timedelta


def generate_openai_system():
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
            "summary": "<Riassunto significativo e ben strutturato di almeno 1000 caratteri oppure meno se l'articolo è troppo breve>",
            "source": "<Fonte ufficiale dell'articolo>",
            "url": "<Link diretto e funzionante all'articolo>",
            "language": "Italian",
            "date_published": "<YYYY-MM-DD nel formato ISO 8601>"
          }}
        ]
      }}

    Non aggiungere nulla oltre al JSON. Il tuo output deve essere ESCLUSIVAMENTE il JSON nel formato specificato.
    """


def generate_openai_prompt(topic):
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
    8. Se l'articolo è più breve di 1000 caratteri, puoi fare il riassunto minore.

    Risposta: Solo JSON, come da istruzioni precedenti.
    """
