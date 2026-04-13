const express = require("express");
const router = express.Router();

const {
  renderInterviewHome,
  startInterview,
  submitAnswer,
} = require("../controllers/interviewController");

const { isLoggedIn } = require("../middlewares");
const wrapAsync = require("../utils/wrapAsync");

router.get("/interview", renderInterviewHome);

router.get("/interview/start", isLoggedIn, wrapAsync(startInterview));

router.post("/interview", isLoggedIn, wrapAsync(submitAnswer));

module.exports = router;
