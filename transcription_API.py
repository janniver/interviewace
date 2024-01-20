import openai
import json 

#API Key
openai.api_key = "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"

audio_file = open("/Users/kailashgautham/OneDrive/Documents/My Songs/High Beams.mp3", "rb")
transcript = openai.Audio.transcribe("whisper-1", audio_file)
lyrics = open("High Beams Lyrics.txt", "w")
print(transcript.text)
lyrics.write(transcript.text)