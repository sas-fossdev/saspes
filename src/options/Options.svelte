<script lang="ts">
  import { onMount } from "svelte";

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

  let showSumOfInnerWeights: boolean = false;

  onMount(async () => {
    showSumOfInnerWeights =
      (await chrome.storage.local.get("showSumOfInnerWeights"))
        ?.showSumOfInnerWeights ?? false;
  });

  async function saveChanges() {
    await chrome.storage.local.set({
      showSumOfInnerWeights,
    });
    alert("Saved.");
  }
</script>

<div class="tw-px-8 tw-py-4">
  <h1 class="tw-font-bold tw-text-2xl !tw-mt-0 !tw-mb-2">SAS PES Options</h1>
  <p>Reload PowerSchool after saving to see the changes.</p>

  <label class="tw-flex tw-items-center tw-gap-2 tw-mb-3">
    <input
      type="checkbox"
      class="!tw-m-0"
      bind:checked={showSumOfInnerWeights}
    />
    Show sum of inner weights column in category weighting table (for advanced users)
  </label>
  <button on:click={saveChanges}>Save Changes</button>

  <!-- svelte-ignore missing-declaration -->
  <p>v{SAS_PES_VERSION}</p>
</div>

<style>
  button {
    background-color: #0066a5;
    background-position: left bottom;
    background-repeat: repeat-x;
    border: 0 none;
    border-radius: 4px;
    color: #ffffff;
    white-space: nowrap;
    position: relative;
    cursor: pointer;
    padding: 0.2em 0.4em;
    font-size: 100%;
    line-height: 1.2em;
  }

  button:hover {
    background-color: #00427c;
    color: #ffffff;
  }

  button:focus {
    outline-color: #11aaeb;
    outline-width: 1px;
    outline-style: solid;
  }
</style>
