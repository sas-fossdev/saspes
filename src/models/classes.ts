/**
 *
 * @copyright Copyright (c) 2023-2024 Anvay Mathur <contact@anvaymathur.com>
 *
 * @author Anvay Mathur <contact@anvaymathur.com>
 *
 * @license GNU AGPL-3.0-only
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

import type { Grade } from "./grades";

export const gradeToGPA = {
  "A+": 4.5,
  A: 4,
  "B+": 3.5,
  B: 3,
  "C+": 2.5,
  C: 2,
  "D+": 1.5,
  D: 1,
  F: 0,
  INC: 0,
} as const;

export class ClassManager {
  public classes: Class[];

  constructor(classes: Class[]) {
    this.classes = classes;
  }

  public getTotalCredits(semester: 1 | 2): number {
    return this.classes.reduce((acc, cur) => {
      if (cur.grade[`s${semester}`] !== null && cur.grade[`s${semester}`] !== "INC") return acc + cur.credits;
      return acc;
    }, 0);
  }

  public calculateGPA(semester: 1 | 2): number {
    let gpa = 0;
    let totalCredits = this.getTotalCredits(semester);
    if (totalCredits === 0) return -1;
    for (const c of this.classes) {
      if (c.grade[`s${semester}`] === "INC") {
        continue;
      }
      if (c.grade[`s${semester}`] !== null) gpa += (gradeToGPA[c.grade[`s${semester}`]!] + (c.isBoosted ? 0.5 : 0)) * c.credits;
    }
    return gpa / totalCredits;
  }

  public addClass(c: Class) {
    this.classes.push(c);
  }
}

export class Class {
  public id: number;
  public name: string;
  public static nextId: number = 1;
  public credits: number;
  public grade: {
    s1: Grade | null,
    s2: Grade | null
  };
  public isBoosted: boolean;

  constructor(name: string, grade: { s1: Grade | null, s2: Grade | null }) {
    this.id = Class.nextId++;
    this.name = name;
    this.grade = grade;
    this.isBoosted = name.includes("AP ") || name.includes("AT ");

    if (name.includes("English 10/American History") || name.includes("English 9/World History")) {
      this.credits = 2;
    } else if (/^(I Service: |IS: )/.test(name)) {
      this.credits = 0.5;
    } else {
      this.credits = 1;
    }
  }
}