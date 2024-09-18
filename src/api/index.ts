import { API_URL } from "@/lib/config";
import axios from "axios";

const instance = axios.create({ baseURL: API_URL });

instance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("auth_token");
		if (token) {
			config.headers["x-auth-token"] = token;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export default instance;
