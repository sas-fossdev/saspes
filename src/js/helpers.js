/**
 *
 * @copyright Copyright (c) 2018-2020 Gary Kim <gary@garykim.dev>
 * @copyright Copyright (c) 2020 Suhas Hariharan <contact@suhas.net>
 * @copyright Copyright (c) 2020 Advay Ratan <advayratan@gmail.com>
 * @author Gary Kim <gary@garykim.dev>
 * @author Advay Ratan <advayratan@gmail.com>
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

import Assignment from "./models/Assignment";
import ClassAssignment from "./models/ClassAssignment";
import Course from './models/Course';
import browser from 'webextension-polyfill';

const getKeyRange = require('get-key-range');

const grade_gpa = {
    'A+': 4.5,
    'A': 4.0,
    'B+': 3.5,
    'B': 3.0,
    'C+': 2.5,
    'C': 2.0,
    'D+': 1.5,
    'D': 1.0,
    'F': 0.0,
};

/**
 * Will convert a given grade into its corresponding SAS Grade Point Average.
 * @param {string} grade The grade to convert.
 * @returns {number} The corresponding grade point average.
 */
function gradeToGPA (grade) {
    if (grade in grade_gpa) {
        return grade_gpa[grade];
    }
    return -1;
}

const grade_fp = {
    'A+': 90,
    'A': 80,
    'B+': 70,
    'B': 60,
    'C+': 50,
    'C': 40,
    'D+': 30,
    'D': 20,
    'F': 10,
    'INC': 0,
};

/**
 * gradeToFP will convert a given grade to its corresponding final percent.
 * @param {string} grade The grade to convert.
 * @returns {number} The corresponding final percent.
 */
function gradeToFP (grade) {
    if (grade in grade_fp) {
        return grade_fp[grade];
    }
    return -1;
}

const avaliableGrades = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F", "INC"];

const fprange = {
    '85-90': 'A+',
    '75-85': 'A',
    '65-75': 'B+',
    '55-65': 'B',
    '45-55': 'C+',
    '35-45': 'C',
    '25-35': 'D+',
    '15-25': 'D',
    '0-15': 'F',
};

function fpToGrade (finalPercent) {
    return getKeyRange(fprange, parseFloat(parseFloat(finalPercent).toFixed(2)));
}

/**
 * Calculates the grade point average with the given courses.
 * @param {Course[]} courses The courses for which the overall grade point average should be calculated.
 * @returns {string} The grade point average to the hundredth place.
 */
function calculate_gpa (courses) {
    let courses_with_grades = 0;
    let sum = 0;
    for (var i = 0; i < courses.length; i++) {
        if (gradeToGPA(courses[i].grade) !== -1) {
            const multiplier = calculate_credit_hours(courses[i].name);
            courses_with_grades += multiplier;
            sum += multiplier * (gradeToGPA(courses[i].grade) + course_boost(courses[i].name, courses[i].grade));
        }
    }
    if (courses_with_grades === 0) {
        return '0.00';
    }
    return (sum / courses_with_grades).toFixed(2);

    function course_boost (course_name, grade) {
        if (gradeToGPA(grade) < 1.8) {
            return 0;
        }
        if (/^(AP |AT )/.test(course_name)) {
            return 0.5;
        }
        return 0;
    }
}

function calculate_credit_hours (course_name) {
    const double_effect_courses = [`English 10/American History`, `English 9/World History`];
    if (double_effect_courses.includes(course_name)) {
        return 2;
    }
    if (/^(I Service: |IS: )/.test(course_name)) {
        return 0.5;
    }
    return 1;
}

/**
 * Extract the final percent from the course page html.
 * @param {String} html course page html
 * @returns {Number|undefined} The final percent
 */
function extractFinalPercent (html) {
    let number;
    try {
        let current_string = html.match(/(?=document\.write).*/g)[1];
        current_string = /\[.*\]/g.exec(current_string)[0].slice(1, -1);
        const temp = current_string.split(";");
        number = Math.max(isNaN(temp[temp.length - 2]) ? -Infinity : parseFloat(temp[temp.length - 2]), isNaN(temp[temp.length - 1]) ? -Infinity : parseFloat(temp[temp.length - 1]));
    } catch (e) {
        return;
    }
    if (number === -Infinity) {
        return;
    }
    return number;
}

/**
 * Extract all grade categories from the course page html.
 * @param {String} html course page html
 * @returns {String[]} List of all categories
 */
function extractGradeCategories(html){
    let cat = [];
    let match;
    html = html.replace(/(\r\n|\n|\r)/gm, "");
    let reg = /(?:[0-9][0-9]\/[0-9][0-9]\/[0-9][0-9][0-9][0-9]<\/td> *<td>)([^<]*)/g;
    while(match = reg.exec(html)){
        if(!cat.includes(match[1])) cat.push(match[1]);
    }
    return cat;
}

/**
 * Given user weightings, calculate final percent from the course page html.
 * @param {String} html course page html
 * @param {Map<String, int>} catmap user weightings for each category
 * @returns {int} final percent
 */
