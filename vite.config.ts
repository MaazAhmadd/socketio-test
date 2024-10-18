import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { ngrok } from "vite-plugin-ngrok";

export default defineConfig({
	plugins: [
		react(),
		// ngrok({
		// 	authtoken: "2nW2i37tlj16FZZoswlYujrxbcR_FLEekfXL77fjc9MZvwR7",
		// 	domain: "real-firm-unicorn.ngrok-free.app",
		// 	port: 5173,
		// }),
	],
	// plugins: [react(), mkcert()],
	// plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
