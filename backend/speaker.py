import os
from dotenv import load_dotenv
import openai
from pathlib import Path

openai.api_key = "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"

class Speaker:
    def __init__(self):
        pass

    def generateAudio(self, text):
        speech_file_path = Path(__file__).parent / "../output_audio/output.mp3"
        response = openai.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text
        )

        response.stream_to_file(speech_file_path)

if __name__ == "__main__":
    speaker = Speaker()
    speaker.generateAudio("damn, ivan is a legendary coder")