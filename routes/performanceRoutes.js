const express = require("express");
const router = express.Router();

const { renderPerformance } = require("../controllers/performanceController");
const { isLoggedIn } = require("../middlewares");
const wrapAsync = require("../utils/wrapAsync");

// GET /performance
router.get("/performance", isLoggedIn, wrapAsync(renderPerformance));

module.exports = router;
