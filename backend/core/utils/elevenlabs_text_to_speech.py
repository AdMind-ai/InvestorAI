import base64
import io
import json
import tempfile
from typing import Iterator

from django.conf import settings
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs


class ElevenlabsTextToSpeech:

    CUSTOM_VOICES = {
        'sRveAWnt4yJqxspzpLhv': {
            'it': 'PSp7S6ST9fDNXDwEzX0m'
        },
        'iYm4Mj4mf3x5liAlkFQ0': {
            'it': 'PSp7S6ST9fDNXDwEzX0m'
        }
    }

    def __init__(self, elevenlabs_key):
        self.client = ElevenLabs(api_key=elevenlabs_key)

    def send(
        self,
        send,
        language,
        id_voice,
        stability,
        similarity_boost,
        style,
        use_speaker_boost,
    ):

        if id_voice in ["sRveAWnt4yJqxspzpLhv", "iYm4Mj4mf3x5liAlkFQ0", ]:
            poss_text_to_speech_id_voice = self.CUSTOM_VOICES.get(
                id_voice, {}).get(language)
            text_to_speech_id_voice = poss_text_to_speech_id_voice if poss_text_to_speech_id_voice else 'nPczCjzI2devNBz1zQrb'

            audio = self.client.text_to_speech.convert(
                language_code=language,
                voice_id=text_to_speech_id_voice,
                output_format='mp3_22050_32',
                text=send,
                model_id='eleven_multilingual_v2',
                voice_settings=VoiceSettings(
                    stability=stability,
                    similarity_boost=similarity_boost,
                    style=style,
                    use_speaker_boost=use_speaker_boost,
                    speed=0.95,
                ),
            )

            if isinstance(audio, Iterator):
                audio = b''.join(audio)

            buffered = io.BytesIO(audio)

            temp_file = tempfile.NamedTemporaryFile(
                delete=False, suffix='.mp3')
            temp_file.write(buffered.read())
            temp_file.close()

            audio = self.client.speech_to_speech.convert(
                voice_id=id_voice,
                output_format='mp3_22050_32',
                audio=open(temp_file.name, 'rb'),
                model_id='eleven_multilingual_sts_v2',
                voice_settings=json.dumps(
                    {
                        "stability": stability,
                        "similarity_boost": similarity_boost,
                        "style": 0.6,
                        "use_speaker_boost": use_speaker_boost,
                        "speed": 0.95,
                    }
                ))

            if isinstance(audio, Iterator):
                audio = b''.join(audio)

            buffered = io.BytesIO(audio)
        else:
            audio = self.client.text_to_speech.convert(
                language_code=language,
                voice_id=id_voice,
                output_format='mp3_22050_32',
                text=send,
                model_id='eleven_turbo_v2_5',
                voice_settings=VoiceSettings(
                    stability=stability,
                    similarity_boost=0.0,
                    style=style,
                    use_speaker_boost=use_speaker_boost,
                ),
            )

            if isinstance(audio, Iterator):
                audio = b''.join(audio)

            buffered = io.BytesIO(audio)

        return base64.b64encode(buffered.getvalue()).decode('utf-8')
