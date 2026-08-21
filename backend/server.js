require("dotenv").config();
const cors = require("cors");
const express = require("express");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const categoriesRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const recurringTransactionRoutes = require("./routes/recurringTransactionRoutes");
const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.CLIENT_URL
    ],
    credentials: true
}));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/categories", categoriesRoutes );
app.use("/transactions", transactionRoutes );
app.use("/recurring_transactions", recurringTransactionRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to personal finance manager api!")
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}

)

