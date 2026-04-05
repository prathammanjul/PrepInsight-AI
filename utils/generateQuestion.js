const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateQuestion(topic, previousQuestions = []) {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
You are a technical interviewer.

Generate ONE completely unique beginner and fresher level interview question for topic: ${topic}.

Previously asked questions:
${previousQuestions.join("\n")}

Rules:
- Do NOT repeat or rephrase any of the above questions
- The question must be beginner and freshers friendly
- Focus on basic concepts

Only return the question.
      `,
    });

    return response.output[0].content[0].text.trim();
  } catch (err) {
    console.log("AI Question Error:", err.message);

    return "Explain " + topic;
  }
}

module.exports = generateQuestion;
