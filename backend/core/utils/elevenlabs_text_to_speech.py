import base64
import io
import requests
from typing import Optional

class ElevenlabsTextToSpeech:

    VOICES = [
        {'Aria': '9BWtsMINqrJLrRacOk9x'},
        {'Roger': 'CwhRBWXzGAHq8TQ4Fs17'},
        {'Sarah': 'EXAVITQu4vr4xnSDxMaL'},
        {'Laura': 'FGY2WhTYpPnrIDTdsKH5'},
        {'Charlie': 'IKne3meq5aSn9XLyUdCD'},
        {'George': 'JBFqnCBsd6RMkjVDRZzb'},
        {'Callum': 'N2lVS1w4EtoT3dr4eOWO'},
        {'River': 'SAz9YHcvj6GT2YYXdXww'},
        {'Liam': 'TX3LPaxmHKxFdv7VOQHJ'},
        {'Charlotte': 'XB0fDUnXU5powFXDhCwa'},
        {'Alice': 'Xb7hH8MSUJpSbSDYk0k2'},
        {'Matilda': 'XrExE9yKIg1WjnnlVkGX'},
        {'Will': 'bIHbv24MWmeRgasZH58o'},
        {'Jessica': 'cgSgspJ2msm6clMCkdW9'},
        {'Eric': 'cjVigY5qzO86Huf0OWal'},
        {'Chris': 'iP95p4xoKVk53GoZ742B'},
        {'Brian': 'nPczCjzI2devNBz1zQrb'},
        {'Daniel': 'onwK4e9ZLuTAKqWW03F9'},
        {'Lily': 'pFZP5JQG7iQjIQuC4Bku'},
        {'Bill': 'pqHfZKP75CvOlQylNhV4'},
        {'MarcoTrox - Italian Professional Voice Talent': '13Cuh3NuYvWOVQtLbRN8'},
        {'Aaron - AI & Tech News': '3DR8c2yd30eztg65o4jV'},
        {'Benjamin - Criovozia': '80lPKtzJMPh1vjYMUgwe'},
        {'Ava - youthful and expressive German female voice': 'AnvlJBAqSLDzEevYr9Ap'},
        {'Giulia - sweet and soothing': 'CnVVMwhKmKZ6hKBAkL6Y'},
        {'Andy M - Italian male warm expressive': 'DLMxnwJE0a28JQLTMJPJ'},
        {'Dante - Italian, 30 years old': 'F7eI6slaNFiCSAjYVX5H'},
        {'Voce Minatore Audiolibro': 'F9w7aaEjfT09qV89OdY8'},
        {'Ronny Pro': 'IxprfqLvLirqXn7FdoLy'},
        {'Giacomo Andreoli': 'K1tUDof5PBLHFWSha7Rk'},
        {'Aaron Patrick - Fun-Upbeat': 'MP7UPhn7eVWqCGJGIh6Q'},
        {'Rossana': 'NHKPYzJJpg27vbywLSzX'},
        {'Gabriel - French high quality': 'PBm6YPbx7WbrxFTZwj3E'},
        {'Alessandro': 'PSp7S6ST9fDNXDwEzX0m'},
        {'Christopher': 'QRtC9QO1TMWv4NedDNQo'},
        {'Christopher - scientific mind': 'SKiSiJy90hYzWch2Gohz'},
        {'GianP - Social Media & Ads': 'SpoXt7BywHwFLisCTpQ3'},
        {'Hannah - assertive & refined': 'WS5NDpCHnVmKWdD3oolF'},
        {'Victor Power - Ebooks': 'YNOujSUmHtgN6anjqXPf'},
        {'ScheilaSMTy': 'cyD08lEy76q03ER1jZ7y'},
        {'Chris Basetta - Profonda': 'g1X9mrbeBlMAWtcs2Dfp'},
        {'Luca': 'kmIocz8ptnzGYxNhfW6f'},
        {'Francesco': 'lcweSB9PJMspXEFIqkPb'},
        {'Bill - Health Nutrition Videos': 'lnUnPeUhSI5EcqtFBux7'},
        {'Tyler Kurk': 'raMcNf2S8wCmuaBcyI6E'},
        {'Chris Basetta - Social Media': 't3hJ92dgZhDVtsff084B'},
        {'Elena - Stories and Narrations': 'tXgbXPnsMpKXkuTgvE3h'},
        {'Justin Time - eLearning Narration': 'uFIXVu9mmnDZ7dTKCBTX'},
        {'French Darling - For Kids Stories and Audiobooks': 'vTGV06pygfwa2WhLDZFp'},
        {'Emanuel': 'xKlYVm5xfEkeK36yeDDj'},
        {'Adam': 'yfg5cjOrqg6KVleh2la0'},
    ]

    def __init__(self, elevenlabs_key):
        self.api_key = elevenlabs_key
        self.base_url = "https://api.elevenlabs.io/v1/text-to-speech"

    def send(
        self,
        send: str,
        language: str,
        id_voice: str,
        stability: float = 0.8,
        similarity_boost: float = 0.5,
        style: float = 0.0,
        use_speaker_boost: bool = True,
        timeout: Optional[int] = 600,  # 10 minutos
    ) -> str:
        """
        Faz a requisição ao endpoint /with-timestamps e retorna o áudio em Base64.
        """
        url = f"{self.base_url}/{id_voice}/with-timestamps"

        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
        }

        payload = {
            "text": send,
            "voice_settings": {
                "stability": stability,
                "similarity_boost": similarity_boost,
                "style": style,
                "use_speaker_boost": use_speaker_boost,
                "speed": 0.95
            }
        }

        response = requests.post(url, headers=headers, json=payload, timeout=timeout)
        response.raise_for_status()

        data = response.json()
        audio_base64 = data.get("audio_base64")

        if not audio_base64:
            raise RuntimeError("O endpoint não retornou áudio válido")

        return audio_base64
