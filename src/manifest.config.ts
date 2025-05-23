import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

const { version, name, description } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
    // can only contain digits, dots, or dash
    .replace(/[^\d.-]+/g, "")
    // split into version parts
    .split(/[.-]/);


export default defineManifest(async (env) => ({
    manifest_version: 3,
    name: name,
    description: description,
    version: `${major}.${minor}.${patch}.${label}`,
    version_name: version,
    icons: {
        "16": "src/assets/icons/icon-16.png",
        "32": "src/assets/icons/icon-32.png",
        "48": "src/assets/icons/icon-48.png",
        "128": "src/assets/icons/icon-128.png",
    },
    host_permissions: ["<all_urls>"],
    content_scripts: [
        {
            matches: [
                "https://crm.cmzf.cz/purchase/opportunity/*",
                "https://test.crm.cmzf.cz/purchase/opportunity/*"
            ],
            js: [
                "src/content/crm/index.ts"
            ],
        },
        {
            matches: [
                "https://nahlizenidokn.cuzk.gov.cz/*"
            ],
            js: [
                "src/content/cuzk/auth.ts"
            ],
        },
        {
            matches: [
                "https://nahlizenidokn.cuzk.gov.cz/ZobrazObjekt.aspx?*"
            ],
            js: [
                "src/content/cuzk/index.ts"
            ],
        }
    ],
    background: {
        service_worker: "src/background/index.ts",
    },
    options_ui: {
        page: "src/options/options.html",
        open_in_tab: true,
    },
    action: {
        default_icon: {
            "16": "src/assets/icons/icon-16.png",
            "32": "src/assets/icons/icon-32.png",
            "48": "src/assets/icons/icon-48.png",
            "128": "src/assets/icons/icon-128.png",
        },
    },
    permissions: [
        "storage",
        "activeTab",
        "scripting",
        "webNavigation",
        "webRequest",
        "alarms",
        "tabs"
    ] as chrome.runtime.ManifestPermissions[],
}));
