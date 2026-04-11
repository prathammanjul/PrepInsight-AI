const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeResume(resumeText, jobDescription) {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
You are an advanced ATS (Applicant Tracking System) and technical recruiter.

Analyze the resume against the given job description.

Follow these rules strictly:
- Be highly critical and realistic
- Focus on keywords, skills, projects, and experience
- Penalize missing keywords
- Keep output SHORT and UI-friendly

Return STRICT JSON ONLY:

{
  "score": number,
  "keywordMatchPercentage": number,
  "experienceMatchPercentage": number,
  "educationMatch": "Good" | "Average" | "Weak",
  "matchingSkills": [],
  "missingSkills": [],
  "importantKeywordsMissing": [],
  "strengths": [],
  "weaknesses": [],
  "improvements": [],
  "atsRisks": [],
  "atsTips": [],
  "recommendedBulletPoints": [],
  "recommendedKeywords": []
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`,
    });

    const output = response.output?.[0]?.content?.[0]?.text || "";

    console.log("RAW AI OUTPUT:\n", output);

    if (!output) return null;

    const cleaned = output
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.log("JSON PARSE ERROR:", err.message);
      return null;
    }
  } catch (err) {
    console.log("AI Resume Error:", err.message);
    return null;
  }
}

module.exports = analyzeResume;
