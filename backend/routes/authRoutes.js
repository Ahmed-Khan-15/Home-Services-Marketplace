const express = require("express");

const {
    signup,
    login,
    getMe,
} = require("../controllers/authController");

const {
    authenticate,
} = require("../middleware/authMiddleware");

const {
    validateSignup,
    validateLogin,
} = require("../validators/authValidator");

const router = express.Router();

router.post(
    "/signup",
    validateSignup,
    signup
);

router.post(
    "/login",
    validateLogin,
    login
);

router.get(
    "/me",
    authenticate,
    getMe
);

module.exports = router;