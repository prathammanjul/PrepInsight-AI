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

1. Score out of 100
2. One strength
3. One improvement suggestion
4. A perfect interview answer (2-3 lines)

Return STRICT JSON ONLY (no text outside JSON):

{
  "score": number (0-100),
  "strength": "short point",
  "improvement": "short point",
  "perfectAnswer": "2-3 line ideal answer"
}

Rules:
- Keep it concise
- No explanations outside JSON
- Do NOT add markdown
- Give the perfectAnswer in the easiest, most beginner-friendly way so it is very easy for users to understand

Question: ${question}
Answer: ${answer}
      `,
    });

    const output = response.output?.[0]?.content?.[0]?.text || "";

    if (!output) return null;

    let jsonString = output
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const first = jsonString.indexOf("{");
    const last = jsonString.lastIndexOf("}");

    if (first !== -1 && last !== -1) {
      jsonString = jsonString.slice(first, last + 1);
    }

    try {
      return JSON.parse(jsonString);
    } catch (err) {
      console.log("JSON parse error:", err.message);
      return null;
    }
  } catch (err) {
    console.log("OpenAI Error:", err.message);
    return null;
  }
}

module.exports = evaluateAnswer;
