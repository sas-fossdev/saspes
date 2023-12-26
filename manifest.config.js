import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
const { version } = packageJson



export default defineManifest(async (env) => ({
  manifest_version: 3,
  // In UTC time: YYYY.MMDD.HHMM.SSmmm
  version: `${new Date().getUTCFullYear()}.${new Date().getUTCMonth() + 1}${String(new Date().getUTCDate()).padStart(2, "0")}.${new Date().getUTCMinutes()}${String(new Date().getUTCHours()).padStart(2, "0")}.${new Date().getUTCSeconds()}${String(new Date().getUTCMilliseconds()).padStart(3, "0")}`,
  // semver is OK in "version_name"
  version_name: version,
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
      "matches": ["https://powerschool.sas.edu.sg/public/home.html"],
      "js": ["src/content_script/home/index.ts"]
    }
  ],
  "permissions": ["storage"],
  "web_accessible_resources": [
    {
      "matches": ["https://powerschool.sas.edu.sg/*"],
      "resources": ["public/icon.png"]
    }
  ]
}))