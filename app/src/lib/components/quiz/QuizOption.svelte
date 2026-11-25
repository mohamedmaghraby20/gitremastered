<!--
  QuizOption.svelte
  One answer: a lettered keycap (A–D) and the answer text, as a real button.
  After checking, the right answer gets "✓ Right" and a wrong pick gets "✗ Wrong": icons and
  words, never color alone.

  Inputs: letter, text, isPicked, mark ("right", "wrong" or null before checking),
          isLocked (true after checking, so the pick cannot change), onpick.
-->
<script lang="ts">
	let {
		letter,
		text,
		isPicked,
		mark,
		isLocked,
		onpick
	}: {
		letter: string;
		text: string;
		isPicked: boolean;
		mark: 'right' | 'wrong' | null;
		isLocked: boolean;
		onpick: () => void;
	} = $props();
</script>

<li>
	<button
		type="button"
		aria-pressed={isPicked}
		disabled={isLocked}
		onclick={onpick}
		class={[
			'flex w-full cursor-pointer items-center gap-3 rounded-medium border px-3 py-2.5 text-left disabled:cursor-default',
			isPicked
				? 'border-primary bg-surface-sunken'
				: 'border-border bg-surface hover:bg-surface-sunken',
			mark === 'right' && 'border-success',
			mark === 'wrong' && 'border-danger'
		]}
	>
		<span
			class={[
				'type-label-mono grid size-6 shrink-0 place-items-center rounded-small border border-b-[3px] font-bold',
				isPicked ? 'border-primary-edge bg-primary text-on-primary' : 'border-border-strong'
			]}
			aria-hidden="true"
		>
			{letter}
		</span>
		<span class="type-body flex-1">{text}</span>
		{#if mark === 'right'}
			<span class="type-small font-semibold text-success">✓ Right</span>
		{:else if mark === 'wrong'}
			<span class="type-small font-semibold text-danger">✗ Wrong</span>
		{/if}
	</button>
</li>
