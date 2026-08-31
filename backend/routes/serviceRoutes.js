import express from "express";

import {
    getServicesByCategory,
} from "../controllers/serviceControllers.js";

const router = express.Router();

router.get(
    "/category/:categoryId",
    getServicesByCategory
);

export default router;