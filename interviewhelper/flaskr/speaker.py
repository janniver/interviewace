import os
import openai
from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.getenv("GPT_API_KEY")

class Speaker:
    def __init__(self):
        pass

    def speak(self, text, path):
        print(text)

        speech_file_path = path

        response = openai.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text
        )

        response.stream_to_file(speech_file_path)

        print("---saved---")

        print('playing sound using native player')
        os.system("afplay " + path)

        print("---played---")

        return True

if __name__ == "__main__":
    speaker = Speaker()
    path = "../../audio_files/output.mp3"
    speaker.speak("hello cuties", path)

