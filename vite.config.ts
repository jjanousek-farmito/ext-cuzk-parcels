import { resolve } from "node:path";
import { crx } from "@crxjs/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite";
import manifest from "./src/manifest.config";
import packageJson from "./package.json";

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = packageJson.version
    // can only contain digits, dots, or dash
    .replace(/[^\d.-]+/g, "")
    // split into version parts
    .split(/[.-]/);

const buildConfig = (mode: string) => (mode === "development" ? {
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
} : {
    outDir: `v${major}.${minor}.${patch}`,
    emptyOutDir: true,
    sourcemap: false,
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [svelte({ emitCss: false }), tailwindcss(), crx({ manifest })],
    resolve: {
        alias: [{ find: "@", replacement: resolve(__dirname, "./src/") }]
    },

    // HACK: https://github.com/crxjs/chrome-extension-tools/issues/696
    // https://github.com/crxjs/chrome-extension-tools/issues/746
    server: {
        port: 5173,
        strictPort: true,
        hmr: {
            clientPort: 5173,
        },
    },
    build: buildConfig(mode),

}));
