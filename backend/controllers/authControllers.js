const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const {
    processUserRecurringTransactions
} = require("../services/recurringTransactionService");

const signup = async (req, res) => {

    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const result = await pool.query("SELECT * FROM users WHERE email = $1;", [email]);

        if (result.rowCount !== 0) {
            return res.status(409).json({
                message: "Email already exists!"
            });
        }

        const query = `INSERT INTO users(
        username,
        email,
        password_hash
    ) VALUES ( $1, $2, $3) RETURNING *;`;

        const password_hash = await bcrypt.hash(password, 10);

        const values = [username, email, password_hash];

        const result2 = await pool.query(query, values);

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: result2.rows[0].id,
                username: result2.rows[0].username,
                email: result2.rows[0].email
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "something went wrong!"
        });
    }


};

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Enter all the required fields"
            });
        }

        const result = await pool.query("SELECT id,password_hash FROM users WHERE email = $1;", [email]);

        if (result.rowCount === 0) {
            return res.status(401).json({
                message: "Invalid email or password.!"
            });
        }

        const isMatch = await bcrypt.compare(password, result.rows[0].password_hash);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        await processUserRecurringTransactions(result.rows[0].id);

        const token = jwt.sign(
            { id: result.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login Successful!",
            token
        });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "something went wrong!"
        });
    }
};

module.exports = {
    signup,
    login
};