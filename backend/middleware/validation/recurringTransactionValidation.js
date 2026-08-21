const Joi = require("joi");

const recurringTransactionSchema = Joi.object({

    category_id: Joi.number().required(),
    description: Joi.string().max(100).allow("", null),
    amount: Joi.number().positive().required(),
    transaction_type: Joi.string().valid("income", "expense").required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().allow(null),
    repeat_interval: Joi.string().valid("daily", "weekly", "monthly", "yearly").required()

});

const validateRecurringTransaction = (req, res, next) => {
    const { error } = recurringTransactionSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next();
};

module.exports = validateRecurringTransaction;