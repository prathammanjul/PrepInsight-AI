const extractTextFromPDF = require("../utils/pdfParser");
const analyzeResume = require("../utils/resumeAnalyzer");
const User = require("../models/user");

module.exports.renderResumePage = (req, res) => {
  res.render("resume");
};

module.exports.analyzeResumeHandler = async (req, res) => {
  const file = req.file;
  const resumeText = req.body.resumeText;
  const jobDescription = req.body.jobDescription;

  let finalResume;

  //  FILE OR TEXT
  if (file) {
    finalResume = await extractTextFromPDF(file.path);
  } else {
    finalResume = resumeText;
  }

  //  VALIDATION
  if (!finalResume || !jobDescription) {
    req.flash("error", "Resume or JD missing");
    return res.redirect("/resume");
  }

  //  AI ANALYSIS
  const result = await analyzeResume(finalResume, jobDescription);

  if (!result) {
    req.flash("error", "AI failed. Try again.");
    return res.redirect("/resume");
  }
  await User.findByIdAndUpdate(req.user._id, { $inc: { resumeChecks: 1 } });

  //  RENDER RESULT
  res.render("resumeResult", {
    result,
    resumeText: finalResume,
  });
};
