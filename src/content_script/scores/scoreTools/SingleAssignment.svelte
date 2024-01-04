<script lang="ts">
  import { get } from "svelte/store";
  import {
    listOfGrades,
    gradeToPercent,
    convertPercentCutoffToGrade,
    listOfPercents,
    type GradePercentage,
    GradeManager,
    Assignment,
    SpecialGrade,
    Category,
    gradeToPercentCutoff,
    type GradePercentageCutoff,
    gradeToPercentUpperCutoff,
    type Grade,
    convertLPercentToGrade,
    convertGPercentToGrade,
  } from "../../../models/grades";

  export let finalPercent: number;
  export let gradeManager: GradeManager;

  type NumToStr<N extends number> = `${N}`;

  let curCategoryId: number;

  let seeAssignment: Assignment | null = null;

  function addNewAssignment(category: Category = curCategory) {
    gradeManager.addAssignment(
      new Assignment("New Assignment", "A+", category, 100),
    );

    gradeManager = gradeManager;
  }

  function addNewCategory() {
    let newCat = new Category("New Category", 0);
    gradeManager.addCategory(newCat);
    addNewAssignment(newCat);
  }

  function removeIndexAss(index: number) {
    if (curAssignments.length == 1) return;
    if (seeAssignment == gradeManager.assignments[index]) {
      console.log("seeAssignment", seeAssignment);
      seeAssignment.see = false;
      seeAssignment = null;
    }
    gradeManager.assignments = gradeManager.assignments.filter(
      (_, i) => i !== index,
    );
  }

  function removeIndexCat(index: number) {
    if (gradeManager.categories.length == 1) return;
    if (seeAssignment?.category == gradeManager.categories[index]) {
      seeAssignment.see = false;
      seeAssignment = null;
    }
    let id: number = 0;
    gradeManager.categories = gradeManager.categories.filter((_, i) => {
      if (i == index) id = _.id;
      return i !== index;
    });
    if (id == curCategoryId) {
      curCategoryId = gradeManager.categories[0].id;
      curCategory = gradeManager.categories[0];
    }
  }

  function useAorAn(grade: Grade | SpecialGrade): string {
    if (typeof grade !== "string") return "a";
    return (grade as string).startsWith("A") || grade == "INC" || grade == "F"
      ? "an"
      : "a";
  }

  function calcHypoGrade(
    hGrade: GradePercentage,
    hWeight: number,
    percent: number,
    curCatId: number = curCategoryId,
    gradeManager: GradeManager,
  ) {
    let grade = 0;
    let curCategory: Category | null = gradeManager.getCategoryById(curCatId);
    let curCategoryId = curCatId;
    if (curCategory == null) {
      return {
        g: SpecialGrade.INVALID,
        p: 0,
      };
    }

    let curCategoryGrade: number = 0;
    let curCategoryWeightSum: number = 0;
    let otherGrade: number = 0;
    let otherWeightSum: number = 0;

    for (let category of gradeManager.categories) {
      let curGrade = gradeManager.calculateCategoryGradePercentage(category.id);
      if (curGrade == SpecialGrade.INVALID) {
        return {
          g: SpecialGrade.INVALID,
          p: 0,
        };
      } else if (curGrade == SpecialGrade.INC) {
        return {
          g: SpecialGrade.INC,
          p: 0,
        };
      }
      if (category.id == curCategoryId) {
        curCategoryGrade = curGrade;
        curCategoryWeightSum = gradeManager.sumOfWeightsInCategory(category);
        continue;
      }

      otherWeightSum += category.weight;
      otherGrade += curGrade * category.weight;
    }
    if (otherWeightSum != 0) otherGrade /= otherWeightSum;
    curCategoryGrade *= curCategoryWeightSum;

    grade =
      otherGrade * (otherWeightSum / gradeManager.totalWeight) +
      ((curCategoryGrade + hGrade * hWeight) /
        (hWeight + curCategoryWeightSum)) *
        (curCategory.weight / gradeManager.totalWeight);

    grade = Number(grade.toFixed(3));
    return {
      g: convertPercentCutoffToGrade(grade),
      p: grade,
    };
  }

  function onGradeChange(e: Event, i: number) {
    const target = e.target as HTMLSelectElement;
    if (target.value == "see") {
      if (gradeManager.getSeeAssignment()) {
        alert(
          "Only one assignment can be used to see all possibilities at a time.",
        );
        return;
      }
      gradeManager.assignments[i].percent = -2;
      gradeManager.assignments[i].see = true;
      seeAssignment = gradeManager.assignments[i];
      return;
    }
    if (gradeManager.assignments[i].see && target.value !== "see") {
      gradeManager.assignments[i].see = false;
      seeAssignment = null;
    }
    gradeManager.assignments[i].see = false;
    gradeManager.assignments[i].percent = Number(
      target.value,
    ) as GradePercentage;
  }

  function saveCategoryWeights() {
    let weights: Record<string, number> = {};
    for (let category of gradeManager.categories) {
      weights[category.name] = category.weight;
    }

    let key: string =
      "" +
      new URL(location.href).searchParams.get("frn") +
      new URL(location.href).searchParams.get("fg");
    chrome.storage.local.set({ ["weights" + key]: weights });
    chrome.storage.local.set({
      ["totalWeight" + key]: gradeManager.totalWeight,
    });
    alert("Saved weights.");
  }

  $: newFinalPercent = gradeManager.calculateGradePercentage();

  $: isCatWeightsValid = gradeManager.validWeights();

  $: curCategory = gradeManager.getCategoryById(curCategoryId)!;
  $: curAssignments = gradeManager.getAssignmentsByCategoryEntries(curCategory);

  $: curTableGrades = listOfGrades.map((grade) => {
    if (!seeAssignment) return null;
    return calcHypoGrade(
      gradeToPercent[grade],
      seeAssignment.weight,
      newFinalPercent,
      seeAssignment.category.id,
      gradeManager,
    );
  });
