const express = require("express");
const mongoose = require("mongoose");

const ejsMate = require("ejs-mate");

const app = express();
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.static("public"));

// 🔗 DATABASE CONNECTION
mongoose
  .connect("mongodb://127.0.0.1:27017/interviewPrepDB")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Route
app.get("/", (req, res) => {
  res.render("index.ejs");
});

//sign up
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
