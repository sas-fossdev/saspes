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

export default class Assignment {
    static statuses = {
        MISSING: 2,
    };

    #name;
    #grade;
    #order;
    #status;

    /**
     * Create new Assignment instance
     *
     * @param {String} name the name of the assignment
     * @param {String} [grade] grade of the assignment
     * @param {Number} [order] order of the assignment in the course
     * @param {Number[]} [status] current statuses of the assignment
     */
    constructor (name, grade, order, status) {
        this.#name = name;
        this.#grade = grade;
        this.#order = order;
        this.#status = status || [];
    }

    get name () {
        return this.#name;
    }

    get grade () {
        return this.#grade;
    }

    get order () {
        return this.#order;
    }

    set grade (g) {
        this.#grade = g;
    }

    /**
     * Add a status to the assignment
     * @param {Number} status
     */
    addStatus (status) {
        this.#status.push(status);
    }

    /**
     * Is assignment missing?
     * @returns {boolean}
     */
    isMissing () {
        return this.#status.includes(Assignment.statuses.MISSING);
    }
}
