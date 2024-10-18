import winston from "winston";
import chalk from "chalk";
import { format } from "date-fns";

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
	// silent: process.env.NODE_ENV === "production",
	transports: [
		new winston.transports.Console(),
		// Uncomment these if you want to log to files
		// new winston.transports.File({ filename: 'error.log', level: 'error' }),
		// new winston.transports.File({ filename: 'combined.log' }),
	],
});
