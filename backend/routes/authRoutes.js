import express from "express";

import {
    signup,
    login,
    getMe,
} from "../controllers/authControllers.js";

import {
    authenticate,
} from "../middleware/authMiddleware.js";

import {
    validateSignup,
    validateLogin,
} from "../middleware/validation/authValidation.js";

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

export default router;