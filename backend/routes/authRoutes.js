const express = require("express");

const {
    signup,
    login,
    getMe,
} = require("../controllers/authControllers");

const {
    authenticate,
} = require("../middleware/authMiddleware");

const {
    validateSignup,
    validateLogin,
} = require("../middleware/validation/authValidation");

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