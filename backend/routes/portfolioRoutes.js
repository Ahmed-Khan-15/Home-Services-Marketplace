const express = require("express");
const router = express.Router();

const { getPortfolio } = require("../controllers/portfolioControllers");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getPortfolio);

module.exports = router;