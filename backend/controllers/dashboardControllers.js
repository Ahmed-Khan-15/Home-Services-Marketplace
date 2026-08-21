const pool = require("../config/db");

const getDashboard = async (req, res) => {

    try {

        const user_id = req.user.id;

        const usernameQuery = `SELECT username
                               FROM users
                               WHERE id = $1;`;
        const incomeQuery = `SELECT COALESCE(SUM(amount), 0) AS monthly_income
                             FROM transactions WHERE user_id = $1 
                             AND transaction_type = 'income' 
                             AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
                             AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';`;

        const expenseQuery = `SELECT COALESCE(SUM(amount), 0) AS monthly_expense
                             FROM transactions WHERE user_id = $1 
                             AND transaction_type = 'expense' 
                             AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
                             AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';`;

        const categoryTransactionsQuery = `SELECT
                                           t.id,
                                           t.description,
                                           t.amount,
                                           t.transaction_type,
                                           t.transaction_date,
                                           c.id AS category_id,
                                           c.name AS category_name
                                       FROM transactions t
                                       JOIN categories c
                                           ON t.category_id = c.id
                                       WHERE t.user_id = $1
                                           AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
                                           AND t.transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
                                       ORDER BY
                                           c.name,
                                           t.transaction_date DESC;`;


        const categoryTransactions = await pool.query(categoryTransactionsQuery, [user_id]);
        const username = await pool.query(usernameQuery, [user_id]);
        const income = await pool.query(incomeQuery, [user_id]);
        const expense = await pool.query(expenseQuery, [user_id]);

        const incomeAmount = Number(income.rows[0].monthly_income);
        const expenseAmount = Number(expense.rows[0].monthly_expense);

        const savings = incomeAmount - expenseAmount;

        const groupedCategories = {};

        for (let i = 0; i < categoryTransactions.rows.length; i++) {
            const transaction = categoryTransactions.rows[i];

            if (!groupedCategories[transaction.category_name]) {
                groupedCategories[transaction.category_name] = {
                    id: transaction.category_id,
                    name: transaction.category_name,
                    total: 0,
                    transactions: []
                };

            }

            groupedCategories[transaction.category_name].transactions.push({
                id: transaction.id,
                description: transaction.description,
                amount: transaction.amount,
                transaction_type: transaction.transaction_type,
                transaction_date: transaction.transaction_date
            });

            groupedCategories[transaction.category_name].total += Number(transaction.amount);

        }

        const categories = Object.values(groupedCategories);

        res.json({
            username: username.rows[0].username,
            income: incomeAmount,
            expense: expenseAmount,
            savings,
            categories
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
    getDashboard
};