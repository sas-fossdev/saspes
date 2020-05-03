<!--
 -
 - @copyright Copyright (c) 2020 Suhas Hariharan <mail@suhas.net>
 - @copyright Copyright (c) 2020 Gary Kim <gary@garykim.dev>
 -
 - @author Gary Kim <gary@garykim.dev>
 -
 - @license GNU AGPL version 3 only
 -
 - SAS Powerschool Enhancement Suite - A browser extension to improve the experience of SAS Powerschool.
 -
 - This program is free software: you can redistribute it and/or modify
 - it under the terms of the GNU Affero General Public License as
 - published by the Free Software Foundation, version 3.
 -
 - This program is distributed in the hope that it will be useful,
 - but WITHOUT ANY WARRANTY; without even the implied warranty of
 - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 - GNU Affero General Public License for more details.
 -
 - You should have received a copy of the GNU Affero General Public License
 - along with this program.  If not, see <https://www.gnu.org/licenses/>.
 -->

<template>
    <tr>
        <td align="center">
            <button
                v-if="currently === CURRENTLY.NOTHING"
                @click="calculate"
            >
                Calculate Cumulative GPA
            </button>
            <vue-loading
                v-else-if="currently === CURRENTLY.CALCULATING"
                type="bars"
                color="#20a0ff"
                :size="{ width: '30px', height: '1.5em' }"
            />
            <div v-else-if="currently === CURRENTLY.ERROR">
                Encountered an error calculating your cumulative GPA
            </div>
            <div
                v-else-if="currently === CURRENTLY.DONE"
            >
                <v-popover
                    trigger="manual"
                    :delay="{ show: 0, hide: 200 }"
                    :open="popoverOpen"
                >
                    <a
                        href="#"
                        @mouseenter="popoverOpen = true"
                        @mouseleave="popoverOpen = false"
                    >Cumulative GPA (9-12): {{ gpa }}</a>
                    <template
                        slot="popover"
                    >
                        <div
                            @mouseenter="popoverOpen = true"
                            @mouseleave="popoverOpen = false"
                        >
                            <div class="section-title">
                                Disclaimer
                            </div>
                            <div class="section-content">
                                No guarantees are made about the accuracy of this value. <br>
                                <b>DO NOT SEND THIS TO COLLEGES</b>. You can check your official GPA at <a href="https://sas.cialfo.co">Cialfo</a> (does not include current semester)
                            </div>
                        </div>
                    </template>
                </v-popover>
            </div>
        </td>
    </tr>
</template>

<script>
import { VueLoading } from 'vue-loading-template';
import { VPopover } from 'v-tooltip';

import Course from "../models/Course";
import { calculate_gpa, gradeToGPA } from "../helpers";

const CURRENTLY = {
    NOTHING: 0,
    CALCULATING: 1,
    DONE: 2,
    ERROR: 3,
};

