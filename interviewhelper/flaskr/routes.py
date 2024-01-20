from flask import Flask, request, jsonify
import backend.gpt as gpt
import backend.speaker as speaker
import backend.transcriber as transcriber
import backend.transcription_API as transcription_API
import os
from backend.gpt import GPT

app = Flask(__name__)

interviewer = GPT(os.getenv("INITIALISATION_PROMPT"))

@app.route('/start', methods=['POST'])
def start_script():
    # main logic
    question = request.json.get('question')
    interviewer.chat(question)    
    return jsonify({'status': '200'})

if __name__ == '__main__':
    app.run(debug=True)
