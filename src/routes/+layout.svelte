<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { Snippet } from 'svelte';
	import { setLocale } from '$lib/paraglide/runtime';

	let {
		children,
		data
	}: {
		children: Snippet;
		data: { themeCssVars?: Record<string, string> };
	} = $props();

	let themeVarsStyle = $derived(
		Object.entries(data.themeCssVars ?? {})
			.map(([name, value]) => `${name}: ${value}`)
			.join('; ')
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-screen overflow-y-auto" style={themeVarsStyle}>
	<div class="fixed top-4 left-4 z-50 flex gap-2">
		<button class="btn" onclick={() => setLocale('en')}>en</button>
		<button class="btn" onclick={() => setLocale('de')}>de</button>
	</div>
	{@render children?.()}
</div>
