/**
 *
 * @copyright Copyright (c) 2023-2024 Anvay Mathur <contact@anvaymathur.com>
 *
 * @author Anvay Mathur <contact@anvaymathur.com>
 *
 * @license AGPL-3.0-only
 *
 * SAS Powerschool Enhancement Suite - A browser extension to improve the experience of SAS Powerschool.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
import { crx } from "@crxjs/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import 'dotenv/config';
import { defineConfig } from "vite";
import manifest, { realVersion } from "./manifest.config.js";
import pkg from "./package.json";

// import vitePluginRunCommandOnDemand from "./helpers/viterunplugin.js";


export default defineConfig({
  plugins: [
    svelte(),
    crx({
      manifest: manifest()
    }),

  ],
  define: {
    SAS_PES_VERSION: `"${process.argv[4] === "production" ? pkg.version : `${pkg.version} Development Build ${realVersion}`}"`,
  },
});
