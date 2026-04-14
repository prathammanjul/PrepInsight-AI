const express = require("express");
const router = express.Router();

const {
  renderResumePage,
  analyzeResumeHandler,
} = require("../controllers/resumeController");

const {
  isLoggedIn,
  validateResume,
  uploadResume,
  checkResumeLimit,
} = require("../middlewares");

const wrapAsync = require("../utils/wrapAsync");

// GET Resume page
router.get("/resume", isLoggedIn, renderResumePage);

// POST → Analyze resume
router.post(
  "/resume-analyze",
  isLoggedIn,
  uploadResume,
  validateResume,
  checkResumeLimit,
  wrapAsync(analyzeResumeHandler),
);

module.exports = router;
