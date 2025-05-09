
const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const userMessage = body.message || '';

    if (!userMessage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "⚠️ Keine Nachricht erhalten. Bitte gib etwas ein." })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "⚠️ API-Key fehlt auf dem Server! Bitte in Netlify hinterlegen." })
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Du bist ein Kundenberater für fairprintsolutions.de. Antworte freundlich, sachlich und hilfsbereit." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "⚠️ OpenAI hat keine Antwort zurückgegeben." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: `⚠️ Fehler: ${error.message}` })
    };
  }
};
