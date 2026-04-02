const express = require("express");
const mongoose = require("mongoose");

const ejsMate = require("ejs-mate");

const app = express();
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.static("public"));

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const flash = require("connect-flash");
const { signupSchema } = require("./schema.js");

// 🔗 DATABASE CONNECTION
mongoose
  .connect("mongodb://127.0.0.1:27017/interviewPrepDB")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(flash());

//session middleware
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
  }),
);

//intialize passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Route
app.get("/", (req, res) => {
  res.render("index.ejs");
});

//sign up
app.get("/signup", (req, res) => {
  res.render("signup");
});

// submit signup form
app.post("/signup", async (req, res) => {
  try {
    // ✅ Validate first
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
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
});

//login route
app.get("/login", async (req, res) => {
  res.render("login");
});

// post login

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

// Server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
