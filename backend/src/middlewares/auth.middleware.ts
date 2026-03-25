import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodIssue, type ZodSchema } from "zod";

import { TokenService } from "../services/token.service.js";

declare global {
	namespace Express {
		interface Request {
			userId?: number;
		}
	}
}

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Authentication Required" });
		}

		const token = authHeader.substring(7);
		const { userId } = TokenService.verifyAccessToken(token);

		req.userId = userId;
		next();
	} catch (error: any) {
		res.status(401).json({ error: "Invalid or expired token" });
	}
};

export const validate = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.parse(req.body);
			req.body = validatedData;
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const messages = (error as ZodError).issues.map((err: ZodIssue) => ({
					field: err.path.join("."),
					message: err.message,
				}));

				return res.status(400).json({
					error: "Validation failed",
					details: messages,
				});
			}

			return res.status(500).json({ error: "Internal validation error" });
		}
	};
};
