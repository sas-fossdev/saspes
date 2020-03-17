/**
 *
 * @copyright Copyright (c) 2018-2020 Gary Kim <gary@garykim.dev>
 *
 * @copyright Copyright (c) 2020 Suhas Hariharan <mail@suhas.net>
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

import { calculate_gpa, extractFinalPercent, gradeToGPA } from './helpers';

// Vue Components
import Vue from 'vue';
import ClassGrade from './components/ClassGrade';
import ExtensionInfo from './components/ExtensionInfo.vue';
import HypoAssignment from './components/HypoAssignment.vue';
import HypoGrades from './components/HypoGrades';

// Used models
import Course from './models/Course';

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
    const courses_first_semester = [];
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
                    new (Vue.extend(ClassGrade))({
                        propsData: {
                            course: new Course("", `https://powerschool.sas.edu.sg/guardian/${$first_grade.attr('href')}`, $first_grade.text()),
                            showMissing: false,
                        },
                    }).$mount($first_grade.get(0));
                }
            }
        } else {
            $course = $grade_rows.eq(i).find('td a[href^="scores.html"]').eq(0);
        }
        if ($course.length === 1) {
            const temp = $course.parents().eq(1).children("td[align=left]").text().match(".*(?=Details)")[0];
            courses.push(new Course(temp.trim(), `https://powerschool.sas.edu.sg/guardian/${$course.attr('href')}`, $course.text()));
            if (gradeToGPA($course.text()) !== -1) {
                new (Vue.extend(ClassGrade))({
                    propsData: {
                        course: courses[courses.length - 1],
                    },
                }).$mount($course.get(0));
            }
        }
    }
    $("table[border='0'][cellpadding='3'][cellspacing='1'][width='100%']").prepend(`<tr><td align="center">Current Semester GPA (${second_semester ? 'S2' : 'S1'}): ${calculate_gpa(courses)}</td></tr>`);

    if (second_semester) {
        fetch("https://powerschool.sas.edu.sg/guardian/termgrades.html")
            .then((response) => {
                return response.text();
            })
            .then((data) => {
                const el = document.createElement("html");
                let element_list = [];
                el.innerHTML = data;
                element_list = el.getElementsByClassName("box-round")[0].getElementsByTagName("table")[0];
                element_list = element_list.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
                if (element_list.length > 2) {
                    for (let i = 2; i < element_list.length; i++) {
                        const $prev_course = element_list[i];
                        courses_first_semester.push(new Course($prev_course.getElementsByTagName("td")[0].textContent.trim(),
                            $prev_course.getElementsByTagName("td")[2].getElementsByTagName("a")[0].href,
                            $prev_course.getElementsByTagName("td")[1].textContent.trim(),
                        ));
                    }
                    $("table[border='0'][cellpadding='3'][cellspacing='1'][width='100%']").prepend(`<tr><td align="center">Last Semester GPA (S1): ${calculate_gpa(courses_first_semester)}</td></tr>`);
                }
            });
        $("table[border='0'][cellpadding='3'][cellspacing='1'][width='100%']").prepend(`<td style="background-color: white;" align="center"><button id="calculateCumulative">Calculate Cumulative GPA</button></td>`);
        $("#calculateCumulative").click(show_cumulative_gpa);
    }
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
function show_cumulative_gpa () {
    $("#calculateCumulative").hide();
    calculate_cumulative_gpa().then(cumulative_gpa => {
        $("table[border='0'][cellpadding='3'][cellspacing='1'][width='100%']").prepend(`<tr><td align="center">Cumulative GPA(Completed Semesters): ${cumulative_gpa.toFixed(2)}</td></tr>`);
    });
}
function class_page () {
    // Show final percent
    const number = extractFinalPercent($("table.linkDescList").html());
    if (!number) {
        return;
    }
    document.querySelector("table.linkDescList").append(html2node(`<tr><td><strong>Final Percent: </strong></td><td>` + number.toFixed(2) + ` <div class="tooltip saspes">&#9432;<span class="tooltiptext saspes">85: A+ | 75: A <br />65: B+ | 55: B <br />45: C+ | 35: C <br/>25: D+ | 15: D</span></div></td></tr>`));

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

function calculate_cumulative_gpa () {
    const list_of_gpas = [];
    const all_courses = [];
    const credit_hour_list = [];
    let element_list = [];
    const fetches = [];
    // Fetches grade history page
    const gpas = fetch("https://powerschool.sas.edu.sg/guardian/termgrades.html")
        .then(response => response.text())
        .then(data => {
            const el = document.createElement("html");
            el.innerHTML = data;
            const tabs = el.getElementsByClassName("tabs")[0].getElementsByTagName("li");
            for (let i = 0; i < tabs.length; i++) {
                // Iterates through semesters and adds each list of courses to all_courses list
                fetches.push(
                    fetch(tabs[i].getElementsByTagName("a")[0].href)
                        .then(res => res.text())
                        .then(function (data2) {
                            let courses = [];
                            const semester = document.createElement("html");
                            semester.innerHTML = data2;
                            element_list = semester.getElementsByClassName("box-round")[0].getElementsByTagName("table")[0];
                            element_list = element_list.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
                            for (let t = 2; t < element_list.length; t++) {
                                if (element_list[t].innerText.trim() === ("S2")) {
                                    all_courses.push(courses);
                                    courses = [];
                                }
                                if (element_list[t].getElementsByTagName("th").length > 0) {
                                    continue;
                                } else {
                                    const $prev_course = element_list[t];
                                    // Creates course object with each course from grade history page
                                    const course = new Course($prev_course.getElementsByTagName("td")[0].textContent.trim(), "",
                                        $prev_course.getElementsByTagName("td")[1].textContent.trim(), 0, "", parseFloat($prev_course.getElementsByTagName("td")[4].innerText));

                                    courses.push(course);
                                }
                            }
                            all_courses.push(courses);
                        }));
            }
            // Calculates cumulative GPA based on credit hours per semester and gpa for each semester.
            const cumulative_gpa = Promise.all(fetches).then(function () {
                let total_count = 0;
                let total_gpa = 0;
                for (let i = 0; i < all_courses.length; i++) {
                    let count = 0;
                    list_of_gpas.push(calculate_gpa(all_courses[i]));
                    for (let t = 0; t < all_courses[i].length; t++) {
                        count += all_courses[i][t].creditHour;
                    }
                    // Adds all credit hours to overall credit hour count
                    total_count += count;
                    // Adds each amount of credit hours per semester to list
                    credit_hour_list.push(count);
                }
                for (let i = 0; i < all_courses.length; i++) {
                    total_gpa += ((credit_hour_list[i] / total_count) * list_of_gpas[i]);
                }
                return (total_gpa);
            });
            return cumulative_gpa;
        });
    return gpas;
}

function html2node (html_string) {
    return html2nodelist(html_string)[0];
}
function html2nodelist (html_string) {
    const temp = document.createElement('template');
    temp.innerHTML = html_string;
    return temp.content.childNodes;
}