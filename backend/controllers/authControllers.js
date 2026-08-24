const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const signup = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE phone = $1 OR email = $2",
            [phone, email || null]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "A user with this phone or email already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
                (name, email, phone, password_hash, role)
             VALUES
                ($1, $2, $3, $4, $5)
             RETURNING id, name, email, phone, role, phone_verified, is_active, created_at`,
            [
                name,
                email || null,
                phone,
                passwordHash,
                role,
            ]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user,
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};


const login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const result = await pool.query(
            `SELECT
                id,
                name,
                email,
                phone,
                password_hash,
                role,
                phone_verified,
                is_active
             FROM users
             WHERE phone = $1`,
            [phone]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid phone or password",
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                message: "Your account is inactive",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid phone or password",
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        delete user.password_hash;

        res.status(200).json({
            message: "Login successful",
            token,
            user,
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};


const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                name,
                email,
                phone,
                role,
                phone_verified,
                is_active,
                created_at,
                updated_at
             FROM users
             WHERE id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            user: result.rows[0],
        });

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};


module.exports = {
    signup,
    login,
    getMe,
};