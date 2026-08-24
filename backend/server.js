const pool = require("./config/db");
require("dotenv").config();

const cors = require("cors");
const express = require("express");
const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.CLIENT_URL
        ],
        credentials: true
    })
);

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Welcome to Home Services Marketplace API!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});