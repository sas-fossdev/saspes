/**
 *
 * @copyright Copyright (c) 2018-2020 Gary Kim <gary@garykim.dev>
 *
 * @copyright Copyright (c) 2020 Suhas Hariharan <contact@suhas.net>
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

import {
    assignments,
    calculate_gpa,
    extractFinalPercent,
    extractGradeCategories,
    gradeToGPA,
    saveGradesLocally,
    getSavedGrades,
    extractAssignmentList,
} from './helpers';

// Vue Components
import Vue from 'vue';
import ClassGrade from './components/ClassGrade';
import ExtensionInfo from './components/ExtensionInfo.vue';
import GradeTable from './components/GradeTable.vue';
import CategoryWeighting from './components/CategoryWeighting.vue';
import HypoGrades from './components/HypoGrades';
import LastSeenGrades from './components/LastGrades.vue';

// Used models
import Course from './models/Course';
import CumulativeGPA from "./components/CumulativeGPA";
import Assignment from './models/Assignment';

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
    } else if (page_url.match("https://powerschool.sas.edu.sg/guardian/scores") != null) {
        class_page();
    } else if (page_url === "https://powerschool.sas.edu.sg/guardian/home.html" || page_url === "https://powerschool.sas.edu.sg/public/" || page_url === "https://powerschool.sas.edu.sg/public/home.html") {
        login_page();
    }
}

function main_page () {
    const student_name = getStudentName();
    const { sem1_col, sem2_col } = getSemesterCols();
    const second_semester = isSecondSemester();
    const current_term = getCurrentTerm();
    const { courses, promises_grade_calc_list } = getCourses(second_semester, sem1_col, sem2_col);

    showCurrentGPA(second_semester, courses, promises_grade_calc_list);

    if (second_semester) {
        showFirstSemGPA();
    }

    $("table[border='0'][cellpadding='3'][cellspacing='1'][width='100%']").prepend(`<td id="cumulative-gpa"></td>`);
    // passing courses in to possibly include current semester GPA if term has not finished yet.
    new (Vue.extend(CumulativeGPA))({
        propsData: {
            courses: courses,
            currentTerm: current_term,
            secondSemester: second_semester,
        },
    }).$mount("#cumulative-gpa");
    Promise.all(promises_grade_calc_list).then(_ => {
        addHypoGradeCalc(courses);
    });
}

function class_page () {
    // Show final percent
    const number = extractFinalPercent($("table.linkDescList").html());
    if (!number) {
        return;
    }
    document.querySelector("table.linkDescList").append(html2node(`<tr><td><strong>Final Percent: </strong></td><td>` + number.toFixed(2) + ` <div class="tooltip saspes">&#9432;<span class="tooltiptext saspes">85: A+ | 75: A <br />65: B+ | 55: B <br />45: C+ | 35: C <br/>25: D+ | 15: D</span></div></td></tr>`));

    addVueGrades();
}

async function login_page () {
    $('<div id="saspes-info"></div>').insertAfter('div#content');
    browser.storage.local.get({ showExtensionInfo: true }).then(result => {
        new (Vue.extend(ExtensionInfo))({
            data: {
                showInfo: result.showExtensionInfo,
            },
        }).$mount('#saspes-info');
    });
    const LastGradesDiv = document.createElement('div');
    LastGradesDiv.classList.add("last-grade-div-fixed");
    LastGradesDiv.id = "saspes-last-grades";
    document.body.appendChild(LastGradesDiv);
    if ((await browser.storage.local.get({ save_last_grades: true })).save_last_grades) {
        (browser.storage.local.get("most_recent_user")).then(output => {
            if (output.most_recent_user !== undefined) {
                (async () => {
                    const courses = await getSavedGrades(output.most_recent_user);
                    new (Vue.extend(LastSeenGrades))({
                        propsData: {
                            username: output.most_recent_user,
                            initialCourses: courses,
                        },
                    }).$mount(".last-grade-div-fixed");
                })();
            }
        });
    }
}

function html2node (html_string) {
    return html2nodelist(html_string)[0];
}
function html2nodelist (html_string) {
    const temp = document.createElement('template');
    temp.innerHTML = html_string;
    return temp.content.childNodes;
}

/**
 * Returns the student name found in the main page's html
 * @returns {string} The student's name
 */
function getStudentName () {
    const student_name = document.querySelector('#userName').querySelector('span').innerText;

    return student_name;
}

/**
 * Return the semester 1 and semester 2 column indexes from the main page HTML.
 * @returns { number, number } { sem1_col, sem2_col } The first and second semester column indexes.
 */
