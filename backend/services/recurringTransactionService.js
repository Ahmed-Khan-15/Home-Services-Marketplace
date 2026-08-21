const pool = require("../config/db");

const generateRecurringTransaction = async (recurringTransaction) => {

    const {
        id,
        user_id,
        category_id,
        description,
        amount,
        transaction_type,
        start_date,
        end_date,
        repeat_interval
    } = recurringTransaction;

    const startDate = new Date(start_date);
    const today = new Date();

    let currentDate = new Date(startDate);
    let generatedCount = 0;

    while (currentDate <= today) {

        if (end_date && currentDate > new Date(end_date)) {
            break;
        }

        const result = await pool.query(
            `INSERT INTO transactions
            (
                user_id,
                category_id,
                recurring_transaction_id,
                description,
                amount,
                transaction_type,
                transaction_date
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            ON CONFLICT (recurring_transaction_id, transaction_date)
            DO NOTHING
            RETURNING *`,
            [
                user_id,
                category_id,
                id,
                description,
                amount,
                transaction_type,
                currentDate
            ]
        );

        if (result.rowCount > 0) {
            generatedCount++;
        }

        if (repeat_interval === "daily") {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        else if (repeat_interval === "weekly") {
            currentDate.setDate(currentDate.getDate() + 7);
        }
        else if (repeat_interval === "monthly") {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        else if (repeat_interval === "yearly") {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        }

    }

    return generatedCount;
};

const processUserRecurringTransactions = async (user_id) => {

    const query = `SELECT * FROM recurring_transactions WHERE user_id = $1`;

    const result = await pool.query(query, [user_id]);

    let totalGenerated = 0;

    for (let i = 0; i < result.rows.length; i++) {
        let recurringTransaction = result.rows[i];

        const generatedCount = await generateRecurringTransaction(recurringTransaction);
        totalGenerated = totalGenerated + generatedCount;

    }
    return totalGenerated;
};

module.exports = {
    generateRecurringTransaction,
    processUserRecurringTransactions
};