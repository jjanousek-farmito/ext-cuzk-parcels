import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
    // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
    // for more information about preprocessors
    preprocess: vitePreprocess(),
    alias: {
        $components: "src/components",
        $stores: "src/stores",
        $utils: "src/utils",
        $assets: "src/assets",
        "@/*": "src/lib/*",
    },
    external: [
        "src/lib/components/ui/*"
    ],

};
