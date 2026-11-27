<!--
  button-test-host.svelte
  Test helper only: renders one Button with a text label, because tests cannot pass
  child content (a Svelte snippet) to a component directly.
  Inputs: the Button's props plus "label".
-->
<script lang="ts">
	import Button from './button.svelte';
	import type { ButtonProps } from './button-variants';

	let { label, ...buttonProps }: ButtonProps & { label: string } = $props();
</script>

<Button {...buttonProps}>{label}</Button>
