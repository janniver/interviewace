from flask import Flask, request, jsonify
import os
from gpt import GPT
from speaker import Speaker

app = Flask(__name__)

interviewer = GPT(os.getenv("INITIALISATION_PROMPT"))
speaker = Speaker()
path = "../../audio_files/output.mp3"

@app.route('/start', methods=['POST'])
def start_script():
    # main logic
    print("---recieved---")
    question = request.json.get('question')
    print(question)
    reply = interviewer.chat(question)
    if speaker.speak(reply, path):
        return jsonify({'status': '200'})
    else:
        return jsonify({'status': '500'})


@app.route('/respond', methods=['POST'])
def respond():
    code = request.json.get('code')
    description = request.json.get('description')

    response = f"Code: {code} \n Description: {description}"
    reply = interviewer.chat(response)
    if speaker.speak(reply, path):
        return jsonify({'status': '200'})
    else:
        return jsonify({'status': '500'})


@app.route('/end', methods=['GET'])
def end():
    return "hello"


if __name__ == '__main__':
    app.run(debug=True)
