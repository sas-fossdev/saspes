<script lang="ts">
  import { gradeToPercent, listOfGrades } from "../..//models/grades";
  import type { ClassManager } from "../../models/classes";

  export let classManager: ClassManager;

  $: sem1GPA = classManager.calculateGPA(1);
  $: sem2GPA = classManager.calculateGPA(2);

  let editGrades = false;
  let hideGPA = true;

  import Ty from "./TY.svelte";
</script>

<div id="pes-gpa">
  <label class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
    <input type="checkbox" class="!tw-m-0" bind:checked={hideGPA} />
    Hide GPA
  </label>

  {#if !hideGPA}
    <p class="tw-font-bold">Do not rely on any data from SAS PES!!</p>
    {#if sem1GPA && sem1GPA !== -1}
      <p>First Semester GPA: {classManager.calculateGPA(1).toFixed(2)}</p>
    {:else}
      <p>First Semester GPA: N/A</p>
    {/if}

    {#if sem2GPA && sem2GPA !== -1}
      <p>Second Semester GPA: {classManager.calculateGPA(2).toFixed(2)}</p>
    {:else}
      <p>Second Semester GPA: N/A</p>
    {/if}

    <label class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
      <input type="checkbox" class="!tw-m-0" bind:checked={editGrades} />
      Edit grades for GPA calculation
    </label>

    {#if editGrades}
      <p class="tw-mb-2">
        Note: Semester classes count as 1 credit for GPA calculation.
      </p>
      <table class="!tw-w-auto grid zebra tw-mb-4">
        <thead>
          <th> Class </th>
          <th> S1 Grade </th>
          <th> S2 Grade </th>
          <th> Credits </th>
          <th> AP/AT </th>
        </thead>
        <tbody>
          {#each classManager.classes as c, i}
            <tr>
              <td> {c.name} </td>
              <td>
                <select
                  class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                  bind:value={classManager.classes[i].grade.s1}
                >
                  {#each listOfGrades as grade}
                    <option value={grade}
                      >{grade}
                      {grade !== "INC" ? `(${gradeToPercent[grade]}%)` : ""}
                    </option>
                  {/each}
                </select>
              </td>
              <td>
                <select
                  class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                  bind:value={classManager.classes[i].grade.s2}
                >
                  {#each listOfGrades as grade}
                    <option value={grade}
                      >{grade}
                      {grade !== "INC" ? `(${gradeToPercent[grade]}%)` : ""}
                    </option>
                  {/each}
                  <option value={null}>No grade</option>
                </select>
              </td>
              <td>
                <select
                  class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                  bind:value={classManager.classes[i].credits}
                >
                  <option value={0}>0</option>
                  <option value={0.5}>0.5</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </td>
              <td class="tw-align-middle tw-text-center">
                <input
                  type="checkbox"
                  class="!tw-m-0"
                  bind:checked={classManager.classes[i].isBoosted}
                />
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {/if}
</div>
