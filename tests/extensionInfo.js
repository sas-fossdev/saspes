/**
 *
 * @copyright Copyright (c) 2019-2020 Gary Kim <gary@garykim.dev>
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

const version_name = require('../webpack-helpers').versionName();

module.exports = {
    "Show Extension Info": browser => {
        browser
            .url("https://powerschool.sas.edu.sg")
            .waitForElementVisible("#saspes-info")
    },
    "Extension Version Correct": browser => {
        browser
            .assert.containsText('#saspes-info', 'SAS Powerschool Enhancement Suite')
            .assert.containsText("#saspes-info", `Version: ${version_name}`)
    },
    "Extension Info Remember Open State": browser => {
        browser
            .assert.elementPresent('#saspes-info .saspes-content')
            .click('#saspes-info .arrow')
            .assert.elementNotPresent('#saspes-info .saspes-content')
            .click('#saspes-info .arrow')
            .assert.elementPresent('#saspes-info .saspes-content')
            .click('#saspes-info .arrow')
            .refresh()
            .assert.elementNotPresent('#saspes-info .saspes-content')
            .click('#saspes-info .arrow')
            .assert.elementPresent('#saspes-info .saspes-content')
            .end()
    }
}