function getSemesterCols () {
    let sem1_col = 0;
    let sem2_col = 0;
    const $grade_rows = $('#quickLookup table.grid').find('tr');
    if ($grade_rows.eq(1).html().match("S2") != null) {
        let curr = 0;
        $grade_rows.eq(1).find('th').get().forEach(e => {
            switch (e.innerText) {
                case "S1":
                    sem1_col = curr;
                    break;
                case "S2":
                    sem2_col = curr;
                    break;
                default:
                    break;
            }
            curr += parseInt(e.getAttribute('colspan')) || 1;
        });
    }
    return { sem1_col, sem2_col };
}

/**
 * Check whether it is currently second semester or not.
 * @param {number} sem2_col The column index corresponding to the second semester
 * @returns {bool} Whether it is currently second semester
 */
function isSecondSemester (sem2_col) {
    const $grade_rows = $('#quickLookup table.grid').find('tr');
    if ($grade_rows.eq(1).html().match("S2") != null) {
        for (let t = 0; t < $grade_rows.length; t++) {
            if (gradeToGPA($grade_rows.eq(t).find('td').get(sem2_col)) !== -1) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Show the current semester's GPA.
 * @param second_semester If the current semester is the second semester
 * @param courses an array of Courses that the student is taking
 */
function showCurrentGPA (second_semester, courses, promises_grade_calc_list) {
    Promise.all(promises_grade_calc_list).then(_ => {
        $("table[border='0'][cellpadding='3'][cellspacing='1'][width='100%']").prepend(`<tr><td align="center">Current Semester GPA (${second_semester ? 'S2' : 'S1'}): ${calculate_gpa(courses)}</td></tr>`);
        saveGradesLocally(getStudentName(), courses);
    });
}

/**
 * Returns the current semester by parsing HTML.
 * @return {string} representing the current semester
 */
function getCurrentTerm () {
    const $grade_rows = $('#quickLookup table.grid').find('tr');
    let attendance_href = "";
    let current_term = "";
    if ((attendance_href = $grade_rows.eq($grade_rows.length - 1)?.find('a[href*="attendancedates"]')?.[0]?.href)) { // Check that attendance_href exists and if it does, run the next line.
        current_term = new URL(attendance_href).searchParams.get("term");
    }

    return current_term;
}

/**
 * Returns an array of the current courses of the user and creates Vue objects for the courses.
 * @param second_semester If the current semester is the second semester
 * @param sem1_col The column of the first semester
 * @param sem2_col The column of the second semester
 * @returns {Course[]} array of Course objects representing the Courses of the user
 */
function getCourses (second_semester, sem1_col, sem2_col) {
    const $grade_rows = $('#quickLookup table.grid').find('tr');
    const courses = [];
    const promises_grade_calc_list = [];

    for (let i = 0; i < $grade_rows.length; i++) {
        let $course;
        if (second_semester) {
            const $cells = $grade_rows.eq(i).find('td');
            $course = $cells.eq(sem2_col).find('a[href^="scores.html"]');
            const $first_grade = $cells.eq(sem1_col).find('a[href^="scores.html"]');
            if ($first_grade.length === 1) {
                if (gradeToGPA($first_grade.text()) !== -1) {
                    promises_grade_calc_list.push(new Promise((resolve, reject) => {
                        fetch(`https://powerschool.sas.edu.sg/guardian/${$first_grade.attr('href')}`, { credentials: "same-origin" }).then(response => response.text()).then(response => {
                            const page = document.implementation.createHTMLDocument();
                            page.documentElement.innerHTML = response;
                            const finalPercent = extractFinalPercent(page.querySelector('table.linkDescList').innerHTML) || "";
                            new (Vue.extend(ClassGrade))({
                                propsData: {
                                    course: new Course("", `https://powerschool.sas.edu.sg/guardian/${$first_grade.attr('href')}`, $first_grade.text(), finalPercent), showMissing: false,
                                },
                            }).$mount($first_grade.get(0));
                        });
                    }));
                }
            }
        } else {
            $course = $grade_rows.eq(i).find('td a[href^="scores.html"]').eq(0);
        }
        if ($course.length === 1) {
            const temp = $course.parents().eq(1).children("td[align=left]").text().match(".*(?=Details)")[0];
            promises_grade_calc_list.push(new Promise((resolve, reject) => {
                fetch(`https://powerschool.sas.edu.sg/guardian/${$course.attr('href')}`, { credentials: "same-origin" }).then(response => response.text()).then(response => {
                    const page = document.implementation.createHTMLDocument();
                    page.documentElement.innerHTML = response;
                    const finalPercent = extractFinalPercent(page.querySelector('table.linkDescList').innerHTML) || "";
                    const assignment_list = assignments(page.querySelector('body'));
                    courses.push(new Course(temp.trim(), `https://powerschool.sas.edu.sg/guardian/${$course.attr('href')}`, $course.text(), finalPercent, assignment_list));
                    if (gradeToGPA($course.text()) !== -1) {
                        new (Vue.extend(ClassGrade))({
                            propsData: {
                                course: courses[courses.length - 1],
                            },
                        }).$mount($course.get(0));
                    }
                    resolve("Success");
                });
            }));
        }
    }

    return { courses, promises_grade_calc_list };
}

/**
 * Show the first semester GPA.
 */
function showFirstSemGPA () {
    const courses_first_semester = [];
    getFirstSemCourses()
        .then((data) => {
            const el = document.createElement("html");
            let element_list = [];
            el.innerHTML = data;
            element_list = el.getElementsByClassName("box-round")[0].getElementsByTagName("table")[0];
            element_list = element_list.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
            if (element_list.length > 2) {
                for (let i = 2; i < element_list.length; i++) {
                    const $prev_course = element_list[i];
                    if ($prev_course?.innerText?.trim() === "S2") {
                        break;
                    }
                    if ($prev_course?.getElementsByTagName("td").length > 1) {
                        courses_first_semester.push(new Course($prev_course.getElementsByTagName("td")[0].textContent.trim(),
                            $prev_course.getElementsByTagName("td")[2].getElementsByTagName("a")[0].href,
                            $prev_course.getElementsByTagName("td")[1].textContent.trim(),
                        ));
                    }
                }
                $("table[border='0'][cellpadding='3'][cellspacing='1'][width='100%']").prepend(`<tr><td align="center">Last Semester GPA (S1): ${calculate_gpa(courses_first_semester)}</td></tr>`);
            }
        });
}

/**
 * Get the first semester courses and grades HTML.
 * @returns {Promise} the html from the first semester course and grades page
 */
async function getFirstSemCourses () {
    return await (await fetch("https://powerschool.sas.edu.sg/guardian/termgrades.html")).text();
}

/**
 * Adds the hypothetical grade calculator.
 * @param courses The courses of the student
 */
function addHypoGradeCalc (courses) {
    const HypoGradesDiv = document.createElement('div');
    HypoGradesDiv.classList.add("hypo-grade-div-fixed");
    HypoGradesDiv.id = "saspes-hypo-grades";
    document.body.appendChild(HypoGradesDiv);
    new (Vue.extend(HypoGrades))({
        propsData: {
            initialCourses: courses,
        },
    }).$mount(".hypo-grade-div-fixed");

    new (Vue.extend(HypoGrades))({
        propsData: {
            initialCourses: courses,
        },
    }).$mount(".hypo-grade-div-fixed");
}

/**
 * Add a hypothetical assignment calculator widget.
 * @param number The current final percent of the student.
 */
function addVueGrades () {
    let assignments = extractAssignmentList();
    let cat = extractGradeCategories(document.querySelector("#content-main > div.box-round > table:nth-child(4) > tbody").innerHTML);
    let gt = new (Vue.extend(GradeTable))({
        propsData: {
            categories: cat,
            assignments: assignments,
        },
    }).$mount('#content-main > div.box-round > table:nth-child(4)');
    document.querySelector('div.box-round').insertAdjacentHTML('afterend', `<div id="saspes-categories"></div>`);
    new (Vue.extend(CategoryWeighting))({
        propsData: {
            categories: cat,
            gradetable: gt,
        }
    }).$mount("#saspes-categories");
}

function extract(){
    let table = document.querySelector("#content-main > div.box-round > table:nth-child(4) > tbody");
    let newHeader = document.createElement("th");
    newHeader.innerHTML = "Exmp";
    table.querySelector("tr:nth-child(1)").appendChild(newHeader);
    let row = 2;
    let tr = table.querySelector("tr:nth-child("+row+")");
    while(!tr.innerHTML.includes("Score is exempt from final grade,")){
        if(tr.innerHTML.includes("images/icon_excluded.gif") || tr.innerHTML.includes("images/icon_exempt.gif")){
            tr.innerHTML += "<td align='center'><input type='checkbox' checked></td>";
        }else{
            tr.innerHTML += "<td align='center'><input type='checkbox'></td>";
        }
        row++;
        tr = table.querySelector("tr:nth-child("+row+")");
    }
}
