<script lang="ts">
	import MockReaderOverlay from '$lib/components/MockReaderOverlay.svelte';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	const isMockMiddleware = $derived(data.readerConfig?.middlewareType?.toLowerCase?.() === 'mock');
</script>

{@render children?.()}

{#if isMockMiddleware}
	<MockReaderOverlay />
{/if}
