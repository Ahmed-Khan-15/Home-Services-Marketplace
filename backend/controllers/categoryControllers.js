const pool = require("../config/db");

const getCategory = async (req, res) => {
    try {

        const user_id = req.user.id;
        const query = `SELECT * FROM categories WHERE user_id IS NULL OR user_id = $1`;
        const result = await pool.query(query, [user_id]);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const getCategoryById = async (req, res) => {
    try {

        const user_id = req.user.id;
        const { id } = req.params;

        const categoryID = Number(id);

        if (Number.isNaN(categoryID)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const query = `SELECT * FROM categories WHERE id = $1 AND (user_id IS NULL OR user_id = $2);`;

        const result = await pool.query(query, [categoryID, user_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "categories not found"
            });
        }

        res.json(result.rows[0]);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }

};

const createCategory = async (req, res) => {

    try {

        const user_id = req.user.id;
        const { name } = req.body;
        const trimmedName = name.trim();

        if (!trimmedName) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const query1 = `SELECT *
                        FROM categories
                        WHERE
                        (user_id IS NULL OR user_id = $1)
                        AND LOWER(name) = LOWER($2);`;
            
        const check = await pool.query(query1, [user_id,trimmedName]);
        if( check.rowCount !== 0 ){
            return res.status(409).json({
                message: "Category already exists"
            });
        }
        const query = `
        INSERT INTO categories (
            user_id,
            name
            )
            VALUES ($1, $2)
            RETURNING *;
            `;
        const values = [
            user_id,
            name
        ];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};


const updateCategory = async (req, res) => {

    try {
        const user_id = req.user.id;
        
        const { id } = req.params;
        
        const categoryID = Number(id);

        if (Number.isNaN(categoryID)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }
        
        const { name } = req.body;
        const trimmedName = name.trim();

        if (!trimmedName) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }
        
        const query1 = `SELECT *
                        FROM categories
                        WHERE
                        (user_id IS NULL OR user_id = $1)
                        AND LOWER(name) = LOWER($2)
                        AND id != $3;`;
            
        const check = await pool.query(query1, [user_id,trimmedName,categoryID]);
        if( check.rowCount !== 0 ){
            return res.status(409).json({
                message: "Category already exists"
            });
        }
        const query = `
        UPDATE categories
        SET
        name = $1
        
        WHERE user_id = $2 AND id = $3
        RETURNING *;
        `;
        const values = [
            name,
            user_id,
            categoryID
        ];
        
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }
        res.status(200).json(result.rows[0]);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }

};


const deleteCategory = async (req, res) => {

    try {
        const user_id = req.user.id;

        const { id } = req.params;

        const categoryID = Number(id);

        if (Number.isNaN(categoryID)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const query = `
        DELETE FROM categories
        WHERE user_id =$1 AND id = $2
        RETURNING *;`;

        const value = [
            user_id,
            categoryID
        ];
        const result = await pool.query(query, value);
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Category not found or cannot be deleted"
            });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }

};



module.exports = {
    getCategory,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
};