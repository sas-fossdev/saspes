/**
 *
 * @copyright Copyright (c) 2019 Gary Kim <gary@garykim.dev>
 *
 * @author Gary Kim <gary@garykim.dev>
 *
 * @license GNU AGPL version 3 only
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

const fs = require('fs');
const JSZip = require('jszip');
const manifest = require('./dist/manifest.json');

module.exports = {
    src_folders: ['tests'],
	detailed_output: true,
	live_output: true,
	test_settings: {
		chromium: {
			desiredCapabilities: {
				browserName: 'chrome',
				chromeOptions: {
					args: ['--no-sandbox'],
					extensions: [fs.readFileSync(`artifacts/sas_powerschool_enhancement_suite-${manifest.version}.zip`).toString('base64')],
				},
            },
            "webdriver": {
                "start_process": true,
                "server_path": "node_modules/.bin/chromedriver",
                "port": 9515,
            },
		},
		firefox: {
			desiredCapabilities: {
				browserName: 'firefox',
				version: 'dev',
                alwaysMatch: {
                    "moz:firefoxOptions": {
                        profile: generateFirefoxProfile(),
                    },
                },
            },
            "webdriver": {
                "start_process": true,
                "server_path": "node_modules/.bin/geckodriver",
            },
		},
	},
};

function generateFirefoxProfile() {
	if (!manifest.applications){
		return;
	}
	const zip = new JSZip();
	zip.file(`extensions/${manifest.applications.gecko.id}.xpi`, fs.readFileSync(`artifacts/sas_powerschool_enhancement_suite-${manifest.version}.zip`));
	zip.file('prefs.js', 'user_pref("xpinstall.signatures.required", false);');
	return zip.generate({ type: 'base64' });
}
