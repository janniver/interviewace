require('dotenv').config();
const axios = require('axios');

async function callGpt(messages) {
  const model = process.env.GPT_MODEL;
  const apiKey = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model,
      messages: messages,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return null;
  }
}

function interviewChat(question) {
    const messages = [];
    const api_key = process.env.GPT_API_KEY;
    const system_msg = process.env.INITIALISATION_PROMPT;
    messages.push({ "role": "system", "content": system_msg });
    console.log("Your new assistant is ready!");
    messages.push({"role": "user", "content": question});
    const gptResponse = callGpt(messages);
    const reply = gptResponse.choices[0].message.content;
    //what does this line do?
    messages.append({"role": "assistant", "content": reply})
    //rough code, haven't converted to js yet (speaker is still in python)
    if speaker.speak(reply) {
      return 200;
    }
    else return 500;
}

export default (request, response) => {
    if (request.method !== 'POST' && request.method !== 'FETCH') {
      response.status(405).end();
      return;
    }
    const question = request.body.question;
    response.status(interviewChat(question)).end();
}