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

import { calculate_gpa, gradeToGPA } from './helpers';

// Vue Components
import Vue from 'vue';
import ExtensionInfo from './components/ExtensionInfo.vue';
import HypoAssignment from './components/HypoAssignment.vue';
import HypoGrades from './components/HypoGrades';

let percent_main_page = true;
browser.storage.local.get({ percent_main_page: true }).then(
    function (returned) {
        percent_main_page = returned.percent_main_page;
    }, function () {},
);
main();
function main () {
    // Button on options page
    const $topright = $('ul#tools');
    if ($topright.length === 0) {
        $('body').append(`<div style="position: absolute; top: 0px; right: 0px; margin-right: 8px;"><a id="extension-open">Extension Options </a> </div>`);
    } else {
        $topright.append(`<li><a id="extension-open">Extension Options</a> </li><span></span>`);
    }
    $('#extension-open').on('click', function () {
        browser.runtime.sendMessage({ action: "open_settings" });
    });

    const page_url = window.location.href.split('#')[0];
    if (page_url === "https://powerschool.sas.edu.sg/guardian/homeHS.html") {
        main_page();
        analytics_message("Main Page");
    } else if (page_url.match("https://powerschool.sas.edu.sg/guardian/scores") != null) {
        class_page();
        analytics_message("Course Page");
    } else if (page_url === "https://powerschool.sas.edu.sg/guardian/home.html" || page_url === "https://powerschool.sas.edu.sg/public/" || page_url === "https://powerschool.sas.edu.sg/public/home.html") {
        login_page();
        analytics_message("Login Page");
    } else {
        analytics_message("default");
    }
}
function analytics_message (action_input) {
    const href = window.location.href.split("?")[0];
    browser.runtime.sendMessage({ action: "analytics_send", args: { url: href, action: action_input } });
}
function main_page () {
    const student_name = document.querySelector('#userName').querySelector('span').innerText;
    let second_semester = false;
    const courses = [];
    const $grade_rows = $('#quickLookup table.grid').find('tr');
    let s1col = 0;
    let s2col = 0;

    if ($grade_rows.eq(1).html().match("S2") != null) {
        second_semester = true;
        let curr = 0;
        $grade_rows.eq(1).find('th').get().forEach(e => {
            switch (e.innerText) {
                case "S1":
                    s1col = curr;
                    break;
                case "S2":
                    s2col = curr;
                    break;
                default:
                    break;
            }
            curr += parseInt(e.getAttribute('colspan')) || 1;
        });
    }
    for (let i = 0; i < $grade_rows.length; i++) {
        let $course;
        if (second_semester) {
            const $cells = $grade_rows.eq(i).find('td');
            $course = $cells.eq(s2col).find('a[href^="scores.html"]');
            const $first_grade = $cells.eq(s1col).find('a[href^="scores.html"]');
            if ($first_grade.length === 1) {
                if (gradeToGPA($first_grade.text()) !== -1) {
                    fill_percent($first_grade, `https://powerschool.sas.edu.sg/guardian/${$first_grade.attr('href')}`, [0], 0);
                }
            }
        } else {
            $course = $grade_rows.eq(i).find('td a[href^="scores.html"]').eq(0);
        }
        if ($course.length === 1) {
            const temp = $course.parents().eq(1).children("td[align=left]").text().match(".*(?=Details)")[0];
            courses.push({
                name: temp.trim(),
                grade: $course.text(),
                link: $course.attr('href'),
                fp: -1,
            });
            if (gradeToGPA($course.text()) !== -1) {
                fill_percent($course, "https://powerschool.sas.edu.sg/guardian/" + $course.attr('href'), courses[courses.length - 1], "fp");
            }
        }
    }
    $("table[border='0'][cellpadding='3'][cellspacing='1'][width='100%']").prepend(`<tr><td align="center">Current Semester GPA (${second_semester ? 'S2' : 'S1'}): ${calculate_gpa(courses)}</td></tr>`);

    // Hypo Grade Calculator
    const HypoGradesDiv = document.createElement('div');
    HypoGradesDiv.classList.add("hypo-grade-div-fixed");
    HypoGradesDiv.id = "saspes-hypo-grades";
    document.body.appendChild(HypoGradesDiv);
    new (Vue.extend(HypoGrades))({
        propsData: {
            initialCourses: courses,
        },
    }).$mount(".hypo-grade-div-fixed");
}
function class_page () {
    // Show final percent
    let current_string = $("table.linkDescList").html();
    current_string = current_string.match(/(?=document\.write).*/g)[1];
    current_string = /\[.*\]/g.exec(current_string)[0].slice(1, -1);
    const temp = current_string.split(";");
    const number = Math.max(isNaN(temp[temp.length - 2]) ? -Infinity : parseFloat(temp[temp.length - 2]), isNaN(temp[temp.length - 1]) ? -Infinity : parseFloat(temp[temp.length - 1]));
    if (number === -Infinity) {
        return;
    }
    document.querySelector("table.linkDescList").append(html2node(`<tr><td><strong>Final Percent: </strong></td><td>` + parseFloat(number).toFixed(2) + ` <div class="tooltip saspe">&#9432;<span class="tooltiptext saspe">85: A+ | 75: A <br />65: B+ | 55: B <br />45: C+ | 35: C <br/>25: D+ | 15: D</span></div></td></tr>`));

    document.querySelector('div.box-round').insertAdjacentHTML('afterend', `<div id="saspes-hypo-assignment"></div>`);
    new (Vue.extend(HypoAssignment))({
        propsData: {
            currentFP: number,
        },
    }).$mount('#saspes-hypo-assignment');
}
function login_page () {
    $('<div id="saspes-info"></div>').insertAfter('div#content');
    browser.storage.local.get({ showExtensionInfo: true }).then(result => {
        new (Vue.extend(ExtensionInfo))({
            data: {
                showInfo: result.showExtensionInfo,
            },
        }).$mount('#saspes-info');
    });
}
function fill_percent ($fill_location, url_link, percents, pos_in_arr) {
    if (!percent_main_page) {
        return;
    }
    $.ajax({
        url: url_link,
    }).done(function (data) {
        let current_string = data;
        current_string = current_string.match(/(?=document\.write).*/g)[1];
        current_string = /\[.*\]/g.exec(current_string)[0].slice(1, -1);
        const temp = current_string.split(";");
        const final_percent = Math.max(isNaN(temp[temp.length - 2]) ? -Infinity : parseFloat(temp[temp.length - 2]), isNaN(temp[temp.length - 1]) ? -Infinity : parseFloat(temp[temp.length - 1]));
        if (final_percent === -Infinity) {
            percents[pos_in_arr] = -1;
            return;
        }
        $fill_location.append(` (${final_percent.toFixed(2)})`);
        percents[pos_in_arr] = final_percent.toFixed(2);
    }).fail(function () {
        percents[pos_in_arr] = -1;
    });
}

function html2node (html_string) {
    return html2nodelist(html_string)[0];
}
function html2nodelist (html_string) {
    const temp = document.createElement('template');
    temp.innerHTML = html_string;
    return temp.content.childNodes;
}
