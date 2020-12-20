<template>
    <tr :bgcolor="(assignment.id % 2 == 0) ? '#edf3fe' : '#fff'">
        <td>{{ assignment.date }}</td>
        <td>{{ assignment.category }}</td>
        <td>{{ assignment.name }}</td>
        <td width="14"><img src="/images/icon_check.gif" alt="Collected" v-if="assignment.collected"></td>
        <td width="14"><img src="/images/icon_late.gif" alt="Late" v-if="assignment.late"></td>
        <td width="14"><img src="/images/icon_missing.gif" alt="Missing" v-if="assignment.missing"></td>
        <td width="14"><img src="/images/icon_exempt.gif" alt="Exempt" v-if="assignment.exempt"></td>
        <td width="19"><img src="/images/icon_excluded.gif" alt="Excluded" v-if="assignment.excluded"></td>
        <td align="center"><span class="bold-underline">{{ assignment.score }}</span></td>
        <td align="center">&nbsp;</td>
        <td v-if="!assignment.hypo" align="center">{{ assignment.grade }}</td>
        <td v-else align="center">
            <select v-model="assignment.grade">
                <option
                    v-for="grade in gradeOptions"
                    :key="grade"
                    :value="grade"
                >{{ grade }}</option>
            </select>
        </td>
        <td v-if="assignment.exempt || assignment.excluded" align="center"><input type="checkbox" checked></td>
        <td v-else align="center"><input type="checkbox"></td>
    </tr>
</template>
<script>
import { avaliableGrades } from '../helpers';
export default {
    name: 'GradeRow',
    props: ['assignment', 'color'],
    data: () => ({
        gradeOptions: avaliableGrades,
    }),
}
</script>

