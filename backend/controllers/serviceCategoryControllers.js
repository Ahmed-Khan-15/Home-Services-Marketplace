import pool from "../config/db.js";

const getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                name,
                description,
                display_order
             FROM service_categories
             WHERE is_active = TRUE
             ORDER BY display_order ASC, name ASC`
        );

        res.status(200).json({
            categories: result.rows,
        });

    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

export {
    getCategories,
};