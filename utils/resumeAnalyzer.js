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
- Be highly critical and realistic (like a real ATS + recruiter)
- Consider keywords, skills, projects, experience, and formatting
- Evaluate both ATS parsing and recruiter impression
- Do NOT assume missing information
- Penalize missing keywords and irrelevant content

Return STRICT JSON ONLY (no explanation outside JSON):

{
  "score": number (0-100),
  "keywordMatchPercentage": number (0-100),
  "experienceMatchPercentage": number (0-100),
  "educationMatch": "Good" | "Average" | "Weak",
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "importantKeywordsMissing": ["keyword1", "keyword2"],
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "atsRisks": ["issue1", "issue2"],
  "atsTips": ["tip1", "tip2"],
  "recommendedBulletPoints": ["bullet1", "bullet2"],
  "recommendedKeywords": ["keyword1", "keyword2"]
}

Also suggest exact bullet points or keywords I should add to improve the score above 90+.

Resume:
${resumeText}

Job Description:
${jobDescription}
  `,
    });

    const output = response.output?.[0]?.content?.[0]?.text || "{}";

    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  } catch (err) {
    console.log("AI Resume Error:", err.message);
    return null;
  }
}

module.exports = analyzeResume;