</script>

<div>
  {#if gradeManager.categories.length > 0}
    <!-- CATEGORY WEIGHTING -->
    <h2 class="!tw-mb-4">Category Weighting</h2>
    <table class="zebra grid !tw-w-auto tw-min-w-[18rem] !tw-mb-2">
      <thead>
        <tr>
          <th>Category</th>
          <th>Sum of Inner Weights</th>
          <th>Weight</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each gradeManager.categories as category, i}
          <tr>
            <td class="tw-align-middle"
              ><input
                type="text"
                class="tw-rounded-md tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                bind:value={gradeManager.categories[i].name}
              /></td
            >
            <td class="tw-align-middle">
              {Number(
                gradeManager.sumOfWeightsInCategory(category).toFixed(2),
              )}%
            </td>
            <td>
              <div class="tw-inline-flex tw-flex-row">
                <input
                  type="number"
                  class="tw-rounded-l-md tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1 tw-w-12"
                  max={100}
                  min={0}
                  bind:value={gradeManager.categories[i].weight}
                />
                <div
                  class="tw-flex tw-justify-center tw-items-center tw-rounded-r-md tw-border-[#CCCCCC] tw-border-solid tw-border-r tw-border-y tw-border-l-0 tw-p-1"
                >
                  <div>%</div>
                </div>
              </div>
            </td>
            <td class="tw-text-center tw-align-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class={`tw-w-6 tw-h-6 tw-align-middle tw-border tw-p-0.5 tw-border-solid tw-rounded-full ${
                  gradeManager.categories.length == 1
                    ? "tw-border-slate-400 hover:tw-cursor-not-allowed tw-text-slate-400"
                    : "tw-border-black hover:tw-border-red-500 hover:tw-cursor-pointer hover:tw-text-red-500"
                }`}
                on:click={() => {
                  removeIndexCat(i);
                }}
                on:keydown={(e) => {
                  if (e.code == "Enter") removeIndexCat(i);
                }}
                tabindex={gradeManager.categories.length == 1 ? null : 0}
                role="button"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button on:click={addNewCategory}>Add new category</button>
    <button on:click={saveCategoryWeights}>Save category weights</button>
    <p class="tw-text-md !tw-mb-2">
      Total weight (what the category weights should add up to, if year is
      incomplete)
    </p>
    <div class="tw-flex">
      <input
        type="number"
        class="tw-rounded-l-md tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1 tw-w-12"
        max={100}
        min={0}
        bind:value={gradeManager.totalWeight}
      />
      <div
        class="tw-flex tw-justify-center tw-items-center tw-rounded-r-md tw-border-[#CCCCCC] tw-border-solid tw-border-r tw-border-y tw-border-l-0 tw-p-1"
      >
        <div>%</div>
      </div>
    </div>

    <!-- ASSIGNMENT WEIGHTING WITHIN CATEGORY -->

    <h2 class="!tw-my-2">Assignment Weighting within Category</h2>
    <p class="!tw-mb-2 tw-text-md">
      Choose category:{" "}
      <select
        class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
        bind:value={curCategoryId}
      >
        {#each gradeManager.categories as category}
          <option value={category.id}>{category.name}</option>
        {/each}
      </select>
    </p>
    <p class="!tw-mb-2">
      Note: Assignment weights do not have to add up to 100%; they will be
      scaled automatically during calculation.
    </p>
    <p class="!tw-mb-2">
      Choose "See all possibilities" as a grade in one assignment to see the
      possible final grades you would recieve if you got each possible grade on
      that assignment.
    </p>
    <table class="!tw-w-auto zebra grid">
      <thead>
        <tr class="">
          <th class="!tw-text-center">Name</th>
          <th class="tw-text-center">Weight relative to each other</th>
          <th class="tw-text-center">Grade</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each curAssignments as [assignment, i]}
          <tr>
            <td class="tw-align-middle">
              <input
                type="text"
                class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                bind:value={gradeManager.assignments[i].name}
              />
            </td>
            <td class="tw-text-center tw-align-middle">
              <div class="tw-inline-flex tw-flex-row">
                <input
                  type="number"
                  class="tw-rounded-l-md tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1 tw-w-24"
                  max={100}
                  min={0}
                  bind:value={gradeManager.assignments[i].weight}
                />
                <div
                  class="tw-flex tw-justify-center tw-items-center tw-rounded-r-md tw-border-[#CCCCCC] tw-border-solid tw-border-r tw-border-y tw-border-l-0 tw-p-1"
                >
                  <div>%</div>
                </div>
              </div>
            </td>

            <td class="tw-text-center tw-align-middle">
              {#if !assignment.see}
                <select
                  class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                  on:change={(e) => {
                    onGradeChange(e, i);
                  }}
                >
                  {#each listOfGrades as grade}
                    <option
                      value={gradeToPercent[grade]}
                      selected={grade == assignment.grade}
                      >{grade}
                      {grade !== "INC"
                        ? `(${gradeToPercent[grade]}%)`
                        : ""}</option
                    >
                  {/each}

                  <option value="see" disabled={!!seeAssignment}
                    >See All Possibilities</option
                  >
                </select>
              {:else}
                <select
                  class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                  on:change={(e) => {
                    onGradeChange(e, i);
                  }}
                >
                  {#each listOfGrades as grade}
                    <option value={gradeToPercent[grade]}
                      >{grade}
                      {grade !== "INC"
                        ? `(${gradeToPercent[grade]}%)`
                        : ""}</option
                    >
                  {/each}

                  <option value="see" selected>See All Possibilities</option>
                </select>
              {/if}
            </td>
            <td class="tw-text-center tw-align-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class={`tw-w-6 tw-h-6 tw-align-middle tw-border tw-p-0.5 tw-border-solid tw-rounded-full ${
                  curAssignments.length == 1
                    ? "tw-border-slate-400 hover:tw-cursor-not-allowed tw-text-slate-400"
                    : "tw-border-black hover:tw-border-red-500 hover:tw-cursor-pointer hover:tw-text-red-500"
                }`}
                on:click={() => {
                  removeIndexAss(i);
                }}
                on:keydown={(e) => {
                  if (e.code == "Enter") removeIndexAss(i);
                }}
                tabindex={curAssignments.length == 1 ? null : 0}
                role="button"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button
      on:click={() => {
        addNewAssignment();
      }}>Add new assignment</button
    >

    {#if seeAssignment}
      <h2 class="!tw-mt-2">See All Possibilities</h2>
      {#if gradeManager.categories.reduce((prev, cur) => (prev += cur.weight), 0) <= 0 || gradeManager.totalWeight <= 0}
        <div>
          <span class="tw-text-red-500">
            The sum of the category weights must be greater than 0%.
          </span>
        </div>
      {:else if seeAssignment.weight <= 0}
        <div>
          <span class="tw-text-red-500"> Weight must be greater than 0%. </span>
        </div>
      {:else if newFinalPercent == SpecialGrade.INVALID}
        <div>
          <span class="tw-text-red-500">
            Fix weighting issues described below.
          </span>
        </div>
      {:else}
        <table class="!tw-w-auto zebra grid">
          <thead>
            <tr>
              <th>Grade on "{seeAssignment.name}"</th>
              <th>Final Grade</th>
              <th>Final Percent</th>
            </tr>
          </thead>
          <tbody>
            {#each listOfGrades as grade, i}
              {#if grade !== "INC" && curTableGrades[i] !== null}
                <tr>
                  <td>{grade}</td>
                  <td>
                    {curTableGrades[i]?.g}
                  </td>
                  <td>
                    {curTableGrades[i]?.p.toFixed(2)}%
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      {/if}
      <hr />
    {/if}

    <div class="tw-mb-2">
      {#if gradeManager.totalWeight <= 0 || gradeManager.totalWeight > 100}
        <span class="tw-text-red-500">
          The total weight must be between 1% and 100% inclusive.
        </span>
      {:else if !isCatWeightsValid}
        <span class="tw-text-red-500">
          The sum of the category weights is not {gradeManager.totalWeight}%
          (check total weight input above, currently at {gradeManager.categories.reduce(
            (sum, val) => sum + val.weight,
            0,
          )}% sum).
        </span>
      {:else}
        Your grade is {convertPercentCutoffToGrade(
          newFinalPercent,
        )}{newFinalPercent !== SpecialGrade.INC
          ? ` with a percentage of ${newFinalPercent.toFixed(2)}%`
          : ""}{seeAssignment
          ? " without the 'See all possibilities' assignment"
          : ""}.
      {/if}
    </div>
  {/if}
</div>
