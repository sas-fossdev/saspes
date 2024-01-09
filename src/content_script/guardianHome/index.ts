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

import { Class, ClassManager } from "../../models/classes";
import GPA from "./GPA.svelte";
import { listOfGrades, type Grade } from "../../models/grades";
import { getFinalPercent } from "../scores/scoresUtilities";

const classManager = new ClassManager([]);

const rows = document.querySelectorAll(".linkDescList.grid > tbody > tr.center:not(.th2)");



for (const row of rows) {
  const nameEle = row.querySelector("td:nth-child(2)");
  const s1GradeEle = row.querySelector("td:nth-child(3) > a") as HTMLAnchorElement;
  const s2GradeEle = row.querySelector("td:nth-child(4) > a");



  if (!nameEle || !s1GradeEle || !s2GradeEle) continue;

  const name = nameEle.firstChild?.textContent?.trim();
  if (!name) continue;

  let s1Grade: string | null = s1GradeEle.textContent?.trim()!;
  if (!s1Grade) continue;
  if (!listOfGrades.includes(s1Grade as Grade)) s1Grade = null;

  let s2Grade: string | null = s2GradeEle.textContent?.trim()!;
  if (!s2Grade) continue;
  if (!listOfGrades.includes(s2Grade as Grade)) s2Grade = null;

  if (!s1Grade && !s2Grade) continue;

  if (s1Grade !== null && s1Grade !== "INC" && s1GradeEle.href !== null) {
    const url = new URL(s1GradeEle.href);
    let finalPercent = getFinalPercent(
      url.searchParams.get(
        "frn",
      )!,
      url.searchParams.get("fg")!
    );

    finalPercent.then((f) => {
      console.log(f, "F");
      if (f !== null)
        s1GradeEle.innerHTML += ` (${f.toFixed(2)})`;
    })
  }

  classManager.addClass(new Class(name, { s1: s1Grade as Grade | null, s2: s2Grade as Grade | null }))
}


console.log(classManager);
const target = document.createElement("div");
document
  .querySelector("#content-main > .box-round")
  ?.insertBefore(target, document.querySelector("#quickLookup"));

new GPA({ target: target as Element, props: { classManager: classManager } });
