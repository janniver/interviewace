import os
from dotenv import load_dotenv
import openai
load_dotenv()

openai.api_key = os.getenv("GPT_API_KEY")

class GPT:
    def __init__(self, system_msg):
        self.messages = []
        self.messages.append({"role": "system", "content": system_msg})
        print("Your new assistant is ready!")

    def chat(self, input_message):
        print(input_message)
        self.messages.append({"role": "user", "content": input_message})
        response = openai.chat.completions.create(
            model = "gpt-4-1106-preview",
            messages = self.messages)
        reply = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": reply})
        return reply

if __name__ == "__main__":
    gpt = GPT(os.getenv("INITIALISATION_PROMPT"))
    print(gpt.chat("what are we doing"))