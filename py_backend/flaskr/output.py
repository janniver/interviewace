import os
import openai
from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.getenv("GPT_API_KEY")

class Output:
    def __init__(self, path):
        self.path = path

    def speak(self, text):
        print(text)

        with openai.audio.speech.with_streaming_response.create(
                model="tts-1",
                voice="alloy",
                input=text
        ) as response:
            response.stream_to_file(self.path)

        print("---saved---")

        print('playing sound using native player')
        os.system("afplay " + self.path)

        print("---played---")

        return True

if __name__ == "__main__":
    path = "../../audio_files/output.mp3"
    output = Output(path)
    output.speak("hello there my name is ethan")

