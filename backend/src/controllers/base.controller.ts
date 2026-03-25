import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";

export abstract class BaseController {
	/**
	 * Helper to send successful responses
	 */
	protected sendResponse<T>(
		res: Response,
		data: T,
		message = "Success",
		statusCode = 200,
	) {
		return res.status(statusCode).json({
			success: true,
			message,
			data,
		});
	}

	/**
	 * Helper to validate request using express-validator
	 */
	protected validate(req: Request) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throw new BadRequestError("Validation failed", errors.array());
		}
	}
}

/**
 * Utility to wrap async express handlers to catch errors and pass to global error handler
 */
export const catchAsync = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
