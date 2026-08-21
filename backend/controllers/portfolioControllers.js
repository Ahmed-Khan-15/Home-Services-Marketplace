const pool = require("../config/db");

const getPortfolio = async (req, res) => {

    try {

        const user_id = req.user.id;
        const filter = req.query.filter || "3_months";
        let dateCondition = "";
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
        const totalIncomeQuery = `SELECT COALESCE(SUM(amount), 0) AS income
                             FROM transactions WHERE user_id = $1 ${dateCondition}
                             AND transaction_type = 'income';`;

        const totalExpenseQuery = `SELECT COALESCE(SUM(amount), 0) AS expense
                             FROM transactions WHERE user_id = $1 ${dateCondition}
                             AND transaction_type = 'expense';`;

        const monthlyHistoryQuery = `SELECT DATE_TRUNC('month',transaction_date) AS month,
                             COALESCE(SUM( CASE WHEN transaction_type = 'income' THEN amount Else 0 END), 0) As monthly_income,
                             COALESCE(SUM( CASE WHEN transaction_type = 'expense' THEN amount Else 0 END), 0) As monthly_expense
                             FROM transactions WHERE user_id = $1 ${dateCondition}
                             GROUP BY DATE_TRUNC('month', transaction_date)
                             ORDER BY month DESC`;

        const monthlyCategoriesQuery = `SELECT
                            DATE_TRUNC('month', transaction_date) AS month,
                            categories.name AS category,
                            transaction_type,
                            SUM(amount) AS total
                            FROM transactions
                            JOIN categories
                            ON transactions.category_id = categories.id
                            WHERE transactions.user_id = $1
                            ${dateCondition}
                            GROUP BY
                            DATE_TRUNC('month', transaction_date),
                            categories.name,
                            transaction_type
                            ORDER BY
                            month DESC,
                            transaction_type,
                            total DESC;`;

        const [income, expense, monthlyHistory, monthlyCategories] =
            await Promise.all([
                pool.query(totalIncomeQuery, [user_id]),
                pool.query(totalExpenseQuery, [user_id]),
                pool.query(monthlyHistoryQuery, [user_id]),
                pool.query(monthlyCategoriesQuery, [user_id])
            ]);

        const totalIncome = Number(income.rows[0].income);
        const totalExpense = Number(expense.rows[0].expense);

        const balance = totalIncome - totalExpense;
        res.json({
            totalIncome,
            totalExpense,
            balance,
            monthlyHistory: monthlyHistory.rows,
            monthlyCategories: monthlyCategories.rows
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
    getPortfolio
};