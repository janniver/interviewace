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

from typing import Final
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

TOKEN: Final = "6918173757:AAGKtJHUAFaDFDkRNgAhkzhA-WoF9MsYbIg"
BOT_USERNAME: Final = "@e_t_a_bot"

gpt = GPT("")

# Commands
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hello! I am Ethan's Trusty Assistant.")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(gpt.chat("what can you help me with?"))

async def personality_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_input = update.message.text
    print(f"User ({update.message.chat.id}): '{user_input}'")
    if user_input[12:] == "":
        await update.message.reply_text("You can set a personality for me in the format: /personality *personality of your choice*")
        return
    prompt = "pretend you are a" + user_input[12:] + " assistant"
    global gpt
    gpt = GPT(user_input)
    await update.message.reply_text(gpt.chat(prompt))

# Responses
def handle_response(text: str) -> str:
    processed: str = text.lower().strip()
    return gpt.chat(processed)

async def handle_message(update: Update, context:ContextTypes.DEFAULT_TYPE):
    message_type: str = update.message.chat.type
    user_input: str = update.message.text

    print(f"User ({update.message.chat.id}) in {message_type}: '{user_input}'")

    if message_type == "group":
        if BOT_USERNAME in user_input:
            new_text: str = user_input.replace(BOT_USERNAME, "").strip()
            response: str = handle_response(new_text)
        else:
            return
    else:
        response: str = handle_response(user_input)

    print("Bot: ", response)
    await update.message.reply_text(response)

async def error(update: Update, context:ContextTypes.DEFAULT_TYPE):
    print(f"Update {update} caused eroor {context.error}")

if __name__ == "__main__":
    print("Starting bot...")
    app = Application.builder().token(TOKEN).build()

    # Commands
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("personality", personality_command))

    # Messages
    app.add_handler(MessageHandler(filters.TEXT, handle_message))

    # Errors
    app.add_error_handler(error)

    print("Polling...")
    app.run_polling(poll_interval = 3)
