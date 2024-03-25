from flask import Flask, request, jsonify, make_response
import os
import random
import globals
from gpt import GPT
from speaker import Speaker
from transcriber import Transcriber
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app, support_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/login")
@cross_origin(origin='*', supports_credentials=True)
def login():
  return jsonify({'success': 'ok'})


waiting_lines = ["allow me a moment to process", "give me a second to think", "allow me some time to consider"]

interviewer = GPT(globals.INITIALISATION_PROMPT)
outputPath = "../../audio_files/output.mp3"
inputPath = "../../audio_files/input.mp3"
speaker = Speaker(outputPath)
transcriber = Transcriber(inputPath)

@app.route('/start', methods=['POST', 'FETCH', 'OPTIONS'])
@cross_origin(origin='*', supports_credentials=True)
def start_script():
    # main logic
    print("starting...")
    if request.method == "OPTIONS":
        print("sending cors preflight response")
        return _build_cors_preflight_response(make_response())
    print("---recieved---")
    question = request.json.get('question')
    print(question)
    reply = interviewer.chat(question)
    if speaker.speak(reply):
        print("---sent---")
        return _build_cors_preflight_response(jsonify({'status': '200'}))
    else:
        return _build_cors_preflight_response(jsonify({'status': '500'}))


@app.route('/respond', methods=['POST'])
@cross_origin(origin='*', supports_credentials=True)
def respond():
    code = request.json.get('code')
    description = request.json.get('description')
    
    if len(description) > 50:
        speaker.speak(random.choice(waiting_lines))

    response = f"Code: {code} \n Description: {description}"
    
    print(response)
    
    reply = interviewer.chat(response)
    if speaker.speak(reply):
        return _build_cors_preflight_response(jsonify({'status': '200'}))
    else:
        return _build_cors_preflight_response(jsonify({'status': '500'}))
    
    
@app.route('/listen', methods=['GET'])
@cross_origin(origin='*', supports_credentials=True)
def listen():
    user_input = transcriber.record()
    print(user_input)
    return _build_cors_preflight_response(jsonify({'input':user_input}))

@app.route('/end', methods=['GET'])
@cross_origin(origin='*', supports_credentials=True)
def end():
    return _build_cors_preflight_response("hello")

def _build_cors_preflight_response(response):
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

if __name__ == "__main__":
  app.run(host='0.0.0.0', port=8080, debug=True)