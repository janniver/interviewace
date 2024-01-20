import openai
openai.api_key = "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"

class GPT:
    def __init__(self, system_msg):
        self.messages = []
        self.messages.append({"role": "system", "content": system_msg})
        print("Your new assistant is ready!")

    def chat(self, input_message):
        self.messages.append({"role": "user", "content": input_message})
        response = openai.chat.completions.create(
            model = "gpt-3.5-turbo",
            messages = self.messages)
        reply = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": reply})
        return reply

# if __name__ == "__main__":
#     gpt = GPT("")
#     while True:
#         user_input = input("You: ")
#         if user_input.lower() in ["quit", "exit", "bye"]:
#             break
#         response = gpt.chat(user_input)
#         print("Chatbot: ", response)