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
  export let finalPercent: Promise<number | null>;
</script>

{#await finalPercent}
  <div class="tw-mb-2.5 tw-mx-2.5">
    <strong>Official Final Percent:</strong> Loading...
  </div>
  <div class="comment">
    <pre>&nbsp;</pre>
  </div>
{:then grade}
  {#if grade != null}
    <div class="tw-mx-2.5">
      <strong>Official Final Percent:</strong>
      {grade.toFixed(2)}%
      <div class="tw-group tw-relative tw-inline-block">
        <button class="tw-ml-0">?</button>
        <div
          class="tw-pointer-events-none tw-grid tw-text-center tw-grid-cols-2 tw-gap-1 tw-absolute tw-bg-slate-900 tw-p-1.5 tw-rounded-md tw-text-white tw-left-0 tw-w-max tw-opacity-0 tw-transition-opacity group-hover:tw-opacity-100"
        >
          <div>&ge;85%: A+</div>
          <div>&ge;75%: A</div>
          <div>&ge;65%: B+</div>
          <div>&ge;55%: B</div>
          <div>&ge;45%: C+</div>
          <div>&ge;35%: C</div>
          <div>&ge;25%: D+</div>
          <div>&ge;15%: D</div>
        </div>
      </div>
    </div>
    <div class="comment">
      <pre>&nbsp;</pre>
    </div>
  {/if}
{/await}
