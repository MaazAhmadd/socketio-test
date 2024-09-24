import maxmind, { CountryResponse } from "maxmind";
import { logger } from "../logger";

// Function to get country from IP address
export const getCountryFromIP = async (ip: string): Promise<string> => {
	logger.info(`getCountryFromIP, ip: ${ip}`);
	if (ip == "::1" || ip.includes("127.0.0.1") || ip.includes("192.168")) {
		logger.info("getCountryFromIP, country: PK");
		return "PK";
	}
	const lookup = await maxmind.open<CountryResponse>(
		"geo-database/GeoLite2-Country.mmdb",
	);

	const result = lookup.get(ip);

	if (result?.country) {
		logger.info(`getCountryFromIP, country: ${result.country.iso_code}`);
		return result.country.iso_code;
	}
	logger.info("getCountryFromIP, country: 0");
	return "0";
};
