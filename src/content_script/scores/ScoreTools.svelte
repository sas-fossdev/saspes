<script lang="ts">
  import type { GradeManager } from "../../models/grades";
  import { Tools } from ".";
  import SingleAssignment from "./scoreTools/SingleAssignment.svelte";

  let curTool: Tools = Tools.CATEGORY_WEIGHTING;
  export let finalPercent: Promise<number | null>;
  export let gradeManager: GradeManager;
</script>

{#await finalPercent then finalPercent}
  {#if finalPercent != null}
    <div
      id="score-tools"
      class="tw-p-5 tw-grid-cols-1 tw-grid tw-gap-2 tw-border tw-border-[#CCCCCC] tw-border-solid tw-rounded-md tw-mx-2.5"
    >
      <div>
        <h1 class="tw-pb-2 tw-text-2xl">Tools</h1>
        <select bind:value={curTool}>
          <option value={Tools.CATEGORY_WEIGHTING}
            >Category Weighting and Advanced See All Possibilities</option
          >
          <option value={Tools.NONE}>None</option>
        </select>
      </div>

      {#if curTool == Tools.CATEGORY_WEIGHTING}
        <SingleAssignment {finalPercent} {gradeManager} />
      {/if}
    </div>
  {/if}
{/await}
