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

import FinalPercent from "./FinalPercent.svelte";

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

console.log("rendering");
const target = document.createElement("div");
document
  .querySelector(".box-round")!
  .insertBefore(target, document.querySelector(".box-round > p"));
new FinalPercent({
  target: target as Element,
  props: { finalGrade: getFinalPercent() },
});
