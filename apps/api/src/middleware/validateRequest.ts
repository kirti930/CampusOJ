import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";

type ValidationTarget = "body" | "query" | "params";

/**
 * Usage: router.post('/login', validateRequest(LoginSchema), handler)
 * Defaults to validating req.body. Pass 'query' or 'params' for other targets.
 */
export function validateRequest(schema: ZodSchema, target: ValidationTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = (result.error as ZodError).flatten().fieldErrors;
      res.status(422).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
      return;
    }

    // Replace the target with the parsed (coerced + stripped) data
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}
