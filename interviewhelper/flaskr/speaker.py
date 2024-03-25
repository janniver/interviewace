import os
import openai
from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.getenv("GPT_API_KEY")

class Speaker:
    def __init__(self, path):
        self.path = path

    def speak(self, text):
        print(text)

        response = openai.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text
        )

        response.stream_to_file(self.path)

        print("---saved---")

        print('playing sound using native player')
        os.system("afplay " + self.path)

        print("---played---")

        return True

if __name__ == "__main__":
    path = "../../audio_files/output.mp3"
    speaker = Speaker(path)
    speaker.speak("hello cuties")

