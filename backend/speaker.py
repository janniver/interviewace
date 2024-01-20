import os
from dotenv import load_dotenv
from openai import OpenAI

openai.api_key = "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"

response = openai.audio.speech.create(
    model="tts-1",
    voice="alloy",
    input="Hello world! This is a streaming test.",
)

response.stream_to_file("output.mp3")