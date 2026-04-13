const Answer = require("../models/answer");

module.exports.renderPerformance = async (req, res) => {
  const answers = await Answer.find({ user: req.user._id }).populate("user");
  // .populate("question")

  const total = answers.length;

  const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);

  const avgScore = total ? (totalScore / total).toFixed(1) : 0;

  const bestScore = answers.length
    ? Math.max(...answers.map((a) => a.score || 0))
    : 0;

  res.render("performance", {
    total,
    avgScore,
    bestScore,
    answers,
  });
};