export default {
    name: "CumulativeGPA",
    components: {
        VueLoading,
        VPopover,
    },
    props: {
        courses: {
            type: Array,
            required: true,
        },
        currentTerm: {
            type: String,
            required: true,
        },
        secondSemester: {
            type: Boolean,
            required: true,
        },
    },
    data () {
        return {
            currently: CURRENTLY.NOTHING,
            gpa: "0.00",
            popoverOpen: false,
        };
    },
    computed: {
        CURRENTLY () {
            return CURRENTLY;
        },
    },
    methods: {
        async calculate () {
            if (this.currently !== CURRENTLY.NOTHING) {
                return;
            }

            this.currently = CURRENTLY.CALCULATING;
            const gpa = await this.calculate_cumulative_gpa(this.courses, this.currentTerm, this.secondSemester).catch(() => null);
            if (gpa) {
                this.gpa = gpa.toFixed(2);
                this.currently = CURRENTLY.DONE;
            } else {
                this.currently = CURRENTLY.ERROR;
            }
        },
        calculate_cumulative_gpa (current_courses, current_term, current_semester) {
            const list_of_gpas = [];
            const all_courses = [];
            const credit_hour_list = [];
            let element_list = [];
            const current_term_grades = [];
            const fetches = [];
            // Fetches grade history page
            const gpas = fetch("https://powerschool.sas.edu.sg/guardian/termgrades.html")
                .then(response => response.text())
                .then(data => {
                    const el = document.createElement("html");
                    el.innerHTML = data;
                    const current_term_history = el.getElementsByClassName("selected")[0].textContent.split(" - ")[0];
                    const tabs = el.getElementsByClassName("tabs")[0].getElementsByTagName("li");
                    // Iterate until the end of tabs or until no longer at a high school semester, first value indicates whether the course list is the most recent set of courses
                    for (let i = 0; i < tabs.length && /HS$/.test(tabs[i].innerText); i++) {
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
                                            if (i === 0) {
                                                current_term_grades.push(courses);
                                            }
                                            courses = [];
                                        }
                                        if (element_list[t].getElementsByTagName("th").length > 0) {
                                            continue;
                                        } else {
                                            const $prev_course = element_list[t];
                                            if ($prev_course?.getElementsByTagName("td").length > 1) {
                                                const table_entries = $prev_course.querySelectorAll("td");
                                                const course = new Course(table_entries[0].textContent.trim(), "",
                                                    table_entries[1].textContent.trim());
                                                courses.push(course);
                                            }
                                            // Creates course object with each course from grade history page
                                        }
                                    }
                                    if (i === 0) {
                                        current_term_grades.push(courses);
                                    }
                                    all_courses.push(courses);
                                }));
                    }
                    // Calculates cumulative GPA based on credit hours per semester and gpa for each semester.

                    const cumulative_gpa = Promise.all(fetches).then(function () {
                        let include_current_semester = false;
                        if (current_courses.length !== 0) {
                            for (let i = 0; i < current_courses.length; i++) {
                                if (new URL(current_courses[i].link).searchParams.get("begdate")) {
                                    include_current_semester = true;
                                }
                            }
                        }
                        // Handles edge case where grade history page is updated before semester end
                        if (current_term_history === current_term && include_current_semester && current_term_grades.length === 2 && current_semester) {
                            all_courses.splice(all_courses.indexOf(current_term_grades[1]), 1);
                        } else if (current_term_history === current_term && include_current_semester && current_term_grades.length === 1 && current_semester === false) {
                            all_courses.splice(all_courses.indexOf(current_term_grades[0]), 1);
                        }

                        if (include_current_semester) {
                            all_courses.push(current_courses);
                        }
                        let total_count = 0;
                        let total_gpa = 0;
                        for (let i = 0; i < all_courses.length; i++) {
                            let count = 0;
                            list_of_gpas.push(calculate_gpa(all_courses[i]));
                            for (let t = 0; t < all_courses[i].length; t++) {
                                if (gradeToGPA(all_courses[i][t].grade) !== -1) {
                                    count += all_courses[i][t].creditHour;
                                }
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
        },
    },
};
</script>

<style lang="less" scoped>
@header-color: #a3bfcc;

td {
    background-color: white;
}
.section {
    &-title {
        font-weight: bold;
        background: @header-color;
        padding: 5px 5px 0 5px;
        text-align: center;
    }

    &-content {
        padding: 5px;
    }
}
</style>

<style lang="less">
.tooltip {
    @header-color: #a3bfcc;
    display: block !important;
    z-index: 10000;

    .tooltip-arrow {
        width: 0;
        height: 0;
        border-style: solid;
        position: absolute;
        margin: 5px;
        border-color: black;
        z-index: 1;
    }

    &[x-placement^="top"] {
        margin-bottom: 5px;

        .tooltip-arrow {
            border-width: 5px 5px 0 5px;
            border-left-color: transparent !important;
            border-right-color: transparent !important;
            border-bottom-color: transparent !important;
            bottom: -5px;
            left: calc(50% - 5px);
            margin-top: 0;
            margin-bottom: 0;
        }
    }

    &[x-placement^="bottom"] {
        margin-top: 5px;

        .tooltip-arrow {
            border-width: 0 5px 5px 5px;
            border-color: @header-color !important;
            border-left-color: transparent !important;
            border-right-color: transparent !important;
            border-top-color: transparent !important;
            top: -5px;
            left: calc(50% - 5px);
            margin-top: 0;
            margin-bottom: 0;
        }
    }

    &[x-placement^="right"] {
        margin-left: 5px;

        .tooltip-arrow {
            border-width: 5px 5px 5px 0;
            border-left-color: transparent !important;
            border-top-color: transparent !important;
            border-bottom-color: transparent !important;
            left: -5px;
            top: calc(50% - 5px);
            margin-left: 0;
            margin-right: 0;
        }
    }

    &[x-placement^="left"] {
        margin-right: 5px;

        .tooltip-arrow {
            border-width: 5px 0 5px 5px;
            border-top-color: transparent !important;
            border-right-color: transparent !important;
            border-bottom-color: transparent !important;
            right: -5px;
            top: calc(50% - 5px);
            margin-left: 0;
            margin-right: 0;
        }
    }

    &.popover {

        .popover-inner {
            background: #f9f9f9;
            color: black;
            padding: 0 0 5px 0;
            border-radius: 5px;
            box-shadow: 0 5px 30px rgba(black, .3);
            overflow: hidden;
        }

        .popover-arrow {
            border-color: #f9f9f9;
            z-index: 5000;
        }
    }
}
</style>
