<!--
 - @copyright Copyright (c) 2020 Suhas Hariharan <contact@suhas.net>
 - @author Suhas Hariharan <contact@suhas.net>
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
    <div
        id="saspes-last-grades"
        class="last-grade-div-fixed"
    >
        <div
            :style="{ left: opened ? 0 : width + 'px'}"
            class="last-grade-div"
        >
            <div
                class="last-grade-open"
                @click="toggleOpen"
            >
                Last Seen Grades
                <div
                    id="last-arrow"
                    class="arrow"
                    :class="{ 'arrow-left': !opened, 'arrow-right': opened }"
                />
            </div>
            <div
                ref="panel"
                class="last-grade-panel"
            >
                <table id="last-table">
                    <br>
                    <tr align="center">
                        <td> <h3> Last Seen Grades for {{ username }} </h3> </td>
                    </tr><tr>
                        <td> Course Name </td>
                        <td> Letter Grade </td>
                        <td> Final Percent(Out of 90) </td>
                    </tr><tr
                        v-for="course in courses"
                        :key="course.name"
                    >
                        <td>
                            <a
                                :href="course.link"
                                target="_blank"
                            >
                                {{ course.name }}
                            </a>
                        </td>
                        <td align="center">
                            {{ course.grade }}
                        </td>
                        <td align="center">
                            {{ course.finalPercent }}
                        </td>
                    </tr>
                </table>
                <br>
                <h3>With the above grades, semester GPA would be: {{ gpa }}.</h3>
            </div>
        </div>
    </div>
</template>
<script>
import { avaliableGrades, calculate_gpa } from '../helpers';

export default {
    name: "LastSeenGrades",
    props: {
        username: {
            type: String,
            required: true,
        },
        initialCourses: {
            type: Array,
            required: true,
        },
    },
    data: () => ({
        // Due to an issue with Vue reactivity not working on Course instances, using a standard JS object instead
        courses: [
            {
                name: "",
                link: "",
                grade: "",
                finalPercent: "",
            },
        ],
        gradeOptions: [...avaliableGrades, ""],
        opened: false,
        width: 7000,
    }),
    computed: {
        gpa () {
            return calculate_gpa(this.courses);
        },
    },
    beforeMount () {
        this.resetData();
    },
    mounted () {
        this.width = this.$refs.panel.offsetWidth + 1;
    },
    methods: {
        toggleOpen () {
            this.opened = !this.opened;
            if (!this.opened) {
                this.resetData();
            }
        },
        resetData () {
            const toSet = [];
            for (let i = 0; i < this.initialCourses.length; i++) {
                const curr = this.initialCourses[i];
                if (curr.grade !== "[ i ]") {
                    toSet.push({
                        name: curr.name,
                        link: curr.link,
                        grade: curr.grade,
                        finalPercent: curr.finalPercent,
                    });
                }
            }
            this.courses = toSet;
        },
    },
};
</script>
<style lang="less" scoped>
.arrow {
    margin-left:10%;
    border: solid black;
    border-width: 0 5px 5px 0;
    display: inline-block;
    padding: 3px;
    transition-property: transform;
    transition-duration: 1s;
}
.arrow-left {
    transform: rotate(135deg);
}
.arrow-right    {
    transform: rotate(315deg);
}
.last-grade-open {
    background-color: white;
    box-shadow: -4px 4px 5px 0 rgba(0,0,0,0.2);
    color: black;
    padding: 5px 10px 5px 10px;
    text-align: center;
    text-decoration: none;
    transition: padding 0.5s;
    width: 120px;
    height: 30px;
    display: flex;
    align-items: center;
    border-radius: 20px 0px 0px 20px;
    position: relative;
    overflow: hidden;
    left: 0;
    top: 30px;
    z-index: 2;

    &:hover {
        cursor: pointer;

        &:not(.currently-open) {
            padding: 5px 25px 5px 10px;
        }

        & + .last-grade-panel {
            box-shadow: 3px 8px 20px 0 rgba(0,0,0,0.2);
        }
    }

}
.last-grade-panel    {
    background-color: white;
    box-shadow: 1px 4px 10px 0 rgba(0,0,0,0.2);
    z-index: -1;
    display: inline-block;
    border-radius: 15px 0px 0px 15px;
    transition: box-shadow 0.3s;
    position: relative;
    left: 0;
    overflow: hidden;

    &:hover {
        box-shadow: 3px 8px 20px 0 rgba(0,0,0,0.2);
    }
}
.last-grade-div  {
    background: transparent;
    position: relative;
    padding: 0;
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: start;
    z-index: 999;
    transition: left 1s;
    left: 100vw;

    select {
        border-radius: 5px 5px 5px 5px;
        min-width: 5.5em;
    }
}
.last-grade-div-fixed {
    position: fixed;
    right: 0;
    top: 20px;
    background: transparent;
    pointer-events: none;

    & * {
        pointer-events: initial;
    }
}
</style>
