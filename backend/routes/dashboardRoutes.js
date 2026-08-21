const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const { getDashboard } = require("../controllers/dashboardControllers");


router.get("/", authMiddleware, getDashboard);


module.exports = router;