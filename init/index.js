const mongoose = require("mongoose");
const questions = require("./data");
const Question = require("../models/questionSchema");

mongoose
  .connect("mongodb://127.0.0.1:27017/interviewPrepDB")
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

const initDB = async () => {
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log("Data initialized ");
};

initDB();
