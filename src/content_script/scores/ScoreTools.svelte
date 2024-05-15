<script lang="ts">
  import type { GradeManager } from "../../models/grades";
  import { Tools } from ".";
  import SingleAssignment from "./scoreTools/SingleAssignment.svelte";

  let curTool: Tools = Tools.CATEGORY_WEIGHTING;
  export let finalPercent: Promise<number | null>;
  export let gradeManager: GradeManager;
</script>

<div id="pes-st">
  {#await finalPercent then finalPercent}
    {#if finalPercent != null}
      <div
        id="score-tools"
        class="tw-p-5 tw-grid-cols-1 tw-grid tw-gap-2 tw-border tw-border-[#CCCCCC] tw-border-solid tw-rounded-md tw-mx-2.5"
      >
        <div>
          <h1 class="tw-pb-2 tw-text-2xl">Tools</h1>
          <select
            bind:value={curTool}
            class="tw-rounded-md tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
          >
            <option value={Tools.CATEGORY_WEIGHTING}
              >Category Weighting and Advanced See All Possibilities</option
            >
            <option value={Tools.NONE}>None</option>
          </select>
        </div>

        {#if curTool == Tools.CATEGORY_WEIGHTING}
          <SingleAssignment {finalPercent} {gradeManager} />
        {/if}
        <p>
          <span class="tw-font-bold"
            >Do not rely on any data from SAS PES!!</span
          >
          Teachers can override your final grade, and calculations are not entirely
          accurate.
        </p>
      </div>
    {/if}
  {/await}
</div>
