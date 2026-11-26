<!--
  ZoneCommand.svelte
  The command between two desk zones, as a small keycap followed by an arrow, on one line
  (e.g. "git add →"; "git add ↓" when the narrow desk stacks the zones).
  Input: command, the command that moves files to the next zone.
  Both commands get the same space on each side, so the gaps between zones look even.
-->
<script lang="ts">
	let { command }: { command: string } = $props();
</script>

<div class="flex items-center gap-1 self-center px-2" aria-hidden="true">
	<span
		class="type-label-mono rounded-small border border-b-2 border-border-strong bg-surface px-1.5 text-center whitespace-nowrap"
	>
		{command}
	</span>
	<!-- → when the zones sit side by side, ↓ when the narrow desk stacks them (AreaDesk). -->
	<span class="text-border-strong @max-[34rem]:hidden">→</span>
	<span class="hidden text-border-strong @max-[34rem]:inline">↓</span>
</div>
