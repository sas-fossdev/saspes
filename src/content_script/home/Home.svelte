<script lang="ts">
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

  import { onMount } from "svelte";
  import { browserAction } from "webextension-polyfill";
  import browser from "webextension-polyfill";

  let board: string | null = null;

  onMount(() => {
    document.getElementById("container")!.style.paddingBottom = "20px";
    document.getElementById("branding-district")!.remove();
    try {
      fetch("https://anvaymathur.com/saspes/board.txt", { mode: "cors" })
        .then((e) => e.text())
        .then((e) => (board = e));
    } catch {
      board = "Error while fetching board.";
    }
  });
</script>

<div class="tw-px-8 tw-py-8 tw-mt-6" id="pes-box">
  <h1
    class="tw-font-bold tw-text-2xl tw-pb-2 tw-m-0 tw-flex tw-flex-row tw-gap-2"
  >
    <img
      src={browser.runtime.getURL("/public/icon.png")}
      class="tw-w-8 tw-h-8"
      alt="SAS PES icon"
    />
    SAS PowerSchool Enhancement Suite
  </h1>
  <!-- svelte-ignore missing-declaration -->
  <p class="tw-font-medium tw-text-lg">v{SAS_PES_VERSION}</p>
  <p><strong>Do not rely</strong> on the data provided by SAS PES.</p>
  {#if board}
    <!-- this is for a message board type of thing, where messages can be displayed without updating the extension everytime. This does NOT load javascript. -->
    <h3 class="tw-font-medium tw-text-lg">
      Message Board ({board.split("æ")[0]}):
    </h3>
    <p class="tw-text-sm">{@html board.split("æ")[1]}</p>
  {/if}
</div>

<style>
  #pes-box {
    background-color: #fff;
    -moz-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
    -webkit-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
    position: relative;
  }
</style>
