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
    secret: process.env.SESSION_SECRET,
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
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

app.use("/", authRoutes);
app.use("/", interviewRoutes);
app.use("/", performanceRoutes);
app.use("/", resumeRoutes);

// Home
app.get(
  "/",
  wrapAsync(async (req, res) => {
    res.render("index");
  }),
);

// ------------------ PDF DOwnloader route ------------------

const generatePDF = require("./utils/generateReport");
const { wrap } = require("pdfkit");
const { any } = require("joi");

app.post(
  "/download-report",
  wrapAsync(async (req, res) => {
    const result = JSON.parse(req.body.result);

    generatePDF(res, result);
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
