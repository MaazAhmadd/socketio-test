import winston from "winston";
import chalk from "chalk";
import { format } from "date-fns";
import { NextFunction, Request, Response } from "express";

const customFormat = winston.format.printf(
	({ timestamp, level, message, meta = {} }) => {
		const { req = {}, res = {} } = meta;
		const formattedTimestamp = format(new Date(), "MMM dd h:mm:s a");
		const logMessage = `${chalk.blue(formattedTimestamp)} ${chalk.cyan(message)}`;
		return logMessage;
	},
);
export const logger = winston.createLogger({
	level: "info",
	format: customFormat,
	transports: [
		new winston.transports.Console(),
		// Uncomment these if you want to log to files
		// new winston.transports.File({ filename: 'error.log', level: 'error' }),
		// new winston.transports.File({ filename: 'combined.log' }),
	],
}); 