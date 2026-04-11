const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");

const {
  renderInterviewHome,
  startInterview,
  submitAnswer,
} = require("../controllers/interviewController");

const { isLoggedIn } = require("../middlewares");

router.get("/interview", renderInterviewHome);

router.get("/interview/start", isLoggedIn, startInterview);

router.post("/interview", isLoggedIn, submitAnswer);

module.exports = router;
