const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function evaluateAnswer(question, answer) {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
You are a technical interviewer.

Evaluate the candidate's answer and provide:

1. Score out of 10
2. One strength
3. One improvement suggestion
4. A perfect interview answer (2-3 lines)

STRICT FORMAT (do NOT change):

Score: X/10  
Strength: ...  
Improve: ...  
Perfect Answer: ...

Question: ${question}
Answer: ${answer}
      `,
    });

    // safeExtraction
    const output =
      response.output?.[0]?.content?.[0]?.text ||
      "AI feedback unavailable. Try again later.";

    return output;
  } catch (err) {
    console.log("OpenAI Error:", err.message);
    return null;
  }
}

module.exports = evaluateAnswer;
