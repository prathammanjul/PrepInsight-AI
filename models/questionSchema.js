const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  topic: String,
  question: {
    type: String,
    required: true,
  },
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
