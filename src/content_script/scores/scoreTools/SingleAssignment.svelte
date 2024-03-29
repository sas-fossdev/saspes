<script lang="ts">
  import { onMount } from "svelte";
  import {
    listOfGrades,
    gradeToPercent,
    convertPercentCutoffToGrade,
    type GradePercentage,
    GradeManager,
    Assignment,
    SpecialGrade,
    Category,
    type Grade,
  } from "../../../models/grades";

  import Shepherd from "shepherd.js";

  export let finalPercent: number;
  export let gradeManager: GradeManager;

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

  let showSumOfInnerWeights: boolean = false;

  onMount(async () => {
    showSumOfInnerWeights =
      (await chrome.storage.local.get("showSumOfInnerWeights"))
        ?.showSumOfInnerWeights ?? false;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes:
          "tw-border tw-rounded-md tw-border-[#CCCCCC] tw-border-solid tw-p-2 tw-bg-[#FFFFFFF0] tw-max-w-[48rem]",
        scrollTo: true,
        scrollToHandler: (el) => {
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY - 100,
            behavior: "smooth",
          });
        },
        buttons: [
          {
            text: "Back",
            action: () => {
              tour.back();
            },
          },
          {
            text: "Next",
            action: () => {
              tour.next();
            },
          },
          {
            text: "Cancel",
            action: () => {
              tour.complete();
            },
          },
        ],
        highlightClass: "current-step",
      },
      keyboardNavigation: false,
    });

    tour.addSteps([
      {
        id: "tour-1",
        text: "Welcome to the category weighting tool! This tool automatically adds all your assignments and their categories to the table below. Then, you can add your category weightings to calculate your exact final percent. However, it is more useful for its ability to add new categories and assignments, as well as the ability to change grades and the see all possiblities feature, which will be shown later. <br/>This tour will help you get acquainted with the tool. It is <b>highly recommended</b> for new users.",
        attachTo: {
          element: "#catw",
          on: "top-start",
        },
        classes: "tw-mt-2",
        buttons: [
          {
            text: "Next",
            action: tour.next,
          },
          {
            text: "Cancel",
            action: tour.complete,
          },
        ],
      },
      {
        id: "tour-2",
        text: "This is the category weighting table. You can change the names of the categories (for better organization) and the weights of the categories here.<br/><br/>Categories can be class units (e.g. Unit 2), or different types of assignments (e.g. Summative) depending on how your teacher inputs formats it. Your category names can be found in PowerSchool as well as your syllabus, which will have more information.",
        attachTo: {
          element: "#cattable",
          on: "right",
        },
        classes: "tw-w-96 tw-ml-2",
      },
      {
        id: "tour-69",
        text: "This is the number that the all the category weights must add up to. This exists because in the middle of the term, most of your grades will not be in PowerSchool yet, so some of the categories (e.g. future units) will not appear. So, you take the sum of the weights of the existing categories and put it here. This exists to help you make sure that your weights have been inputted correctly. It must be between 1 and 100% inclusive. <br/><br/>Enter in your total weight before continuing. Consult your syllabus in schoology to do this.",
        attachTo: {
          element: "#totweight",
          on: "top-start",
        },
        classes: "tw-w-96 tw-mt-2",
        buttons: [
          {
            text: "Back",
            action: tour.back,
          },
          {
            text: "Next",
            action: () => {
              if (
                gradeManager.totalWeight > 0 &&
                gradeManager.totalWeight <= 100
              ) {
                tour.next();
              } else {
                alert(
                  "Please enter a total weight between 1 and 100% inclusive.",
                );
              }
            },
          },
          {
            text: "Cancel",
            action: tour.complete,
          },
        ],
      },
      {
        id: "tour-3",
        text: "You usually find your category weights from your class syllabus, which can be found in schoology.<br/><br/>Enter in all your category weights before continuing.",
        attachTo: {
          element: ".firstCat",
          on: "right",
        },
        classes: "tw-ml-2 tw-w-96",
        buttons: [
          {
            text: "Back",
            action: tour.back,
          },
          {
            text: "Next",
            action: () => {
              if (isCatWeightsValid) {
                tour.next();
              } else {
                alert(
                  "Please enter your VALID category weights. Remember that they must add up to the total weight you entered before.",
                );
              }
            },
          },
          {
            text: "Cancel",
            action: tour.complete,
          },
        ],
      },
      {
        id: "tour-4",
        text: "You can click this to delete the category in the row. This will only work if there is more than one category.",
        attachTo: {
          element: ".firstCatDel",
          on: "right",
        },
        classes: "tw-ml-2 tw-w-96",
      },
      {
        id: "tour-5",
        text: "Click this to save your category weights and your total weight. When you reload, the weights you inputted before clicking the save button will reappear, so you don't have to type them in again.",
        attachTo: {
          element: "#saveWeights",
          on: "bottom",
        },
        classes: "tw-mt-2 tw-w-96",
      },
      {
        id: "tour-6",
        text: "You can click this to add a new category. This will also automatically add a new assignment to the new category.",
        attachTo: {
          element: "#addCat",
          on: "bottom",
        },
        classes: "tw-mt-2 tw-w-96",
      },
      {
        id: "tour-7",
        text: "Use this dropdown menu to choose which category's assignments you want to edit. The table below will show all the assignments in that category. The row of the category you selected in the category table will be highlighted yellow.",
        attachTo: {
          element: "#chooseCat",
          on: "top-start",
        },
        classes: "tw-mt-2 tw-w-96",
      },
      {
        id: "tour-8",
        text: "<b>Assignment weights are relative to each other, and they are not percentages.</b> If two assignments have the same weight number, they will be weighted equally.<br/><br/>If one assignment has a weight of 10 and another has a weight of 20, the second assignment will be weighted twice as much as the first assignment. This is to prevent decimals. However, if you enter weights as adding up to 100, they would still work. <br/><br/>It is not recommended to change the weights of existing assignments as the assignment weights are automatically gotten from PowerSchool, so even if the teacher inputted them wrong, they are the same weights used by PowerSchool to calculate your official final percent/grade. ",
        attachTo: {
          element: ".firstAss",
          on: "right",
        },
        classes: "tw-ml-2 tw-w-96",
      },
      {
        id: "tour-10",
        text: "This dropdown menu lets you change the grade of the assignment. A+ is equal to a 90%, but the cutoff for a final grade of A+ is 85%. For each successive grade, the cutoff and value decreases by 10%. The numbers for cutoff can be found by hovering on the questions mark beside your Official Final Percent at the top of the page, and the numbers for grade value can be found in this dropdown.",
        attachTo: {
          element: ".firstGradeAss",
          on: "right",
        },
        classes: "tw-ml-2 tw-w-96",
      },
      {
        id: "tour-11",
        text: "You can click this button to add a new assignment in the currently selected category.",
        attachTo: {
          element: "#addAss",
          on: "right",
        },
        classes: "tw-ml-2 tw-w-96",
      },
      {
        id: "tour-12",
        text: "Your final grade and percent with all of the given weights and grades can be found here.",
        attachTo: {
          element: "#finalGrade",
          on: "bottom-start",
        },
        classes: "tw-mt-2 tw-w-96",
      },
      {
        id: "tour-13",
        text: "You can also select 'See All Possibilities' from this dropdown. It will show you every single possible final grade and percent you can get with that assignment. This is useful for seeing how much an assignment will affect your grade and finding the minimum grade you need to achieve a certain target final grade. You can only have one assignment with 'See All Possibilities' selected. <br/><br/>Click on the dropdown and select 'See All Possibilities' on any assignment before continuing.",
        attachTo: {
          element: ".firstGradeAss",
          on: "right",
        },
        classes: "tw-ml-2 tw-w-96",
        buttons: [
          {
            text: "Back",
            action: tour.back,
          },
          {
            text: "Next",
            action: () => {
              if (seeAssignment) {
                tour.next();
              } else {
                alert(
                  "Please select 'See All Possibilities' on an assignment before continuing.",
                );
              }
            },
          },
          {
            text: "Cancel",
            action: tour.complete,
          },
        ],
      },

      {
        id: "tour-14",
        text: "This table will show all the possibilities of your final grade and percent if you got each possible grade on the assignment you selected. If there are red errors, fix them before continuing.",
        attachTo: {
          element: "#seeAssignment",
          on: "top-start",
        },
        classes: "tw-mb-2 tw-w-96",
      },
      {
        id: "tour-end",
        text: "Congrats, you made it to the end of the tour! You can always restart the tour by clicking the 'Help' button at the top of the page.",
        classes: "tw-w-96",
        buttons: [
          {
            text: "Finish",
            action: tour.complete,
          },
          {
            text: "Back",
            action: tour.back,
          },
        ],
      },
    ] as Shepherd.Step.StepOptions[]);

    document.getElementById("helpBtn")!.addEventListener("click", () => {
      tour.cancel();
      tour.start();
    });

    let doneTour = (
      (await chrome.storage.local.get("doneTour")) as { doneTour: boolean }
    ).doneTour;

    tour.on("complete", () => {
      chrome.storage.local.set({ doneTour: true });
    });

    if (!doneTour) {
      tour.cancel();
      tour.start();
    }
  });
