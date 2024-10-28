import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const manifest = require("../dist/manifest.json");
console.log(manifest.web_accessible_resources);

manifest.web_accessible_resources.forEach((resource, i) => {
  manifest.web_accessible_resources[i].use_dynamic_url = false;
  console.log(resource.matches[0])
  if (resource.matches[0] == "<all_urls>") {
    manifest.web_accessible_resources[i].matches[0] = "https://powerschool.sas.edu.sg/*";
  }
});

console.log(manifest.web_accessible_resources);



if (fs.existsSync("./dist/manifest.json")) {
  fs.writeFileSync("./dist/manifest.json", JSON.stringify(manifest, null, 2));
} else {
  throw new Error("Manifest file not found");
}
