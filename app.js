require("dotenv").config(); // ✅ MUST BE FIRST

const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

const app = express();

// Models & Utils
const Question = require("./models/questionSchema");
const Answer = require("./models/answer");
const User = require("./models/user.js");

// Setup multer
const upload = require("./utils/multer");
//pdf parrser
const extractTextFromPDF = require("./utils/pdfParser");
const analyzeResume = require("./utils/resumeAnalyzer");
const evaluateAnswer = require("./utils/ai"); // AI from utils
const generateQuestion = require("./utils/generateQuestion");

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
    if (!req.user) {
      req.flash("error", "Please login first!");
      return res.redirect("/login");
    }

    if (!req.session.askedQuestions) {
      req.session.askedQuestions = [];
    }

    let question;
    let attempts = 0;

    do {
      question = await generateQuestion(topic, req.session.askedQuestions);
      attempts++;
    } while (req.session.askedQuestions.includes(question) && attempts < 5);

    req.session.askedQuestions.push(question);

    res.render("interview", {
      question,
      topic,
    });
  }),
);

// ------------------ SUBMIT ANSWER ------------------

app.post(
  "/interview",
  wrapAsync(async (req, res) => {
    const { answer, question, topic } = req.body;

    if (!req.user) {
      req.flash("error", "Please login first!");
      return res.redirect("/login");
    }

    const feedback = await evaluateAnswer(question, answer);
    if (!feedback) {
      req.flash(
        "error",
        "⚠ AI is currently unavailable. Please try again later.",
      );
      return res.redirect("/");
    }

    const scoreMatch = feedback.match(/Score: (\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    const newAnswer = new Answer({
      user: req.user._id,
      question,
      answer,
      feedback,
      score,
      topic,
    });

    await newAnswer.save();

    res.render("result", {
      answer,
      feedback,
      topic,
    });
  }),
);
// ------------------ TOPIC PAGE ------------------

app.get("/interview/:topic", (req, res) => {
  const { topic } = req.params;
  res.render("topic", { topic });
});

// ------------------ VIEW ANSWERS ------------------

// ------------------ Performance route ------------------
app.get(
  "/performance",
  wrapAsync(async (req, res) => {
    if (!req.user) {
      req.flash("error", "Please login first!");
      return res.redirect("/login");
    }

    const answers = await Answer.find({ user: req.user._id })
      .populate("question")
      .populate("user");

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
  }),
);

// ------------------ Resume route ------------------
app.get("/resume", (req, res) => {
  res.render("resume");
});

app.post(
  "/resume-analyze",
  upload.single("resumeFile"),
  wrapAsync(async (req, res) => {
    const file = req.file;
    const resumeText = req.body.resumeText;
    const jobDescription = req.body.jobDescription;

    let finalResume;
    if (file) {
      console.log("Cloudinary URL:", file.path);

      // EXTRACT TEXT FROM PDF
      finalResume = await extractTextFromPDF(file.path);
    } else {
      finalResume = resumeText;
    }
    if (!finalResume || !jobDescription) {
      req.flash("error", "Resume or JD missing");
      return res.redirect("/resume");
    }
    // console.log(finalResume);

    // AI ANALYSIS
    const result = await analyzeResume(finalResume, jobDescription);
    if (!result) {
      req.flash("error", "AI failed. Try again.");
      return res.redirect("/resume");
    }
    // console.log(result);
    res.render("resumeResult", { result });

    // res.send("PDF parsed successfully");
  }),
);
// ------------------ 404 ------------------

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// ------------------ ERROR HANDLER ------------------

app.use((err, req, res, next) => {
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
