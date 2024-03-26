import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env['GPT_API_KEY'], // This is the default and can be omitted
});

class Speaker {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async speak(text) {
        console.log('To Speak: ', text);

        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
            responseType: 'arraybuffer'
        });

        const fileStream = fs.createWriteStream(this.filePath);

        response.body.pipe(fileStream);

        // new Promise((resolve, reject) => {
        //     fileStream.on('finish', () => {
        //         resolve(filePath);
        //     });
        //     fileStream.on('error', (err) => {
        //         reject(err);
        //     });
        // }).then((savedFilePath) => {
        //     console.log('File saved at:', savedFilePath);
        // }).catch((err) => {
        //     console.error('Error:', err);
        // });
    }
}

const path = "../audio_files/output.mp3";
const speaker = new Speaker(path);
await speaker.speak("hello");