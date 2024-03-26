import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env['GPT_API_KEY'], // This is the default and can be omitted
});

class Speaker {
    constructor(path) {
        this.path = path;
    }

    async speak(text) {
        console.log(text);

        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text
        })

        fs.writeFileSync(this.path, response);
    }
}

const path = "../../audio_files/output.mp3";
const speaker = new Speaker(path);
await speaker.speak("hello");