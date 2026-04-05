const mongoose = require("mongoose");
const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  question: {
    type: String,
  },
  answer: {
    type: String,
    require,
  },
  feedback: {
    type: String,
  },
  score: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Answer", answerSchema);
