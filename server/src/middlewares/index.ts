import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import chalk from "chalk";
import { logger } from "../logger";

// middleware to check if x-auth-token token attached and valid
export const authUser = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers["x-auth-token"];
	if (!token)
		return res.status(401).send({ error: "Access denied. No token provided." });
	try {
		const decoded = jwt.verify(
			token as string,
			process.env.JWT_PRIVATE_KEY || "",
		);

		req.user = decoded as { _id: string };
		next();
	} catch (ex) {
		logger.info(`[authUser-middleware] error in express middleware: ${ex}`);
		res.status(400).send({ error: "Invalid token." });
		next(ex);
	}
};

interface CustomError extends Error {
	status?: number;
}

export const errorHandler = (
	err: CustomError,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	logger.error(`
	Error message: ${err.message}
    Request: ${req.method} ${req.url}
    Status code: ${err.status || 500}
	Stack trace: ${err.stack}
	`);

	const statusCode = err.status || 500;
	const errorMessage = err.message || "Internal Server Error";

	res.status(statusCode).send({ error: errorMessage });
};

export const allRequestLoggerMiddlerware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const originalSend = res.send.bind(res);
	res.send = function (body: any) {
		if (typeof body === "string") {
			const doubleQuoteCount = (body.match(/"/g) || []).length;
			if (doubleQuoteCount > 9) {
				return originalSend(body);
			}
		}
		const logMessage = `${chalk.green(req.method)} ${chalk.yellow(req.url)} ${chalk.red(String(res.statusCode))} ${chalk.cyan(body)}`;
		logger.info(logMessage);
		return originalSend(body);
	};
	next();
};
