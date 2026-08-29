import { z } from "zod";

const signupSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(100),

    email: z
        .string()
        .email()
        .max(255)
        .nullable()
        .optional()
        .or(z.literal("")),

    phone: z
        .string()
        .min(7)
        .max(20),

    password: z
        .string()
        .min(8)
        .max(100),

    role: z
        .enum(["customer", "professional"]),
});

const loginSchema = z.object({
    phone: z
        .string()
        .min(1),

    password: z
        .string()
        .min(1),
});

const validateSignup = (req, res, next) => {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.issues[0].message,
        });
    }

    req.body = result.data;

    next();
};

const validateLogin = (req, res, next) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.issues[0].message,
        });
    }

    req.body = result.data;

    next();
};

export {
    validateSignup,
    validateLogin,
};