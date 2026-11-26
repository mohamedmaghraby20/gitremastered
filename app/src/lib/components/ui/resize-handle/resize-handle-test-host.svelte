<!--
  resize-handle-test-host.svelte
  Test helper: two panels of 400px and 600px with a resize handle between them, so the handle
  has real neighbours to measure (40% for the first panel). Plain inline sizes, because
  component tests do not load the app's Tailwind styles.
  Inputs: onresize, onresizeend, onreset (passed to the handle).
-->
<script lang="ts">
	import ResizeHandle from './resize-handle.svelte';

	let {
		onresize,
		onresizeend,
		onreset
	}: {
		onresize: (share: number) => void;
		onresizeend: (share: number) => void;
		onreset: () => void;
	} = $props();
</script>

<div style="display: flex; height: 80px; width: 1000px;">
	<div style="width: 400px; flex-shrink: 0;"></div>
	<ResizeHandle
		direction="columns"
		label="Resize the test panels"
		limits={{ smallest: 25, largest: 70 }}
		{onresize}
		{onresizeend}
		{onreset}
	/>
	<div style="width: 600px; flex-shrink: 0;"></div>
</div>
