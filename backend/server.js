import "dotenv/config";

import cors from "cors";
import express from "express";

import authRoutes from "./routes/authRoutes.js";
import serviceCategoryRoutes from "./routes/serviceCategoryRoutes.js";

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.CLIENT_URL,
        ],
        credentials: true,
    })
);

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/auth", authRoutes);
app.use("/categories", serviceCategoryRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to Home Services Marketplace API!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});