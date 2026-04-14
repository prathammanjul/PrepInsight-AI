const { loginSchema, signupSchema, resumeSchema } = require("./schema");
const User = require("./models/user");
const upload = require("./utils/multer");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.user) {
    req.session.redirectUrl = req.originalUrl; //
    req.flash("error", "Please login first!");
    return res.redirect("/login");
  }
  next();
};
module.exports.validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body);

  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect("/signup");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }
  next();
};

module.exports.validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect("/login");
  }

  next();
};

module.exports.validateResume = (req, res, next) => {
  const { error } = resumeSchema.validate(req.body);

  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect("/resume");
  }

  next();
};
module.exports.uploadResume = (req, res, next) => {
  upload.single("resumeFile")(req, res, function (err) {
    if (err) {
      if (err.message === "Only PDF files are allowed") {
        req.flash("error", err.message);
      } else if (err.code === "LIMIT_FILE_SIZE") {
        req.flash("error", "File too large (Max 2MB)");
      } else {
        req.flash("error", "File upload error");
      }

      return res.redirect("/resume"); //
    }

    //  only call next if no response sent
    if (!res.headersSent) {
      return next();
    }
  });
};

module.exports.checkResumeLimit = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.resumeChecks >= 2) {
    req.flash("error", "You have used your 2 free resume checks.");
    return res.redirect("/resume");
  }
  next();
};
module.exports.checkInterviewLimit = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.interviewQuestions >= 5) {
    req.flash("error", "You have used your 5 free interview questions.");
    return res.redirect("/interview");
  }
  next();
};
