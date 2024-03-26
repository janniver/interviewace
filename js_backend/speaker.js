import OpenAI from 'openai';

const fs = require('fs');
const { exec } = require('child_process');
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_API_KEY, // This is the default and can be omitted
});

class Speaker {
    constructor(path) {
        this.path = path;
    }

    speak(text) {
        console.log(text);

        openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text
        }).then(response => {
            const fileStream = fs.createWriteStream(this.path);
            response.data.pipe(fileStream);

            fileStream.on('finish', () => {
                console.log("---saved---");
                console.log('playing sound using native player');
                exec(`afplay ${this.path}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return;
                    }
                    console.log("---played---");
                });
            });
        }).catch(error => {
            console.error("Error:", error);
        });
    }
}

if (require.main === module) {
    const path = "../../audio_files/output.mp3";
    const speaker = new Speaker(path);
    speaker.speak("hello");
}