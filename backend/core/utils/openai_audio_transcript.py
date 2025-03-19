import os
import tempfile

from django.conf import settings
from openai import OpenAI

from core.utils.delete_file import delete_file


class OpenAISpeechToText:
    def __init__(self, openai_key):
        self.authorization = openai_key
        self.client = OpenAI(api_key=openai_key)

    def send(self, file):

        _, extension = os.path.splitext(file.name)

        # creates a temporary file to send for transcription
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=extension)
        temp_file.write(file.read())
        temp_file.close()

        # Open the temporary file
        send_file = open(temp_file.name, 'rb')

        # send the temporary file for transcription
        transcription = self.client.audio.transcriptions.create(
            model='whisper-1',
            file=send_file,
        )

        text = transcription.text
        # delete the temporary file.
        send_file.close()
        delete_file(temp_file.name)

        return text
