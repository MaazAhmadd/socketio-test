import maxmind, { CountryResponse } from "maxmind";

// Function to get country from IP address
export const getCountryFromIP = async (ip: string): Promise<string> => {
	if (ip == "::1" || ip.includes("127.0.0.1")) {
		return "PK";
	}
	const lookup = await maxmind.open<CountryResponse>(
		"./geo-database/GeoLite2-Country.mmdb",
		// "./src/services/geo-database/GeoLite2-Country.mmdb",
	);

	const result = lookup.get(ip);

	if (result?.country) {
		return result.country.iso_code;
	}
	return "0";
};
