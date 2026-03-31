<script lang="ts">
	import './layout.css';
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

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="h-screen overflow-y-auto" style={themeVarsStyle}>
	<div class="fixed bottom-4 left-4 z-50 flex gap-2">
		<button
			class="btn btn-outline"
			onclick={() => setLocale('de')}
			aria-label="Sprache auf Deutsch wechseln">🇩🇪 DE</button
		>
		<button
			class="btn btn-outline"
			onclick={() => setLocale('en')}
			aria-label="Switch language to English">🇬🇧 EN</button
		>
	</div>
	{@render children?.()}
</div>
