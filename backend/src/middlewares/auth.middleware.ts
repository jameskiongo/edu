import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodIssue, type ZodSchema } from "zod";
import { db } from "../db/db";
import { users } from "../db/schema";
import { tokenService } from "../services/token.service";
import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from "../utils/errors";
import { eq } from "drizzle-orm";

declare global {
	namespace Express {
		interface Request {
			userId?: number;
			userRole?: "ADMIN" | "TEACHER" | "STUDENT";
		}
	}
}

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new UnauthorizedError("Authentication Required");
		}

		const token = authHeader.substring(7);
		const { userId } = tokenService.verifyAccessToken(token);

		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				id: true,
				role: true,
				isActive: true,
			},
		});

		if (!user) {
			throw new UnauthorizedError("User not found");
		}

		if (!user.isActive) {
			throw new ForbiddenError("Account is deactivated");
		}

		req.userId = user.id;
		req.userRole = user.role as "ADMIN" | "TEACHER" | "STUDENT";
		next();
	} catch (error) {
		next(error);
	}
};

export const optionalAuthenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return next();
		}

		const token = authHeader.substring(7);
		const { userId } = tokenService.verifyAccessToken(token);

		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				id: true,
				role: true,
				isActive: true,
			},
		});

		if (user && user.isActive) {
			req.userId = user.id;
			req.userRole = user.role as "ADMIN" | "TEACHER" | "STUDENT";
		}
		
		next();
	} catch (error) {
		// Even if token is invalid, we continue as guest
		next();
	}
};

export const authorize = (roles: ("ADMIN" | "TEACHER" | "STUDENT")[]) => {
	return (req: Request, _: Response, next: NextFunction) => {
		if (!req.userId || !req.userRole) {
			throw new UnauthorizedError("Not authenticated");
		}

		if (!roles.includes(req.userRole)) {
			throw new ForbiddenError("Insufficient permissions");
		}

		next();
	};
};

export const validate = (schema: ZodSchema) => {
	return (req: Request, _: Response, next: NextFunction) => {
		try {
			console.log("[Validate] Incoming body:", JSON.stringify(req.body, null, 2));
			const validatedData = schema.parse(req.body);
			console.log("[Validate] Success:", JSON.stringify(validatedData, null, 2));
			req.body = validatedData;
			next();
		} catch (error) {
			console.error("[Validate] Error:", error);
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
