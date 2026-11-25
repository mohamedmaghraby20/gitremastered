<!--
  ButtonSamples.svelte
  Dev gallery: the three keycap Button variants, as in the design system's Button preview.
  Input: none.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex flex-wrap items-center gap-3">
	<Button shortcut="⏎">Check mission</Button>
	<Button variant="secondary">Reset practice</Button>
	<Button variant="ghost">Show a hint</Button>
	<Button disabled>Disabled</Button>
</div>
