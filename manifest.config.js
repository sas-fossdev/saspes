import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
import 'dotenv/config'
const { version } = packageJson



export const realVersion = `${new Date().getUTCFullYear()}.${new Date().getUTCMonth() + 1}${String(new Date().getUTCDate()).padStart(2, "0")}.${new Date().getUTCMinutes()}${String(new Date().getUTCHours()).padStart(2, "0")}.${new Date().getUTCSeconds()}${String(new Date().getUTCMilliseconds()).padStart(3, "0")}`;
export default defineManifest(async (env) => ({
  manifest_version: 3,
  // In UTC time: YYYY.MMDD.HHMM.SSmmm
  version: realVersion,
  // semver is OK in "version_name"
  version_name: version + (process.argv[4] === "production" ? "" : ` Dev Build ${realVersion}`),
  "name": "SAS Powerschool Enhancement Suite",
  "description": "Provides various enhancements for SAS Powerschool",
  "action": {
    "default_popup": "src/popup/index.html"
  },
  "content_scripts": [
    {
      "matches": ["https://powerschool.sas.edu.sg/guardian/scores.html*"],
      "js": ["src/content_script/scores/index.ts"]
    },
    {
      "matches": ["https://powerschool.sas.edu.sg/*"],
      "js": ["src/content_script/def/index.ts"]
    },
    {
      "matches": ["https://powerschool.sas.edu.sg/public/*"],
      "js": ["src/content_script/home/index.ts"]
    },
    {
      "matches": [
        "https://powerschool.sas.edu.sg/guardian/home.html*"
      ],
      "js": ["src/content_script/guardianHome/index.ts"]
    }
  ],
  "options_ui": {
    "page": "src/options/index.html",
    "open_in_tab": false
  },
  "icons": {
    "128": "public/icon.png" 
  },
  "permissions": ["storage"],
  "web_accessible_resources": [
    {
      "matches": ["https://powerschool.sas.edu.sg/*"],
      "resources": ["public/icon.png"]
    }
  ],
  "background": process.env.npm_config_firefox
    ? { "scripts": ["src/background.ts"] }
    : { "service_worker": "src/background.ts" },
}))