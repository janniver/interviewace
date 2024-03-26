const silenceThreshold = -60; // in dB, threshold for considering silence
const silenceTime = 5000; // time in ms to wait for silence before stopping the recording
let silenceStart = null;
let audioChunks = [];
let mediaRecorder;

// Start recording from the microphone
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        source.connect(processor);
        processor.connect(audioContext.destination);

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);

        processor.onaudioprocess = event => {
            const input = event.inputBuffer.getChannelData(0);
            let sum = 0.0;

            for (let i = 0; i < input.length; ++i) {
                sum += input[i] * input[i];
            }

            const instantVolume = Math.log10(sum / input.length) * 10;
            checkSilence(instantVolume);
        };
    } catch (error) {
        console.error('Error starting audio recording:', error);
    }
}

// Check for silence
function checkSilence(volume) {
    if (volume < silenceThreshold) {
        if (!silenceStart) {
            silenceStart = new Date().getTime();
        } else {
            const elapsed = new Date().getTime() - silenceStart;
            if (elapsed > silenceTime) {
                stopRecording();
                silenceStart = null;
            }
        }
    } else {
        silenceStart = null;
    }
}

// Stop the recording and process the audio
function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendAudioToBackend(audioBlob);
        audioChunks = [];
    };
}

// Send the audio blob to the backend
function sendAudioToBackend(audioBlob) {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    fetch("http://your-backend-url.com/audio-endpoint", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => console.log("Response from backend:", data))
    .catch(error => console.error("Error sending audio to backend:", error));
}

// Start the recording process
startRecording();
