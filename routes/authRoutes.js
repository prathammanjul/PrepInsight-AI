const express = require("express");

const router = express.Router();

const passport = require("passport");

const {
  renderSignup,
  signup,
  renderLogin,
  login,
  logout,
} = require("../controllers/authController");

const {
  validateSignup,
  validateLogin,
  saveRedirectUrl,
} = require("../middlewares");

const wrapAsync = require("../utils/wrapAsync");

router.get("/signup", renderSignup);

router.post("/signup", validateSignup, wrapAsync(signup));

router.get("/login", renderLogin);

router.post(
  "/login",
  validateLogin,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  saveRedirectUrl,
  wrapAsync(login),
);

router.get("/logout", logout);

module.exports = router;
