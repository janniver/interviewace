import OpenAI from 'openai';
import dotenv from 'dotenv';
import player from 'play-sound';
import * as fs from 'fs';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env['GPT_API_KEY'], // This is the default and can be omitted
});

class Speaker {
    constructor(filePath) {
        this.filePath = filePath;
        this.player = player();
    }

    async speak(text) {
        console.log('To Speak: ', text);

        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });

        const fileStream = fs.createWriteStream(this.filePath);

        // Promisify the stream events
        await new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
            response.body.pipe(fileStream);
        });

        console.log('File saved at:', this.filePath);

        // Play the audio using the default audio player of your system
        this.player.play(this.filePath, (err) => {
            if (err) {
                console.error('Error playing audio:', err);
            } else {
                console.log('Audio file is playing...');
            }
        });
    }
}

const path = "../audio_files/output.mp3";
const speaker = new Speaker(path);
await speaker.speak("Hello, this is a test");