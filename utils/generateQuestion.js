const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateQuestion(topic) {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
You are a technical interviewer.

Generate ONE completely unique beginner-level interview question for topic: ${topic}.

Rules:
- The question must be simple and easy to understand
- Suitable for a beginner or fresher
- Focus on basic concepts (definitions, simple use cases)
- Do NOT ask advanced or tricky questions
- Do NOT repeat or rephrase previously asked questions
- Each question must be clearly different from earlier ones in this session
- Avoid asking similar variations of the same concept

Only return the question. Do not add explanation or extra text.
`,
    });

    return response.output[0].content[0].text.trim();
  } catch (err) {
    console.log("AI Question Error:", err.message);
    return "What is " + topic + "?"; // fallback
  }
}

module.exports = generateQuestion;
