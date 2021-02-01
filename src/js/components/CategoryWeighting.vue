<!--
 - @copyright Copyright (c) 2020 Advay Ratan <advayratan@gmail.com>
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
    <div id="saspes-categories">
        <h3>Category Weighting</h3>
        <p>Enter the decimal weighting of each category (from your course syllabus) and use exemptions and add assignment on the table above to add multiple hypothetical grades.</p>
        <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            align="center"
            style="width: 40%;"
        >
            <col>
            <col style="width: 20%;">
            <tbody>
                <tr>
                    <th>Category</th>
                    <th>Weighting</th>
                </tr>
                <tr
                    v-for="(category, index) in renderWeights"
                    :key="index"
                    :bgcolor="(index % 2 == 0) ? '#edf3fe' : '#fff'"
                >
                    <td v-if="category.newc">
                        <input v-model="category.category" @change="changeCategory(index, category.category)">
                        <button @click="delCategory(index)">Del</button>
                    </td>
                    <td v-else v-html="category.category" />
                    <td>
                        <input
                            v-model.number="category.weighting"
                            type="number"
                            style="width: 85%;"
                        >
                    </td>
                </tr>
            </tbody>
        </table>
        <button @click="addCategory();">
            Add Category
        </button>
        <label v-if="categorySum != 1">Category weightings do not sum to 1</label>
        <button
            v-else
            @click="saveCategoryWeightingLocal();"
        >
            Save Weighting
        </button>
        <h2>{{ hypo.grade }} ({{ hypo.fp }})</h2>
        <p>Note: Since teachers can adjust the weighting of each assignment as well, this number is not necessarily accurate</p>
    </div>
</template>
<script>
import { getSavedCategoryWeighting, saveCategoryWeighting, fpToGrade } from '../helpers';
export default {
    name: 'CategoryWeighting',
    props: {
        categories: {
            type: Array,
            required: true,
        },
        gradetable: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            renderWeights: [],
            newCategories: 0,
        };
    },
    computed: {
        categorySum () {
            if (this.renderWeights.length === 0) return 0;
            let sum = 0;
            const cm = this.getCategoryMap();
            for (const [key, val] of Object.entries(cm)) {
                sum += val.weighting;
            }
            return Math.round(sum * 100) / 100;
        },
        hypo () {
            if (this.renderWeights.length === 0) return { grade: "F", fp: 0 };
            const percent = this.gradetable.calculateGrades(this.getCategoryMap());
            return {
                grade: fpToGrade(percent),
                fp: percent.toFixed(2),
            };
        },
    },
    created () {
        this.getCatmap();
    },
    methods: {
        async getCatmap () {
            let catmap = await getSavedCategoryWeighting();
            if (catmap === false) {
                catmap = {};
                this.categories.forEach((e, i) => {
                    catmap[e] = { weighting: 0, category: e };
                });
            }
            for (var cat in catmap) {
                this.renderWeights.push(catmap[cat]);
            }
        },
        saveCategoryWeightingLocal () {
            saveCategoryWeighting(this.getCategoryMap());
        },
        addCategory () {
            this.newCategories++;
            const nc = "Category " + this.newCategories;
            this.categories.push(nc);
            this.renderWeights.push({ weighting: 0, category: nc, newc: true });
        },
        getCategoryMap () {
            const catmap = {};
            this.renderWeights.forEach((e, i) => {
                catmap[e.category] = e;
            });
            return catmap;
        },
        delCategory (i) {
            this.gradetable.delCategory(i);
            this.renderWeights.splice(i, 1);
            this.categories.splice(i, 1);
        },
        changeCategory (c, nc) {
            this.gradetable.changeCategory(this.categories[c], nc);
            this.categories[c] = nc;
        },
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
