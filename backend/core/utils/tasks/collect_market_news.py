import json
import re
from django.utils import timezone
from datetime import datetime
from datetime import date, time
from dateutil import parser


def parse_news_date(raw_date: str):
    """
    Tenta parsear datas de notícias, garantindo um datetime aware
    para uso em DateTimeField com USE_TZ = True.
    """
    if not raw_date:
        return timezone.now()  # fallback para agora

    raw_date = raw_date.strip().replace("Z", "+00:00")

    try:
        # tenta parse normal
        parsed_date = parser.parse(raw_date, dayfirst=True).date()
    except (ValueError, OverflowError):
        # fallback: regex para extrair dia, mês, ano
        match = re.search(r'(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})', raw_date)
        if match:
            day, month_str, year = match.groups()
            try:
                import locale
                locale.setlocale(locale.LC_TIME, 'it_IT.UTF-8')  # italiano
                parsed_date = datetime.strptime(f"{day} {month_str} {year}", "%d %B %Y").date()
            except Exception:
                parsed_date = date.today()
        else:
            parsed_date = date.today()

    # nunca permitir datas futuras
    if parsed_date > date.today():
        parsed_date = date.today()

    # transforma em datetime aware, hora 00:00
    aware_datetime = timezone.make_aware(datetime.combine(parsed_date, time.min))
    return aware_datetime


def safe_load_json(raw_output: str):
    raw_output = raw_output.strip()

    # tenta carregar diretamente
    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        pass

    # remove blocos de código Markdown ``` ou ```json
    raw_output = re.sub(r"^```[a-zA-Z]*\n?", "", raw_output)
    raw_output = re.sub(r"\n?```$", "", raw_output)
    raw_output = raw_output.strip()

    # substitui aspas simples por duplas (apenas se necessário)
    raw_output = raw_output.replace("'", '"')

    # remove quebras de linha extras
    raw_output = re.sub(r"\n", "", raw_output)

    # tenta novamente
    try:
        return json.loads(raw_output)
    except json.JSONDecodeError as e:
        # se ainda falhar, loga e retorna lista vazia
        print(f"Failed to parse JSON output: {e}\nRaw output: {raw_output}")
        return []
