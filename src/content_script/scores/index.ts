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

import { Assignment, Category, GradeManager, listOfGrades, type Grade, gradeToPercent } from "../../models/grades";
import FinalPercent from "./FinalPercent.svelte";
import ScoreTools from "./ScoreTools.svelte";
import { getFinalPercent } from "./scoresUtilities";
import browser from "webextension-polyfill";

export enum Tools {
  CATEGORY_WEIGHTING = "CATEGORY_WEIGHTING",
  NONE = "NONE"
}

const url = new URL(window.location.href);

let finalPercent = getFinalPercent(
  url.searchParams.get(
    "frn",
  )!,
  url.searchParams.get("fg")!
);

async function getFinalGrade(): Promise<string> {
  await waitForElm("div.box-round > table > tbody > tr > td:nth-child(4)");
  return document.querySelector("div.box-round > table > tbody > tr > td:nth-child(4)")?.textContent?.trim()!;
}

let finalGrade = getFinalGrade();

function waitForElm(selector: string): Promise<Element | null> {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

console.log(document.getElementById("pes-fp"));
if (document.getElementById("pes-fp") || document.getElementById("pes-st")) {
  document.getElementById("pes-fp")?.remove();
  document.getElementById("pes-st")?.remove();
}
console.log(document.getElementById("pes-fp"));
let gradeManagerO = new GradeManager([], [], 100);

const doScoreTools = async () => {
  await waitForElm("#scoreTable");
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
        if (gradeEle.textContent.trim() == "INC" && await finalGrade == "INC") {
          grade = "INC_NO_CLASS_CREDIT";
        } else if (gradeEle.textContent.trim() == "INC") {
          grade = "INC_NO_CREDIT";
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

      let weighting = 9;
      if (scoreEle.classList.contains("hasWeight") && scoreEle.title) {

        weighting = Number(scoreEle.textContent?.trim().match(/\([^\/]+\/([^\)]+)\)/)![1]);
      } else if (scoreEle.textContent) {
        weighting = Number(scoreEle.textContent?.trim().split("/")[1]);
      }

      let assignment = new Assignment(assignmentEle.textContent.trim(), grade, category, weighting);
      gradeManager.addAssignment(assignment);
    }
  }

  const key = "" + new URL(location.href).searchParams.get(
    "frn",
  ) + new URL(location.href).searchParams.get(
    "fg",
  );

  const saved = await browser.storage.local.get("weights" + key);

  saved.weights = saved["weights" + key] || {};

  for (let category of gradeManager.categories) {
    if (saved.weights[category.name]) {
      category.weight = Number(saved.weights[category.name]);
    }
  }

  let totalWeight = await browser.storage.local.get("totalWeight" + key);
  totalWeight = totalWeight["totalWeight" + key] || 0;
  if (Number(totalWeight) > 0) {
    gradeManager.totalWeight = Number(totalWeight);
  }

  console.log(gradeManager);
  gradeManagerO = gradeManager;
  new ScoreTools({
    target: target as Element,
    props: { finalPercent, gradeManager: gradeManagerO }
  })
}

doScoreTools();


let target = document.createElement("div");
document
  .querySelector(".box-round")!
  .insertBefore(target, document.querySelector(".box-round > p"));



new FinalPercent({
  target: target as Element,
  props: { finalPercent },
});

target = document.createElement("div");
document.querySelector(".box-round")?.insertBefore(target, document.querySelector(".box-round > h2"))
