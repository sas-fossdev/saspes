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
    <tr :bgcolor="(assignment.id % 2 == 0) ? '#edf3fe' : '#fff'">
        <td v-html="assignment.date"></td>
        <td v-if="!assignment.hypo" v-html="assignment.category"></td>
        <td v-else>
            <select v-model="assignment.category">
                <option
                    v-for="category in categories"
                    :key="category"
                    :value="category"
                >{{ category }}</option>
            </select>
        </td>
        <td v-html="assignment.name"></td>
        <td width="14"><img src="/images/icon_check.gif" alt="Collected" v-if="assignment.collected"></td>
        <td width="14"><img src="/images/icon_late.gif" alt="Late" v-if="assignment.late"></td>
        <td width="14"><img src="/images/icon_missing.gif" alt="Missing" v-if="assignment.missing"></td>
        <td width="14"><img src="/images/icon_exempt.gif" alt="Exempt" v-if="assignment.exempt"></td>
        <td width="19"><img src="/images/icon_excluded.gif" alt="Excluded" v-if="assignment.excluded"></td>
        <td align="center"><span class="bold-underline" v-html="assignment.score"></span></td>
        <td align="center">&nbsp;</td>
        <td v-if="!assignment.hypo" align="center" v-html="assignment.grade"></td>
        <td v-else align="center">
            <select v-model="assignment.grade">
                <option
                    v-for="grade in gradeOptions"
                    :key="grade"
                    :value="grade"
                >{{ grade }}</option>
            </select>
        </td>
        <td v-if="assignment.userExempt" align="center"><input type="checkbox" checked v-model="assignment.userExempt"></td>
        <td v-else align="center"><input type="checkbox" v-model="assignment.userExempt"></td>
    </tr>
</template>
<script>
import { avaliableGrades } from '../helpers';
export default {
    name: 'GradeRow',
    props: ['assignment', 'color', 'categories'],
    data: () => ({
        gradeOptions: avaliableGrades,
    }),
}
</script>

