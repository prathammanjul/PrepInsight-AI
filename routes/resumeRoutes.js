const express = require("express");
const router = express.Router();

const {
  renderResumePage,
  analyzeResumeHandler,
} = require("../controllers/resumeController");

const { isLoggedIn, validateResume, uploadResume } = require("../middlewares");

const wrapAsync = require("../utils/wrapAsync");

// GET Resume page
router.get("/resume", isLoggedIn, renderResumePage);

// POST → Analyze resume
router.post(
  "/resume-analyze",
  uploadResume,
  isLoggedIn,
  validateResume,
  wrapAsync(analyzeResumeHandler),
);

module.exports = router;
