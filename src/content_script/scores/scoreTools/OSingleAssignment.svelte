<script lang="ts">
  import {
    listOfGrades,
    gradeToPercent,
    convertPercentCutoffToGrade,
    listOfPercents,
    type GradePercentage,
    GradeManager,
  } from "../../../models/grades";

  export let finalPercent: number;

  type NumToStr<N extends number> = `${N}`;

  /**
   * Weight of new assignment compared to new final grade
   */
  let newWeights: string[] = ["20"];
  /**
   * Grade achieved on new assignment
   */
  let newGradePercents: GradePercentage[] = [90];

  let sumOfWeights = 20;

  $: newWeights = fixWeights(newWeights);

  function fixWeights(weights: string[]): string[] {
    let sum = 0;
    let ans = weights.map((weight) => {
      let val = Math.max(0, Math.min(100, Number(weight)));
      sum += val;
      return String(val);
    });
    sumOfWeights = sum;
    return ans;
  }

  $: newFinalPercent = calculateFinalPercent(newWeights, newGradePercents);

  function calculateFinalPercent(
    weight: typeof newWeights,
    gradePercent: typeof newGradePercents,
  ): number {
    if (sumOfWeights > 100) return -1;
    let percent = 0;
    for (let i = 0; i < weight.length; i++) {
      percent += (Number(weight[i]) / 100) * gradePercent[i];
    }
    percent += ((100 - sumOfWeights) / 100) * finalPercent;
    return percent;
  }

  function addNewAssignment() {
    newWeights = [...newWeights, "20"];
    newGradePercents = [...newGradePercents, 90];
  }

  function removeIndex(index: number) {
    if (newWeights.length == 1) return;
    newWeights = newWeights.filter((_, i) => i !== index);
    newGradePercents = newGradePercents.filter((_, i) => i !== index);
  }

  $: isCatWeightsValid = gradeManager.validWeights();
</script>

<div>
  <table class="!tw-w-auto zebra grid">
    <thead>
      <tr class="">
        <th class="!tw-text-center">Weight compared to category</th>
        <th class="tw-text-center">Grade</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each newWeights as newWeight, i}
        <tr>
          <td class="tw-text-center tw-align-middle">
            <div class="tw-inline-flex tw-flex-row">
              <input
                type="number"
                class="tw-rounded-l-md tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1 tw-w-12"
                max={100}
                min={0}
                bind:value={newWeights[i]}
              />
              <div
                class="tw-flex tw-justify-center tw-items-center tw-rounded-r-md tw-border-[#CCCCCC] tw-border-solid tw-border-r tw-border-y tw-border-l-0 tw-p-1"
              >
                <div>%</div>
              </div>
            </div>
          </td>
          <td class="tw-text-center tw-align-middle">
            <select
              class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
              bind:value={newGradePercents[i]}
            >
              {#each listOfGrades as grade}
                <option value={gradeToPercent[grade]}
                  >{grade} ({gradeToPercent[grade]}%)</option
                >
              {/each}
            </select>
          </td>
          <td class={`tw-text-center tw-align-middle`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class={`tw-w-6 tw-h-6 tw-align-middle tw-border tw-p-0.5 tw-border-solid tw-rounded-full ${
                newWeights.length == 1
                  ? "tw-border-slate-400 hover:tw-cursor-not-allowed tw-text-slate-400"
                  : "tw-border-black hover:tw-border-red-500 hover:tw-cursor-pointer hover:tw-text-red-500"
              }`}
              on:click={() => {
                removeIndex(i);
              }}
              on:keydown={() => {
                removeIndex(i);
              }}
              tabindex={newWeights.length == 1 ? null : 0}
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
  <button on:click={addNewAssignment}>Add new assignment</button>
  <div class="tw-mb-2">
    {#if sumOfWeights > 100}
      <span class="tw-text-red-500">
        The sum of the weights is greater than 100%.
      </span>
    {:else}
      Your grade is {convertPercentCutoffToGrade(newFinalPercent)} with a percentage
      of
      {newFinalPercent.toFixed(2)}%.
    {/if}
  </div>
</div>
