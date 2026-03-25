import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodIssue, type ZodSchema } from "zod";
import { tokenService } from "../services/token.service";
import { BadRequestError, UnauthorizedError } from "../utils/errors";

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
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new UnauthorizedError("Authentication Required");
	}

	const token = authHeader.substring(7);
	const { userId } = tokenService.verifyAccessToken(token);

	req.userId = userId;
	next();
};

export const validate = (schema: ZodSchema) => {
	return (req: Request, _: Response, next: NextFunction) => {
		try {
			const validatedData = schema.parse(req.body);
			req.body = validatedData;
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const messages = error.issues.map((err: ZodIssue) => ({
					field: err.path.join("."),
					message: err.message,
				}));

				throw new BadRequestError("Validation failed", messages);
			}

			next(error);
		}
	};
};
