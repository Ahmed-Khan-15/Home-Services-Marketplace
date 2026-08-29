const pool = require("../config/db");

const getTransactions = async (req, res) => {
    try {

        const user_id = req.user.id;
        const { filter } = req.query;
        if (
            filter !== "this_month" &&
            filter !== "3_months" &&
            filter !== "6_months" &&
            filter !== "1_year" &&
            filter !== "all_time"
        ) {
            return res.status(400).json({
                message: "Invalid filter"
            });
        }
        let dateCondition = "";
        if (filter === "this_month") {
            dateCondition = `
        AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' `;
        }
        else if (filter === "3_months") {
            dateCondition = `
        AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 month'
        AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' `;
        }
        else if (filter === "6_months") {
            dateCondition = `
        AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 month'
        AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' `;
        }
        else if (filter === "1_year") {
            dateCondition = `
        AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 month'
        AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' `;
        }
        else {
            dateCondition = "";
        }
        const result = await pool.query(`SELECT t.id,
                                                t.description,
                                                t.amount,
                                                t.transaction_type,
                                                t.transaction_date,
                                                c.id AS category_id,
                                                c.name AS category_name
                                                FROM transactions t
                                                JOIN categories c
                                                    ON t.category_id = c.id
                                                WHERE t.user_id = $1 ${dateCondition}
                                                ORDER BY
                                                t.transaction_date DESC;`, [user_id]);

        const groupedTransactions = {};

        for (let i = 0; i < result.rows.length; i++) {
            const transaction = result.rows[i];

            const monthYear = new Date(transaction.transaction_date).toLocaleDateString("en-US",
                {
                    month: "long",
                    year: "numeric"
                }
            );

            if (!groupedTransactions[monthYear]) {
                groupedTransactions[monthYear] = {
                    month: monthYear,
                    transactions: []
                };

            }

            groupedTransactions[monthYear].transactions.push({
                id: transaction.id,
                description: transaction.description,
                amount: transaction.amount,
                transaction_type: transaction.transaction_type,
                transaction_date: transaction.transaction_date,
                category_name: transaction.category_name
            });


        }

        const months = Object.values(groupedTransactions);

        res.json({
            months
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const getTransactionById = async (req, res) => {
    const { id } = req.params;

    const transactionId = Number(id);

    if (Number.isNaN(transactionId)) {
        return res.status(400).json({
            message: "Invalid transaction ID"
        });
    }

    try {
        const user_id = req.user.id;
        const result = await pool.query("SELECT * FROM transactions WHERE id = $1 AND user_id = $2;", [transactionId, user_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Transaction not found"
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

const createTransaction = async (req, res) => {

    try {

        const user_id = req.user.id;

        const {
            category_id,
            recurring_transaction_id,
            description,
            amount,
            transaction_type,
            transaction_date } = req.body;



        const query = `
            INSERT INTO transactions (
                user_id,
                category_id,
                recurring_transaction_id,
                description,
                amount,
                transaction_type,
                transaction_date
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
                `;
        const values = [
            user_id,
            category_id,
            recurring_transaction_id,
            description,
            amount,
            transaction_type,
            transaction_date
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


const updateTransaction = async (req, res) => {

    try {

        const user_id = req.user.id;

        const { id } = req.params;

        const transactionId = Number(id);
        if (Number.isNaN(transactionId)) {
            return res.status(400).json({
                message: "Invalid transaction ID"
            });
        }

        const {
            category_id,
            amount,
            description,
            transaction_type,
            transaction_date
        } = req.body;



        const query = `
            UPDATE transactions
            SET
                category_id = $1,
                amount = $2,
                description = $3,
                transaction_type = $4,
                transaction_date = $5
                
            WHERE id = $6 AND user_id = $7
            RETURNING *;
                `;
        const values = [
            category_id,
            amount,
            description,
            transaction_type,
            transaction_date,
            transactionId,
            user_id
        ];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Transaction not found"
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


const deleteTransaction = async (req, res) => {

    try {


        const user_id = req.user.id;

        const { id } = req.params;

        const transactionId = Number(id);

        if (Number.isNaN(transactionId)) {
            return res.status(400).json({
                message: "Invalid transaction ID"
            });
        }


        const query = `
        DELETE FROM transactions
        WHERE id = $1 AND user_id = $2
        RETURNING *;`;

        const value = [
            transactionId,
            user_id
        ];
        const result = await pool.query(query, value);
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Transaction not found"
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


const deleteTransactions = async (req, res) => {
    try {

        const user_id = req.user.id;

        const { transactionIds } = req.body;

        if (
            !Array.isArray(transactionIds) ||
            transactionIds.length === 0
        ) {
            return res.status(400).json({
                message: "No transactions selected"
            });
        }

        const valid = transactionIds.every(id => Number.isInteger(id));

        if (!valid) {
            return res.status(400).json({
                message: "Invalid transaction ID"
            });
        }


        const query = `
        DELETE FROM transactions
        WHERE id = ANY($1) AND user_id = $2
        RETURNING *;`;

        const value = [
            transactionIds,
            user_id
        ];
        const result = await pool.query(query, value);
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }
        res.status(200).json({
            message: "Transactions deleted successfully",
            deleted: result.rowCount
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }

};



module.exports = {
    getTransactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransactions,
    deleteTransaction
};