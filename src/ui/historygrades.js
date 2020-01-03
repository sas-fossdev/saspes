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

const browser = require('webextension-polyfill');

window.addEventListener("load", main, false);
function main () {
    browser.runtime.sendMessage({ action: "analytics_send", args: { url: "saspes://temp.lastseengrades", action: "Temp Last Seen Grades Page" } });

    browser.storage.local.get({ previous_grades_temp: [], previous_person: "" }).then((returned) => {
        if (returned.previous_grades_temp.length === 0) {
            const temp = document.createElement("body");
            const temp1 = document.createElement("h3");
            temp1.appendChild(document.createTextNode("Information not yet avaliable"));
            temp.appendChild(temp1);
            document.querySelector('html').replaceChild(temp, document.querySelector('body'));
            document.title = `SAS PES - Last Seen Grades (No Info)`;
            return;
        }

        const student_name = document.createTextNode(returned.previous_person);
        document.getElementById("studentname").appendChild(student_name);
        document.title = `SAS PES - ${returned.previous_person}`;
        const info = returned.previous_grades_temp;
        const table = document.querySelector("table#historygradetable");
        for (let i = 0; i < info.length; i++) {
            const current_row = document.createElement("tr");
            const col1 = document.createElement("td");
            const col2 = document.createElement("td");
            const col3 = document.createElement("td");
            col1.appendChild(document.createTextNode(info[i].name));
            col2.appendChild(document.createTextNode(info[i].grade));
            col3.appendChild(document.createTextNode(info[i].fp));
            current_row.appendChild(col1);
            current_row.appendChild(col2);
            current_row.appendChild(col3);
            table.appendChild(current_row);
        }
    });
}
