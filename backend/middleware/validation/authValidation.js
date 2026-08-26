const Joi = require("joi");

const signupSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required(),

    email: Joi.string()
        .email()
        .max(255)
        .allow(null, "")
        .optional(),

    phone: Joi.string()
        .min(7)
        .max(20)
        .required(),

    password: Joi.string()
        .min(8)
        .max(100)
        .required(),

    role: Joi.string()
        .valid("customer", "professional")
        .required(),
});


const loginSchema = Joi.object({
    phone: Joi.string()
        .required(),

    password: Joi.string()
        .required(),
});


const validateSignup = (req, res, next) => {
    const { error } = signupSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
        });
    }

    next();
};


const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
        });
    }

    next();
};


module.exports = {
    validateSignup,
    validateLogin,
};