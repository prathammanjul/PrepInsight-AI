const mongoose = require("mongoose");
const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  answer: {
    type: String,
    require,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Answer", answerSchema);
