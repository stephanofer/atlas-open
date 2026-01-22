import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
	plugins: [react(), tailwindcss(), cloudflare()],
	resolve: {
		alias: {
			"@/ui": path.resolve(__dirname, "./ui"),
			"@/api": path.resolve(__dirname, "./api"),
		},
	},
});
