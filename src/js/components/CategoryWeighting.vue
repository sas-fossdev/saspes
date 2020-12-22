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
    <div id="saspes-categories">
        <h3>Category Weighting</h3>
        <table border="0" cellpadding="0" cellspacing="0" align="center" style="width: 40%;">
        <col>
        <col style="width: 20%;">
        <tbody>
            <tr>
                <th>Category</th>
                <th>Weighting</th>
            </tr>
            <tr v-for="category in categoryMap" v-bind:key="category.category">
                <td v-html="category.category"></td>
                <td><input type="number" v-model.number="category.weighting" style="width: 85%;"></td>
            </tr>
        </tbody></table>
        <label v-if="categorySum != 1">Category weightings do not sum to 1</label>
        <h4>Your grade with these weightings and hypothetical assignemnts would be {{ hypo.grade }} with a final percent of {{ hypo.fp }}.</h4>
        <!--
        <label for="hypo-grade-select">Grade of new assignment: </label>
        <select
            id="hypo-grade-select"
            v-model="assignment.grade"
        >
            <option
                v-for="grade in gradeOptions"
                :key="grade"
                :value="grade"
            >
                {{ grade }}
            </option>
        </select>
        <br>
        <h4>Your grade with the selected assignment would be {{ hypo.grade }} with a final percent of {{ hypo.fp }}.</h4>
        -->
    </div>
</template>
<script>
import { avaliableGrades, fpToGrade, gradeToFP } from '../helpers';
import GradeTable from './GradeTable.vue';
const getInRange = require('get-in-range');
export default {
    name: 'CategoryWeighting',
    props: {
        categories: {
            type: Array,
            required: true,
        },
        gradetable: {
            type: GradeTable,
            required: true,
        }
    },
    data: function () {
        let categoryMap = {};
        this.categories.forEach((e,i) => {
            categoryMap[e] = {weighting: 0, category: e};
        });
        return {
            categoryMap: categoryMap,
        }
    },
    computed: {
        categorySum () {
            let sum = 0;
            for(const [key, value] of Object.entries(this.categoryMap)){
                sum += value.weighting;
            };
            return Math.round(sum*100)/100;
        },
        hypo () {
            let percent = this.gradetable.calculateGrades(this.categoryMap);
            return {
                grade: fpToGrade(percent),
                fp: percent.toFixed(2),
            }
        }
    },
};
</script>
<style lang="less" scoped>
#saspes-categories {
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
