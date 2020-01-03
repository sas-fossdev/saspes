<!--
 - @copyright Copyright (c) 2018-2019 Gary Kim <gary@garykim.dev>
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
    <div
        id="saspes-hypo-grades"
        class="hypo-grade-div-fixed"
    >
        <div
            :style="{ left: opened ? 0 : width + 'px'}"
            class="hypo-grade-div"
        >
            <div
                class="hypo-grade-open"
                @click="toggleOpen"
            >
                <div
                    id="hypo-arrow"
                    class="arrow"
                    :class="{ 'arrow-left': !opened, 'arrow-right': opened }"
                />
            </div>
            <div
                ref="panel"
                class="hypo-grade-panel"
            >
                <table id="hypo-table">
                    <br>
                    <tr
                        v-for="course in courses"
                        :key="course.name"
                    >
                        <td>
                            <a
                                :href="course.link"
                                target="_blank"
                            >
                                {{ course.name }}:
                            </a>
                        </td>
                        <td>
                            <select
                                v-model="course.grade"
                                class="hypo-grade-select"
                            >
                                <option
                                    v-for="grade in gradeOptions"
                                    :key="grade"
                                    :value="grade"
                                >
                                    {{ grade }}
                                </option>
                            </select>
                        </td>
                    </tr>
                </table>
                <br>
                <h3>With the above grades, semester GPA would be: {{ hypo }}.</h3>
            </div>
        </div>
    </div>
</template>
<script>
import { avaliableGrades, calculate_gpa } from '../helpers';

export default {
    name: "HypoGrades",
    props: {
        initialCourses: {
            type: Array,
            required: true,
        },
    },
    data: () => ({
        courses: [
            {
                name: "Course 1",
                link: "/course",
                grade: "B",
            },
        ],
        gradeOptions: [...avaliableGrades, ""],
        opened: false,
        width: 10000,
    }),
    computed: {
        hypo () {
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
            this.courses = JSON.parse(JSON.stringify(this.initialCourses));
        },
    },
};
</script>
<style lang="less" scoped>
.arrow {
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
.hypo-grade-open {
    background-color: white;
    box-shadow: -4px 4px 5px 0 rgba(0,0,0,0.2);
    color: black;
    padding: 5px 10px 5px 10px;
    text-align: center;
    text-decoration: none;
    transition: padding 0.5s;
    width: 8px;
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

        & + .hypo-grade-panel {
            box-shadow: 3px 8px 20px 0 rgba(0,0,0,0.2);
        }
    }

}
.hypo-grade-panel    {
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
.hypo-grade-div  {
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
.hypo-grade-div-fixed {
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
