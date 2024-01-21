from flask import Flask, request, jsonify
import os
import random
from gpt import GPT
from speaker import Speaker
from transcriber import Transcriber
from flask import Flask, request, jsonify
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

waiting_lines = ["allow me a moment to process", "give me a second to think", "allow me some time to consider"]

interviewer = GPT(os.getenv("INITIALISATION_PROMPT"))
outputPath = "../../audio_files/output.mp3"
inputPath = "../../audio_files/input.mp3"
speaker = Speaker(outputPath)
transcriber = Transcriber(inputPath)

@app.route('/start', methods=['POST'])
def start_script():
    # main logic
    print("---recieved---")
    question = request.json.get('question')
    print(question)
    reply = interviewer.chat(question)
    if speaker.speak(reply):
        print("---sent---")
        return jsonify({'status': '200'})
    else:
        return jsonify({'status': '500'})


@app.route('/respond', methods=['POST'])
def respond():
    code = request.json.get('code')
    description = request.json.get('description')
    
    if len(description) > 50:
        speaker.speak(random.choice(waiting_lines))

    response = f"Code: {code} \n Description: {description}"
    
    print(response)
    
    reply = interviewer.chat(response)
    if speaker.speak(reply):
        return jsonify({'status': '200'})
    else:
        return jsonify({'status': '500'})
    
    
@app.route('/listen', methods=['GET'])
def listen():
    user_input = transcriber.record()
    print(user_input)
    return jsonify({'input':user_input})



@app.route('/end', methods=['GET'])
def end():
    return "hello"


if __name__ == '__main__':
    app.run(debug=True)