</script>

<div>
  {#if gradeManager.categories.length > 0}
    <!-- CATEGORY WEIGHTING -->
    <button id="helpBtn" class="">Help</button>
    <h2 class="!tw-mb-2" id="catw">Category Weighting</h2>
    <table
      class="zebra grid !tw-w-auto tw-min-w-[18rem] !tw-mb-2"
      id="cattable"
    >
      <thead>
        <tr>
          <th>Category</th>
          {#if showSumOfInnerWeights}<th>Sum of Inner Weights</th>{/if}
          <th>Weight</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each gradeManager.categories as category, i}
          <tr class:tw-bg-yellow-200={category == curCategory}>
            <td
              class="tw-align-middle"
              class:!tw-bg-inherit={category == curCategory}
              ><input
                type="text"
                class:!tw-bg-inherit={category == curCategory}
                class="tw-rounded-md tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                bind:value={gradeManager.categories[i].name}
              /></td
            >
            {#if showSumOfInnerWeights}
              <td
                class="tw-align-middle"
                class:!tw-bg-inherit={category == curCategory}
              >
                {Number(
                  gradeManager.sumOfWeightsInCategory(category).toFixed(2),
                )}
              </td>
            {/if}
            <td class:!tw-bg-inherit={category == curCategory}>
              <div class="tw-inline-flex tw-flex-row" class:firstCat={i == 0}>
                <input
                  type="number"
                  class="tw-rounded-l-md tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1 tw-w-12"
                  max={100}
                  min={0}
                  class:!tw-bg-inherit={category == curCategory}
                  bind:value={gradeManager.categories[i].weight}
                />
                <div
                  class="tw-flex tw-justify-center tw-items-center tw-rounded-r-md tw-border-[#CCCCCC] tw-border-solid tw-border-r tw-border-y tw-border-l-0 tw-p-1"
                >
                  <div>%</div>
                </div>
              </div>
            </td>
            <td
              class="tw-text-center tw-align-middle"
              class:!tw-bg-inherit={category == curCategory}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class:firstCatDel={i == 0}
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
    <div class="tw-mb-2">
      <button on:click={addNewCategory} id="addCat">Add new category</button>
      <button on:click={saveCategoryWeights} id="saveWeights"
        >Save category weights</button
      >
    </div>
    <div id="totweight" class="tw-mb-4">
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
    </div>
    <!-- ASSIGNMENT WEIGHTING WITHIN CATEGORY -->

    <h2 class="!tw-my-2">Assignment Weighting within Category</h2>
    <p class="!tw-mb-2 tw-text-lg" id="chooseCat">
      Choose category:{" "}
      <select
        class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1 tw-bg-yellow-200"
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
          <th class="tw-text-center">Relative weight</th>
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
                  class:firstAss={i == 0}
                  type="number"
                  class="tw-rounded-md tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1 tw-w-24"
                  max={100}
                  min={0}
                  bind:value={gradeManager.assignments[i].weight}
                />
              </div>
            </td>

            <td class="tw-text-center tw-align-middle">
              <select
                class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                class:firstGradeAss={i == 0}
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

                <option
                  value="see"
                  disabled={!!seeAssignment && seeAssignment !== assignment}
                  selected={seeAssignment == assignment}
                  >See All Possibilities</option
                >
              </select>
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
      }}
      id="addAss"
      class="tw-mb-4">Add new assignment</button
    >

    {#if seeAssignment}
      <h2 class="!tw-mt-2">See All Possibilities</h2>
      <div id="seeAssignment" class="tw-inline-block">
        {#if gradeManager.categories.reduce((prev, cur) => (prev += cur.weight), 0) <= 0 || gradeManager.totalWeight <= 0}
          <div>
            <span class="tw-text-red-500">
              The sum of the category weights must be greater than 0%.
            </span>
          </div>
        {:else if seeAssignment.weight <= 0}
          <div>
            <span class="tw-text-red-500">
              Weight on "{seeAssignment.name}" must be greater than 0.
            </span>
          </div>
        {:else if newFinalPercent == SpecialGrade.INVALID}
          <div>
            <span class="tw-text-red-500">
              Fix weighting issues described below.
            </span>
          </div>
        {:else}
          <table class="!tw-w-auto zebra grid !tw-m-0">
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
      </div>
      <hr />
    {/if}

    <div class="tw-mb-2 tw-text-lg" id="finalGrade">
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
        Your grade is {useAorAn(convertPercentCutoffToGrade(newFinalPercent))}
        {convertPercentCutoffToGrade(newFinalPercent)}{newFinalPercent !==
        SpecialGrade.INC
          ? ` with a percentage of ${newFinalPercent.toFixed(2)}%`
          : ""}{seeAssignment
          ? " without the 'See all possibilities' assignment"
          : ""}.
      {/if}
    </div>
  {/if}
</div>

<style>
  *:target {
    scroll-margin-top: 100px;
  }
</style>
