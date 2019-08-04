/**
 * 
 * @copyright Copyright (c) 2018-2019 Gary Kim <gary@garykim.dev>
 * 
 * @author Gary Kim <gary@garykim.dev>
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
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 */

'use strict';

const browser = require('webextension-polyfill');
const getKeyRange = require('get-key-range');

function analyticsMessage(action_input) {
    browser.runtime.sendMessage({action: "analytics_send", args: {url: window.location.href,action: action_input}});
}

const gradeToFP = {
    'A+': 90,
    'A': 80,
    'B+': 70,
    'B': 60,
    'C+': 50,
    'C': 40,
    'D+': 30,
    'D': 20,
    'F': 10
};

function grade_fp(grade) {
    if (grade in gradeToFP) {
        return gradeToFP[grade];
    }
    return -1;
}

const avaliableGrades = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"];

const fprange = {
    '0-15': 'F',
    '15-25': 'D',
    '25-35': 'D+',
    '35-45': 'C',
    '45-55': 'C+',
    '55-65': 'B',
    '65-75': 'B+',
    '75-85': 'A',
    '85-90': 'A+'
};

function fpToGrade(finalPercent) {
    return getKeyRange(fprange, finalPercent);
}

export {
    analyticsMessage,
    gradeToFP,
    grade_fp,
    avaliableGrades,
    fprange,
    fpToGrade
};