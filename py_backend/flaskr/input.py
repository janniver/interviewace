import pyaudio
import wave
import audioop
import whisper
import globals
from dotenv import load_dotenv

load_dotenv()

# Parameters
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
THRESHOLD = int(globals.SILENCE_THRESHOLD)  # Adjust this threshold based on your environment
SILENCE_DURATION = int(globals.SILENCE_DURATION)  # Stop recording after this duration of silence (in seconds)


class Input:

    def __init__(self, path):
        self.path = path

    def record(self):
        audio = pyaudio.PyAudio()
        stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

        frames = []
        silent_frames = 0
        start_record = False

        try:
            while True:
                data = stream.read(CHUNK)

                # Calculate audio level
                rms = audioop.rms(data, 2)  # 2 corresponds to sample width in bytes

                if start_record:
                    frames.append(data)

                    # Check if the audio level is below the threshold
                    if rms < THRESHOLD:
                        silent_frames += 1
                    else:
                        silent_frames = 0

                    # Check if silence has persisted for the specified duration
                    if silent_frames >= int(RATE / CHUNK * SILENCE_DURATION):
                        print("Silence detected. Stopping recording.")
                        break
                elif rms >= THRESHOLD:
                    frames.append(data)
                    start_record = True
                    print("Recording started.")

        except KeyboardInterrupt:
            print("Keyboard detected. Stopping recording.")

        stream.stop_stream()
        stream.close()
        audio.terminate()

        # Saving audio data to a WAV file
        sound_file = wave.open(self.path, "wb")
        sound_file.setnchannels(CHANNELS)
        sound_file.setsampwidth(audio.get_sample_size(FORMAT))
        sound_file.setframerate(RATE)
        sound_file.writeframes(b''.join(frames))
        sound_file.close()
        model = whisper.load_model("base")
        result = model.transcribe(self.path)
        return result["text"]


if __name__ == "__main__":
    path = "../../audio_files/input.mp3"
    input = Input(path)
    print(input.record())