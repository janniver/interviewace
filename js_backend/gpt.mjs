import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env['GPT_API_KEY'], // This is the default and can be omitted
});

class GPT {

  constructor(system_msg) {
    this.messages = []
    this.messages.push({role: "system", content: system_msg})
    console.log("Your new assistant is ready!")
  }

  async chat(input_message) {
    console.log(input_message);
    this.messages.push({role: "user", content: input_message})
    const chatCompletion = await openai.chat.completions.create({
      messages: this.messages,
      model: 'gpt-3.5-turbo',
    });
    const reply = chatCompletion.choices[0].message.content
    this.messages.push({role: "assistant", content: reply});
    return reply
  }

  async stream_chat(input_message){
    console.log(input_message);
    this.messages.push({role: "user", content: input_message})
    const stream = await openai.chat.completions.create({
      messages: this.messages,
      model: 'gpt-3.5-turbo',
      stream: true,
    });
    for await (const chunk of stream) {
      console.log(chunk.choices[0]?.delta?.content || '');
    }
  }

}

const gpt = new GPT("you are my personal assisstant");
console.log(await gpt.stream_chat("write me a 500 word poem"))

