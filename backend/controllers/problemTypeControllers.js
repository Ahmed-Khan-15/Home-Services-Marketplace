import pool from "../config/db.js";

const getProblemTypesByService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const serviceResult = await pool.query(
            `SELECT
                id,
                name
             FROM services
             WHERE id = $1
             AND is_active = TRUE`,
            [serviceId]
        );

        if (serviceResult.rows.length === 0) {
            return res.status(404).json({
                message: "Service not found",
            });
        }

        const result = await pool.query(
            `SELECT
                id,
                name,
                description,
                display_order
             FROM problem_types
             WHERE service_id = $1
             AND is_active = TRUE
             ORDER BY display_order ASC, name ASC`,
            [serviceId]
        );

        res.status(200).json({
            service: serviceResult.rows[0],
            problemTypes: result.rows,
        });

    } catch (error) {
        console.error(
            "Get problem types by service error:",
            error
        );

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

export {
    getProblemTypesByService,
};