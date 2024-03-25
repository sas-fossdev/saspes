<script lang="ts">
  let wd: number;
</script>

<div
  class="tw-group tw-relative tw-inline-block tw-font-normal tw-pl-2"
  bind:clientWidth={wd}
>
  <button class="tw-ml-0">?</button>
  <div
    style:transform="translateX(calc(-100% + {wd}px))"
    class="tw-pointer-events-none tw-z-50 tw-absolute tw-text-right tw-bg-slate-900 tw-p-1.5 tw-rounded-md tw-text-white tw-left-0 tw-w-max tw-opacity-0 tw-transition-opacity group-hover:tw-opacity-100"
  >
    Wow, looks like your teacher manually overrided your calculated grade!<br
    />This means that your final grade percent does not correspond with your
    actual final grade letter.
  </div>
</div>
