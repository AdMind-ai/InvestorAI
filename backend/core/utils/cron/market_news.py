import requests

# busca notícias da TheNewsAPI


def fetch_news_thenewsapi(q, since, api_key):
    url = "https://api.thenewsapi.com/v1/news/all"
    params = {
        'api_token': api_key,
        'search': q,
        'language': 'en,it',
        'published_after': since,
        'locale': 'us,it',
    }
    r = requests.get(url, params=params)
    if r.status_code != 200:
        print(f"[TheNewsAPI] Erro: {r.text}")
        return []
    items = r.json().get("data", [])
    # padronizar formato
    result = []
    for item in items:
        result.append({
            "title": item.get("title"),
            "url": item.get("url"),
            "date_published": item.get("published_at"),
            "source": "thenewsapi"
        })
    return result

# busca notícias do CurrentsAPI


def fetch_news_currentsapi(q, since, api_key):
    url = "https://api.currentsapi.services/v1/search"
    params = {
        'apiKey': api_key,
        'keywords': q,
        'start_date': since,
    }
    r = requests.get(url, params=params)
    if r.status_code != 200:
        print(f"[CurrentsAPI] Erro: {r.text}")
        return []
    items = r.json().get("news", [])
    result = []
    for item in items:
        result.append({
            "title": item.get("title"),
            "url": item.get("url"),
            "date_published": item.get("published"),
            "source": "currentsapi"
        })
    return result

# busca notícias do Mediastack


def fetch_news_mediastack(q, date_range, api_key):
    url = "http://api.mediastack.com/v1/news"
    params = {
        'access_key': api_key,
        'keywords': q,
        'languages': 'en,it',
        'countries': 'us,it',
        'date': date_range,
    }
    r = requests.get(url, params=params)
    if r.status_code != 200:
        print(f"[Mediastack] Erro: {r.text}")
        return []
    items = r.json().get("data", [])
    result = []
    for item in items:
        result.append({
            "title": item.get("title"),
            "url": item.get("url"),
            "date_published": item.get("published_at"),
            "source": "mediastack"
        })
    return result