function calcPercentFromWeighting(html, catmap){
    html = html.replace(/(\r\n|\n|\r)/gm, "");
    let catreg = /(?:[0-9][0-9]\/[0-9][0-9]\/[0-9][0-9][0-9][0-9]<\/td> *<td>)([^<]*)/g;
    let gradereg = /(?:<td align=\"center\">)(A\+|A|B\+|B|C\+|C|D\+|D|F|INC|\&nbsp\;)(?:<\/td> *<\/tr>)/g;
    let grade = {};
    let catmatch, gmatch;
    while(catmatch = catreg.exec(html)){ // NOTE: EXEMPTIONS ALSO WEIGHTED AS OF NOW
        catmatch = catmatch[1];
        gmatch = gradereg.exec(html)[1];
        if(gmatch == "\&nbsp\;") continue;
        if(grade[catmatch] == null){
            grade[catmatch] = [grade_fp[gmatch]];
        }else{
            grade[catmatch].push(grade_fp[gmatch]);
        }
    }
    let percent = 0;
    for(var cat in grade){
        let sum = 0;
        for(var i = 0; i < grade[cat].length; i++) sum += grade[cat][i];
        percent += sum / grade[cat].length * catmap[cat];
    }
    return percent;
}

function extractAssignmentList(){
    let table = document.querySelector("#content-main > div.box-round > table:nth-child(4) > tbody");
    //let newHeader = document.createElement("th");
   // newHeader.innerHTML = "Exmp";
    //table.querySelector("tr:nth-child(1)").appendChild(newHeader);
    let assignments = [];
    [...table.querySelectorAll('tr')].slice(1, -1).forEach((e, i) => {
        const curr = e.querySelectorAll('td');
        assignments.push(new ClassAssignment(i, curr[0].innerHTML, curr[1].innerHTML, curr[2].innerHTML, curr[3].hasChildNodes(), curr[4].hasChildNodes(), curr[5].hasChildNodes(), curr[6].hasChildNodes(), curr[7].hasChildNodes(), curr[8].innerHTML, curr[10].innerHTML));
        //if(assignments[i].excluded || assignments[i].exempt) e.innerHTML += "<td align='center'><input type='checkbox' checked></td>";
        //else e.innerHTML += "<td align='center'><input type='checkbox'></td>";
    });
    return assignments;
}

/**
 * Return Assignment instances for the given class page.
 * @param {Element} node Root node element of the class page.
 * @returns {Assignment[]} Assignments in this course
 */
function assignments (node) {
    const tr = [];
    // Find assignments table, get it's rows, take out the header and legend rows.
    [...node.querySelector('table[align=center').querySelectorAll('tr')].slice(1, -1).forEach((e, i) => {
        const curr = e.querySelectorAll('td');
        const assignment = new Assignment(curr[2]?.innerText || "", curr[curr.length - 1]?.innerText || "", i);
        if (e.querySelector('img[src="/images/icon_missing.gif"]')) {
            assignment.addStatus(Assignment.statuses.MISSING);
        }
        tr.push(assignment);
    });
    return tr;
}

/**
 * Return course title of active class page
 * @returns {String} Course title
 */
function extractCourseTitle () {
    return document.getElementsByTagName('h2')[0].innerHTML;
}

/**
 * Retrieve category weighting for class from local storage
 * @returns {Map<String, Object>} Map of weighting assigned to each category for course
 */
async function getSavedCategoryWeighting() {
    let courseName = extractCourseTitle() + "-catmap";
    let catmap = await browser.storage.local.get(courseName);
    console.log(catmap);
    if(catmap == undefined || (Object.keys(catmap).length === 0 && catmap.constructor === Object) || catmap[courseName] == undefined) return false;
    return catmap[courseName];
}

/**
 * Save category weighting for class to local storage
 * @param {Map<String, Object>} catmap Map of weighting assigned to each category for course
 */
async function saveCategoryWeighting(catmap){
    let courseName = extractCourseTitle();
    let data = {};
    data[courseName + "-catmap"] = catmap;
    console.log(data);
    browser.storage.local.set(data);
}

/**
 * Return saved grades for specified username.
 * @async
 * @param {String} username users full name
 * @returns {Promise<Course[]>} list of courses objects for that user
 */
async function getSavedGrades (username) {
    const courses = [];
    const user_data = (await browser.storage.local.get("user_data")).user_data;
    if (user_data !== undefined) {
        const user = user_data["USERDATA_" + username];
        if (user !== undefined) {
            const course_list = user.courses || [];
            for (let ind = 0; ind < course_list.length; ind++) {
                const course = course_list[ind];
                courses.push(new Course(
                    course.name,
                    course.link,
                    course.grade,
                    course.finalPercent,
                    course.assignments,
                ));
            }

            return courses;
        }
    }
}

/**
 * Saves grades for user to browser local storage
 * @async
 * @param {String} username users full name
 * @param {Course[]} courses list of course objects to save
 */
async function saveGradesLocally (username, courses) {
    const data = await getLocalConfig() || {};

    if (data.opted_in === undefined) {
        data.opted_in = {
            value: true,
            changed: false,
        };
    }

    if (data.showExtensionInfo === undefined) {
        data.showExtensionInfo = {
            value: true,
            changed: false,
        };
    }

    const user_data = await browser.storage.local.get("user_data") || {};
    const course_list = [];
    for (let i = 0; i < courses.length; i++) {
        course_list.push(courses[i].toObject());
    }
    user_data["USERDATA_" + username] = { "courses": course_list };

    data.user_data = user_data;
    data.most_recent_user = username;

    browser.storage.local.set(data);
}

/**
 * Retrieves the config from the browser's local storage
 * @async
 * @returns {Config} an object representing the user's config from the browser's local storage
 */
async function getLocalConfig () {
    const data = await browser.storage.local.get(null);
    return data;
}

export {
    gradeToFP,
    grade_fp,
    avaliableGrades,
    fprange,
    fpToGrade,
    gradeToGPA,
    calculate_gpa,
    getSavedCategoryWeighting,
    saveCategoryWeighting,
    extractFinalPercent,
    extractGradeCategories,
    extractAssignmentList,
    assignments,
    calculate_credit_hours,
    getSavedGrades,
    saveGradesLocally,
};
