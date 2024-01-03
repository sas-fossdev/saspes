/**
 *
 * @copyright Copyright (c) 2023 Anvay Mathur <contact@anvaymathur.com>
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

import { Assignment, Category, GradeManager, listOfGrades, type Grade, gradeToPercent } from "../../models/grades";
import FinalPercent from "./FinalPercent.svelte";
import ScoreTools from "./ScoreTools.svelte";

export enum Tools {
  CATEGORY_WEIGHTING = "CATEGORY_WEIGHTING",
}

async function getFinalPercent(): Promise<number | null> {
  let finalGrade: number | null = null;
  const url = new URL(window.location.href);
  let text: string | null = null;
  try {
    text = await fetch(
      `https://powerschool.sas.edu.sg/guardian/scores_ms_guardian.html?frn=${url.searchParams.get(
        "frn",
      )}&fg=${url.searchParams.get("fg")}`,
    ).then((res) => res.text());
  } catch (e) {
    console.error(e);
    return null;
  }
  console.log("Done fetching");

  if (text) {
    let match = text.match(/\[decode;[^;]*;[^;]*;([^;]*);/);
    if (match?.[1] && !isNaN(parseFloat(match[1]))) {
      finalGrade = parseFloat(match[1]);
      return finalGrade;
    }
  }
  return null;
}

let gradeManagerO = new GradeManager([], [], 100);

setTimeout(() => {
  const gradeManager = new GradeManager([], [], 100);
  const rowEles = document.querySelectorAll("tr.ng-scope");

  for (let i = 0; i < rowEles.length; i++) {
    let rowEle = rowEles[i];
    if (rowEle.querySelector("td.codeCol > div.tt-exempt") != null || rowEle.querySelector("td.codeCol > div.tt-excluded") != null) {
      console.log(rowEle); continue;
    };

    let gradeEle = rowEle.querySelector("td.ng-binding.ng-scope");
    let categoryEle = rowEle.querySelector("td.categorycol");
    let assignmentEle = rowEle.querySelector("td.assignmentcol");
    let scoreEle = rowEle.querySelector("td.score") as HTMLTableCellElement;
    if (gradeEle && categoryEle && assignmentEle && gradeEle.textContent && categoryEle.textContent && assignmentEle.textContent && scoreEle) {
      let validGrade = false;
      let grade: Grade = "A+";
      for (let i = 0; i < listOfGrades.length; i++) {
        if (listOfGrades[i] == gradeEle.textContent.trim()) {
          validGrade = true;
          grade = listOfGrades[i];
        }
      }
      if (!validGrade) {
        console.log(rowEle); continue;
      }
      let category = gradeManager.getCategoryByName(categoryEle.textContent.trim());
      if (!category) {
        category = new Category(categoryEle.textContent.trim(), 0);
        gradeManager.addCategory(category);
      }

      let weighting = 100;
      if (scoreEle.classList.contains("hasWeight") && scoreEle.title) {
        weighting = Number(scoreEle.title.match(/x ([^ ]*)\. /)![1]) * 100;
      }

      let assignment = new Assignment(assignmentEle.textContent.trim(), grade, category, weighting);
      gradeManager.addAssignment(assignment);
    }
  }

  // for (let category of gradeManager.categories) {
  //   let assignments = gradeManager.getAssignmentsByCategory(category);

  //   const sumOfWeights = assignments.reduce((total, assignment) => total + assignment.weight, 0);
  //   for (let i = 0; i < assignments.length; i++) {
  //     assignments[i].weight = (assignments[i].weight / sumOfWeights) * 100;
  //   }
  // }

  console.log(gradeManager);
  gradeManagerO = gradeManager;
  new ScoreTools({
    target: target as Element,
    props: { finalPercent, gradeManager: gradeManagerO }
  })
}, 750);


console.log("rendering");
let target = document.createElement("div");
document
  .querySelector(".box-round")!
  .insertBefore(target, document.querySelector(".box-round > p"));

let finalPercent = getFinalPercent();

new FinalPercent({
  target: target as Element,
  props: { finalPercent },
});

target = document.createElement("div");
document.querySelector(".box-round")?.insertBefore(target, document.querySelector(".box-round > h2"))
