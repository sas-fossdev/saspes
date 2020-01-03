<template>
    <div id="saspes-hypo-assignment">
        <h3>Hypothetical Assignments/Exemptions</h3>
        <label for="saspes-assignment-effect">Input hypothetical assingments and weightage for overall grade or an exemption of an existing assignment:</label>
        <table style='width:50%;'>
            <thead>
                <th>Weight</th>
                <th>Grade</th>
                <th>Exemption?</th>
            </thead>
            <tr v-for="(content, index) in assignments">
                <td>
                    <input
                        id="saspes-assignment-effect"
                        v-model.number="content.weight"
                        type="number"
                        min="0"
                        max="100"
                        value="0"
                    >%
                </td>
                <td>
                    <select
                        id="hypo-grade-select"
                        v-model="content.grade"
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
                <td>
                    <input type="checkbox" v-model="content.exempt"/>
                </td>
                <td>
                    <button @click='removeAssignment(index)'>Remove</button>
                </td>
            </tr>
        </table>
        <button @click='addAssignment()'>Add Assignment</button>
        <br>
        <h4>Your grade with the selected assignment would be {{ hypo.grade }} with a final percent of {{ hypo.fp }}.</h4>
    </div>
</template>
<script>
import { avaliableGrades, fpToGrade, gradeToFP } from '../helpers';

export default {
    name: 'HypoAssignment',
    props: {
        currentFP: {
            type: Number,
            required: true
        }
    },
    data: () => ({
        assignments: [
            {weight: 0, grade: 'B', exempt: false}
        ],
        gradeOptions: avaliableGrades
    }),
    methods: {
        addAssignment: function() {
            this.assignments.push({weight: 0, grade: 'B', exempt: false});
        },
        removeAssignment: function(n){
            this.assignments.splice(n,1);
        }
    },
    computed: {
        hypo() {
            let total_percent = 0;
            let new_fp = 0;
            let exempt_percent = 0;
            let exempt_score = 0;
            for(var i = 0; i < this.assignments.length; i++){
                if(this.assignments[i].exempt){
                    exempt_percent += this.assignments[i].weight * 0.01;
                    exempt_score += this.assignments[i].weight * 0.01 * gradeToFP(this.assignments[i].grade);
                }else{
                    total_percent += this.assignments[i].weight * 0.01;
                    new_fp += this.assignments[i].weight * 0.01 * gradeToFP(this.assignments[i].grade);
                }
            }
            new_fp += (1 - total_percent) * (this.currentFP - exempt_score)/(1 - exempt_percent);
            return {
                fp: new_fp.toFixed(2),
                grade: fpToGrade(new_fp)
            };
        }
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

