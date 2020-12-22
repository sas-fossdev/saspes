/**
 *
 * @copyright Copyright (c) 2020 Advay Ratan <advayratan@gmail.com>
 *
 * @author Advay Ratan <advayratan@gmail.com>
 *
 * @license GNU AGPL version 3 only
 *
 * SAS Powerschool Enhancement Suite - A browser extension to improve the experience of SAS Powerschool.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

export default class ClassAssignment {

    constructor (id, date, category, name, collected, late, missing, exempt, excluded, score, grade, hypo = false) {
        this.id = id;
        this.date = date;
        this.category = category;
        this.name = name;
        this.collected = collected;
        this.late = late;
        this.missing = missing;
        this.exempt = exempt;
        this.excluded = excluded;
        this.score = score;
        this.grade = (grade == "&nbsp;") ? " " : grade;
        this.hypo = hypo;
        this.userExempt = this.exempt || this.excluded;
    }
}
