<!--
 - @copyright Copyright (c) 2020 Advay Ratan <advayratan@gmail.com>
 -
 - @copyright Copyright (c) 2021 Suhas Hariharan <contact@suhas.net>
 -
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
        <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            align="center"
            width="99%"
        >
            <tbody>
                <tr>
                    <th>Due Date</th>
                    <th>Category</th>
                    <th>Assignment</th>
                    <th
                        class="center"
                        colspan="5"
                    >
                        Flags
                    </th>
                    <th class="center">
                        Score
                    </th>
                    <th class="center" />
                    <th class="center">
                        Grd
                    </th>
                    <th v-if="categoryWeighting">Exmp</th>
                </tr>
                <grade-row
                    v-for="assignment in assignments"
                    :key="assignment.id"
                    :assignment="assignment"
                    :categories="categories"
                    :categoryWeighting="categoryWeighting"
                />
                <tr>
                    <td
                        colspan="11"
                        align="center"
                    >
                        <img
                            src="/images/icon_check.gif"
                            alt="Collected"
                        > - Collected,
                        <img
                            src="/images/icon_late.gif"
                            alt="Late"
                        > - Late,
                        <img
                            src="/images/icon_missing.gif"
                            alt="Missing"
                        > - Missing,
                        <img
                            src="/images/icon_exempt.gif"
                            alt="Exempt"
                        > - Score is exempt from final grade,
                        <img
                            src="/images/icon_excluded.gif"
                            alt="Excluded"
                        > - Assignment is not included in final grade
                    </td>
                </tr>
            </tbody>
        </table>
        <button v-if="categoryWeighting" @click="addAssignment();">
            Add Assignment
        </button>
    </div>
</template>
<script>
import GradeRow from './GradeRow.vue';
import { avaliableGrades, gradeToFP } from '../helpers';
import ClassAssignment from '../models/ClassAssignment';

export default {
    name: 'GradeTable',
    components: {
        GradeRow,
    },
    props: {
        categories: {
            type: Array,
            required: true,
        },
        assignments: {
            type: Array,
            required: true,
        },
    },
    data: () => ({
        gradeOptions: avaliableGrades,
        categoryWeighting: false,
    }),
    methods: {
        addAssignment () {
            this.assignments.push(new ClassAssignment(this.assignments[this.assignments.length - 1].id + 1, "today", this.categories[0], "New Assignment", false, false, false, false, false, "--/9", "B", true));
        },
        calculateGrades (catmap) {
            try {
                const grade = {};
                for (var i = 0; i < this.assignments.length; i++) {
                    if (this.assignments[i].userExempt || this.assignments[i].grade === " ") continue;
                    if (grade[this.assignments[i].category] == null) {
                        grade[this.assignments[i].category] = [gradeToFP(this.assignments[i].grade)];
                    } else {
                        grade[this.assignments[i].category].push(gradeToFP(this.assignments[i].grade));
                    }
                }
                let missing = 0;
                for (var cat in catmap) {
                    if (grade[cat] == null) {
                        if (catmap[cat].weighting !== "") {
                            missing += catmap[cat].weighting;
                        }
                    }
                }
                let percent = 0;
                for (cat in grade) {
                    let sum = 0;
                    for (i = 0; i < grade[cat].length; i++) {
                        sum += grade[cat][i];
                    }
                    if (catmap[cat].weighting !== "") {
                        percent += sum / grade[cat].length * catmap[cat].weighting;
                    }
                }
                if (missing === 100) {
                    return 0;
                } else {
                    return percent / (100 - missing);
                }
            } catch (err) {
                return 0;
            }
        },
        delCategory (c) {
            for (var i = 0; i < this.assignments.length; i++) {
                if (this.assignments[i].category === this.categories[c]) {
                    this.assignments.splice(i, 1);
                    i--;
                }
            }
        },
        changeCategory (oc, nc) {
            for (var i = 0; i < this.assignments.length; i++) {
                if (this.assignments[i].category === oc) {
                    this.assignments[i].category = nc;
                }
            }
        },
        setCategoryWeighting (b) {
            this.categoryWeighting = b;
        },
    },
};
</script>
