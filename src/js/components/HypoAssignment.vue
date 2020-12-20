<!--
 - @copyright Copyright (c) 2018-2019 Gary Kim <gary@garykim.dev>
 - @copyright Copyright (c) 2020 Advay Ratan <advayratan@gmail.com>
 -
 - @author Gary Kim <gary@garykim.dev>
 - @author Advay Ratan <advayratan@gmail.com>
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
<div>
    <table border="0" cellpadding="0" cellspacing="0" align="center" width="99%"><tbody>
        <tr>
            <th>Due Date</th>
            <th>Category</th>
            <th>Assignment</th>
            <th class="center" colspan="5">Flags</th>
            <th class="center">Score</th>
            <th class="center"></th>
            <th class="center">Grd</th>
            <th>Exmp</th>
        </tr>
        <GradeRow
            v-for="assignment in assignments"
            v-bind:key="assignment.id"
            v-bind:assignment="assignment"
            v-bind:color="'#FFF'"
        ></GradeRow>
        <tr>
            <td colspan="11" align="center">
                <img src="/images/icon_check.gif" alt="Collected"> - Collected,
                <img src="/images/icon_late.gif" alt="Late"> - Late,
                <img src="/images/icon_missing.gif" alt="Missing"> - Missing,
                <img src="/images/icon_exempt.gif" alt="Exempt"> - Score is exempt from final grade,
                <img src="/images/icon_excluded.gif" alt="Excluded"> - Assignment is not included in final grade
            </td>
        </tr>
    </tbody></table>
    <button v-on:click="addAssignment();">Add Assignment</button>
</div>
</template>
<script>
import Vue from 'vue';
import GradeRow from './GradeRow.vue';
import { avaliableGrades, extractAssignmentList, fpToGrade, gradeToFP } from '../helpers';
import ClassAssignment from '../models/ClassAssignment';
const getInRange = require('get-in-range');

export default {
    name: 'HypoAssignment',
    props: {
        categories: {
            type: Array,
            required: true,
        },
        assignments: {
            type: Array,
            required: true,
        }
    },
    data: () => ({
        gradeOptions: avaliableGrades,
    }),
    methods: {
        addAssignment() {
            this.assignments.push(new ClassAssignment(this.assignments[this.assignments.length-1].id+1, "today", "select", "New Assignment", false, false, false, false, false, "--/9", "B", true));
        },
        calculateGrades(catmap){
            let grade = {};
            for(var i = 0; i < this.assignments.length; i++){
                if(grade[this.assignments[i].category] == null){
                    grade[this.assignments[i].category] = [gradeToFP(this.assignments[i].grade)];
                }else{
                    grade[this.assignments[i].category].push(gradeToFP(this.assignments[i].grade));
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
    },
    components: {
        GradeRow
    }
};
</script>
<style lang="less" scoped>
#saspes-hypo-assignment {
    border: 1px solid #CCCCCC;
    border-radius: 4px;
    margin: 10px 20px;
    padding: 0;

    & h3 {
        font-size: 110%;
        margin: 0 10px 10px 10px;
        padding: 0;
        border-top-right-radius: 3px;
        border-top-left-radius: 3px;
    }

    & select {
        margin: 0 auto 0 auto;
        border-radius: 5px 5px 5px 5px;
    }

    & label {
        vertical-align: initial;
        padding-left: 20px;
    }

    & input {
        border-radius: 5px 5px 5px 5px;
        padding: 5px;
    }
}

</style>
