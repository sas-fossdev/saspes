/**
 *
 * @copyright Copyright (c) 2020 Gary Kim <gary@garykim.dev>
 *
 * @author Gary Kim <gary@garykim.dev>
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
import { calculate_credit_hours } from '../helpers';

export default class Course {
    #name;
    #grade;
    #finalPercent;
    #link;
    #assignments;
    #creditHour;

    /**
     * Create new course instance
     *
     * @param {String} name the name of the course
     * @param {String} link link to the course page
     * @param {String} [grade] current grade for the course
     * @param {Number?} [finalPercent] current final percent of the course
     * @param {Assignment[]} [assignments] number of missing assignments
     * @param {Number?} [creditHour] number of credit hours this course counts for, optional
     */
    constructor (name, link, grade, finalPercent, assignments) {
        this.#name = name;
        this.#link = link;
        this.#grade = grade;
        this.#finalPercent = finalPercent;
        this.#assignments = assignments;
        this.#creditHour = calculate_credit_hours(this.#name);
    }

    toObject () {
        return { "name": this.#name, "link": this.#link, "grade": this.#grade, "finalPercent": this.#finalPercent, "assignments": this.#assignments, "creditHour": this.#creditHour };
    }

    get name () {
        return this.#name;
    }

    get creditHour () {
        return this.#creditHour;
    }

    get link () {
        return this.#link;
    }

    get grade () {
        return this.#grade;
    }

    set grade (g) {
        this.#grade = g;
    }

    set creditHour (c) {
        this.#creditHour = c;
    }

    get finalPercent () {
        return this.#finalPercent;
    }

    set finalPercent (fp) {
        this.#finalPercent = fp;
    }

    get assignments () {
        return this.#assignments;
    }

    set assignments (assignments) {
        this.#assignments = assignments;
    }
}
