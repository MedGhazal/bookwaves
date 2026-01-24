<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		icon: Component;
		title: string;
		description: string;
	}

	let { icon: Icon, title, description }: Props = $props();
</script>

<div class="flex flex-col items-center gap-4 opacity-60">
	<Icon class="h-20 w-20 text-base-content/30" />
	<p class="text-2xl font-semibold">{title}</p>
	<p class="text-lg">{description}</p>
</div>
