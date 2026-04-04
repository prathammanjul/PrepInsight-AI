const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

const app = express();

// Models & Utils
const Question = require("./models/questionSchema");
const Answer = require("./models/answer");
const User = require("./models/user.js");

const { loginSchema, signupSchema } = require("./schema.js");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
// Packages
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");

// ------------------ VIEW ENGINE ------------------
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// ------------------ STATIC ------------------
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// ------------------ DATABASE ------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/interviewPrepDB")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// ------------------ SESSION ------------------
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
  }),
);

// ------------------ PASSPORT ------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------ FLASH ------------------
app.use(flash());

// ------------------ GLOBAL MIDDLEWARE ------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ------------------ ROUTES ------------------

// Home
app.get("/", (req, res) => {
  res.render("index");
});

// ------------------ SIGNUP ------------------

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post(
  "/signup",
  wrapAsync(async (req, res) => {
    const { error } = signupSchema.validate(req.body);

    if (error) {
      req.flash("error", error.details[0].message);
      return res.redirect("/signup");
    }

    const { username, email, password } = req.body;

    const newUser = new User({ username, email });
    await User.register(newUser, password);

    req.flash("success", "Welcome! Account created successfully 🎉");
    res.redirect("/login");
  }),
);

// ------------------ LOGIN ------------------

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  (req, res, next) => {
    const { error } = loginSchema.validate(req.body);

    if (error) {
      req.flash("error", error.details[0].message);
      return res.redirect("/login");
    }

    next();
  },
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back 🎉");
    res.redirect("/");
  },
);

// ------------------ LOGOUT ------------------

app.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out successfully 👋");
    res.redirect("/");
  });
});

// ------------------ INTERVIEW ------------------

app.get("/interview", (req, res) => {
  res.render("interviewHome");
});

app.get(
  "/interview/start",
  wrapAsync(async (req, res) => {
    const topic = req.query.topic || "backend";

    // 🔹 get topic-based questions
    const questions = await Question.find({ topic });

    // 🔹 initialize session storage
    if (!req.session.askedQuestions) {
      req.session.askedQuestions = [];
    }

    // 🔹 filter already asked questions
    const remainingQuestions = questions.filter(
      (q) => !req.session.askedQuestions.includes(q._id.toString()),
    );

    // 🔥 if all questions completed
    if (remainingQuestions.length === 0) {
      req.session.askedQuestions = []; // reset
      req.flash("success", "🎉 Interview completed!");
      return res.redirect(`/interview/${topic}`);
    }

    // 🔹 pick random question
    const randomQ =
      remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];

    // 🔹 store question id
    req.session.askedQuestions.push(randomQ._id.toString());

    res.render("interview", {
      question: randomQ.question,
      id: randomQ._id,
      topic: topic,
    });
  }),
);

app.post(
  "/interview",
  wrapAsync(async (req, res) => {
    const { answer, questionId, topic } = req.body;

    if (!req.user) {
      req.flash("error", "Please login first!");
      return res.redirect("/login");
    }

    const newAnswer = new Answer({
      user: req.user._id,
      question: questionId,
      answer,
    });

    await newAnswer.save();

    req.flash("success", "Answer submitted ✅");

    // 🔥 FIX: preserve topic
    res.redirect(`/interview/start?topic=${topic}`);
  }),
);

app.get("/interview/:topic", (req, res) => {
  const { topic } = req.params;

  res.render("topic", { topic });
});

app.get(
  "/answers",
  wrapAsync(async (req, res) => {
    if (!req.user) {
      req.flash("error", "Please login first!");
      return res.redirect("/login");
    }

    const answers = await Answer.find({ user: req.user._id })
      .populate("question")
      .populate("user");
    res.render("answer", { answers });
  }),
);

// ------------------ 404 ------------------

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// ------------------ ERROR HANDLER ------------------

app.use((err, req, res, next) => {
  // console.log(err);

  const { statusCode = 500, message = "Something went wrong!" } = err;

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).render("error", { message });
});

// ------------------ SERVER ------------------

app.listen(3000, () => {
  console.log("Server started on port 3000 🚀");
});
