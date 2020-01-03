/**
 *
 * @copyright Copyright (c) 2018-2020 Gary Kim <gary@garykim.dev>
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

'use strict';

import $ from 'jquery';
const browser = require('webextension-polyfill');

// Installation Process
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install' && details.temporary === false) {
        browser.runtime.openOptionsPage();
    }
});

// Analytics
var analytics = {};
var version = browser.runtime.getManifest().version;
browser.storage.local.get({ analytics: true, id: "" }).then(function (returned) {
    analytics.enabled = returned.analytics;
    analytics.id = returned.id;
    if (analytics.id.length === 0) {
        reset_analytics();
    }
});

// Listen for requests from tabs
browser.runtime.onMessage.addListener(message_recieve);
function message_recieve (message) {
    switch (message.action) {
        case "analytics_send":
            analytics_send(message.args);
            // Requires an args attribute. Args should be an object that must have a 'url' attribute and can have a string called 'action' and a object called 'extra'. The arg object can also have a boolean named 'override'.
            break;
        case "open_settings":
            browser.runtime.openOptionsPage();
            break;
        case "reset_analytics":
            reset_analytics();
            break;
        default:
            break;
    }
}
function analytics_send (arg) {
    browser.storage.local.get({ analytics: true, percent_main_page: true, save_grades_temp: true }).then(function (returned) {
        analytics.enabled = returned.analytics;
        if (analytics.enabled) {
            const cvar_json = JSON.stringify({ "1": ["version", version], "2": ["FP", returned.percent_main_page.toString()], "3": ["Save Grades Temp", returned.save_grades_temp.toString()] });
            const send_info = {
                'idsite': '4',
                'rec': '1',
                'url': arg.url,
                '_id': analytics.id,
                'apiv': '1',
                'cid': analytics.id,
                '_cvar': cvar_json,
            };
            if (typeof arg.action !== 'undefined') {
                send_info.action_name = arg.action;
            }
            if (typeof arg.extra === 'object') {
                const extra_entries = Object.entries(arg.extra);
                for (let i = 0; i < extra_entries.length; i++) {
                    send_info[extra_entries[i][0]] = extra_entries[i][1];
                }
            }
            $.ajax({
                url: "https://analytics.ydgkim.com/piwik.php",
                type: "get",
                data: send_info,
            });
        }
    });
}
function reset_analytics () {
    analytics.id = random_str(16, '1234567890abcdef');
    browser.storage.local.set({ id: analytics.id });
}

function random_str (len, chars) {
    let tr = "";
    for (let i = 0; i < len; i++) {
        tr += chars[Math.floor(Math.random() * chars.length)];
    }
    return tr;
}
