const generateQuestion = require("../utils/generateQuestion");
const evaluateAnswer = require("../utils/ai");
const Answer = require("../models/answer");
const User = require("../models/user");

module.exports.renderInterviewHome = (req, res) => {
  res.render("interviewHome");
};
// START INTERVIEW (AI logic)
module.exports.startInterview = async (req, res) => {
  const topic = req.query.topic || "backend";

  if (!req.session.askedQuestions) {
    req.session.askedQuestions = [];
  }

  let question;
  let attempts = 0;

  do {
    question = await generateQuestion(topic, req.session.askedQuestions);
    attempts++;
  } while (req.session.askedQuestions.includes(question) && attempts < 5);

  const user = await User.findById(req.user._id);

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { interviewQuestions: 1 },
  });

  req.session.askedQuestions.push(question);

  res.render("interview", {
    question,
    topic,
    remaining: 5 - user.interviewQuestions,
  });
};

module.exports.submitAnswer = async (req, res) => {
  const { answer, question, topic } = req.body;

  const feedback = await evaluateAnswer(question, answer);

  if (!feedback) {
    req.flash("error", "AI failed");
    return res.redirect("/");
  }

  const scoreMatch = feedback.match(/Score: (\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

  await Answer.create({
    user: req.user._id,
    question,
    answer,
    feedback,
    score,
    topic,
  });

  res.render("result", { answer, feedback, topic });
};
