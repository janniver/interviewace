import OpenAI from 'openai';
import dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GPT_API_KEY
});

async function voiceGenerator(text, filePath) {
    console.log('voiceGenerator is triggered');
    console.log('text:', text);

    const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
        responseType: 'arraybuffer'
    });

    const fileStream = fs.createWriteStream(filePath);

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

// Example usage
const text = "hello my name is ethan";
const filePath = "../audio_files/output.mp3";

voiceGenerator(text, filePath);
