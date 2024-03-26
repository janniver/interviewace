import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env['GPT_API_KEY'], // This is the default and can be omitted
});

class Input {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async listen() {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(this.filePath),
            model: "whisper-1",
        });

        console.log(transcription);
    }
}

const path = "../audio_files/input.mp3";
const input = new Input(path);
await input.listen();