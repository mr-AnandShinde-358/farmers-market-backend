import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// z.ZodTypeAny use karne se 'AnyZodObject' wala error gayab ho jayega
export const validate = (schema: z.ZodTypeAny) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
           const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            }) as any;
             req.body = parsed.body;
             req.query = parsed.query;
             req.params = parsed.params;

      next();
            // return next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation data Error",
                    errors: error.issues.map((issue) => ({
                        // Agar path khali hai toh full path dikhaye
                        field: issue.path.join('.'), 
                        message: issue.message,
                    }))
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    };