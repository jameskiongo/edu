import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/errors";

export const errorHandler = (
	err: Error,
	_: Request,
	res: Response,
	__: NextFunction,
) => {
	let { statusCode, message } = err as any;

	if (!(err instanceof ApiError)) {
		statusCode = 500;
		message =
			process.env.NODE_ENV === "production"
				? "Internal Server Error"
				: err.message;
	}

	res.locals.errorMessage = err.message;

	const response = {
		success: false,
		message,
		...(err instanceof ApiError && err.errors && { errors: err.errors }),
	};

	if (process.env.NODE_ENV === "development") {
		console.error(err);
	}

	res.status(statusCode).send(response);
};
