import { z } from "zod";

const createRequestSchema = z.object({
    problem_type_id: z.coerce
        .number()
        .int()
        .positive(),

    address_id: z.coerce
        .number()
        .int()
        .positive(),

    description: z
        .string()
        .trim()
        .max(2000)
        .optional(),

    preferred_date: z
        .string()
        .datetime()
        .optional(),

    preferred_time_start: z
        .string()
        .datetime()
        .optional(),

    preferred_time_end: z
        .string()
        .datetime()
        .optional(),
});

const validateCreateRequest = (req, res, next) => {
    const result = createRequestSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.issues[0].message,
        });
    }

    req.body = result.data;

    next();
};

export {
    validateCreateRequest,
};