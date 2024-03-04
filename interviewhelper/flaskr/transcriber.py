import os
import whisper
from dotenv import load_dotenv
import sounddevice as sd
import numpy as np
import soundfile as sf

# Configuration
fs = 44100  # Sample rate in Hz
channels = 1  # Number of audio channels
threshold = 0.01  # Silence threshold
silence_duration = 2  # Duration of silence to stop recording in seconds
block_duration = 0.1  # Duration of a block in seconds

# Initialize variables
silent_blocks_needed = silence_duration / block_duration
current_silent_blocks = 0
recording_blocks = []

load_dotenv()

# Parameters
RATE = 44100
CHANNELS = 1
sd.default.samplerate = RATE
sd.default.channels = CHANNELS
CHUNK = 1024
duration = 1
THRESHOLD = int(os.getenv("SILENCE_THRESHOLD"))  # Adjust this threshold based on your environment
SILENCE_DURATION = int(os.getenv("SILENCE_DURATION"))  # Stop recording after this duration of silence (in seconds)

class Transcriber:

    def __init__(self, path):
        self.path = path
        self.recording_done = False

    def callback(self, indata, frames, time, status):
        global current_silent_blocks, recording_blocks
        # Calculate RMS of the current block
        rms = np.sqrt(np.mean(indata**2))
        if rms < threshold:
            current_silent_blocks += 1
        else:
            current_silent_blocks = 0
        
        recording_blocks.append(indata.copy())
        if current_silent_blocks >= silent_blocks_needed:
            print("Recording done...")
            self.recording_done = True
            
    def record(self):
        try:
            with sd.InputStream(callback=self.callback, channels=channels, samplerate=fs, blocksize=int(fs * block_duration)):
                print("Recording... Press Ctrl+C to stop manually.")
                while True:
                    sd.sleep(1000)
                    if self.recording_done:
                        break
        except KeyboardInterrupt:
            print("Manual interruption by user.")

        # Concatenate and save the recording
        recording = np.concatenate(recording_blocks, axis=0)
        sf.write(path, recording, fs)
        model = whisper.load_model("base")
        result = model.transcribe(self.path)
        return result["text"]

if __name__ == "__main__":
    path = "../../audio_files/input.mp3"
    trans = Transcriber(path)
    print(trans.record())



