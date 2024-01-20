from flask import Flask, request, jsonify
import os
from gpt import GPT
from speaker import Speaker
from transcriber import Transcriber
from flask import Flask, request, jsonify
from flask_cors import CORS 

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

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
        response = jsonify({'status': '200'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000/')
        return response
    else:
        response = jsonify({'status': '500'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000/')
        return response


@app.route('/respond', methods=['POST'])
def respond():
    code = request.json.get('code')
    description = request.json.get('description')

    response = f"Code: {code} \n Description: {description}"
    reply = interviewer.chat(response)
    if speaker.speak(reply):
        response = jsonify({'status': '200'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000/')
        return response
    else:
        response = jsonify({'status': '500'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000/')
        return response
    
    
@app.route('/listen', methods=['GET'])
def listen():
    user_input = transcriber.record()
    print(user_input)
    return jsonify({'input':user_input}).headers.add('Access-Control-Allow-Origin', 'http://localhost:3000/')



@app.route('/end', methods=['GET'])
def end():
    return "hello"


if __name__ == '__main__':
    app.run(debug=True)
