import pool from "../config/db.js";

const getServicesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const categoryResult = await pool.query(
            `SELECT
                id,
                name
             FROM service_categories
             WHERE id = $1
             AND is_active = TRUE`,
            [categoryId]
        );

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                message: "Service category not found",
            });
        }

        const result = await pool.query(
            `SELECT
                id,
                name,
                description,
                display_order
             FROM services
             WHERE category_id = $1
             AND is_active = TRUE
             ORDER BY display_order ASC, name ASC`,
            [categoryId]
        );

        res.status(200).json({
            category: categoryResult.rows[0],
            services: result.rows,
        });

    } catch (error) {
        console.error("Get services by category error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

export {
    getServicesByCategory,
};