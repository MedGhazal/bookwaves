<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import NavigationCard from '$lib/components/NavigationCard.svelte';
	import { BookOpen, List, User, Undo2 } from '@lucide/svelte';
	import { page } from '$app/state';

	// Get current query string to preserve reader config
	let queryString = $derived(page.url.search);
	let checkoutIconThemeStyle = $derived(
		[
			'--bw-checkout-icon-borrow: color-mix(in oklab, var(--bw-page-checkout-to) 85%, var(--bw-page-checkout-from))',
			'--bw-checkout-icon-return: color-mix(in oklab, var(--bw-page-checkout-to) 65%, var(--bw-page-checkout-from))',
			'--bw-checkout-icon-list: color-mix(in oklab, var(--bw-page-checkout-to) 40%, var(--bw-page-checkout-from))',
			'--bw-checkout-icon-account: color-mix(in oklab, var(--bw-page-checkout-from) 85%, var(--bw-page-checkout-to))'
		].join('; ')
	);
</script>

<div class="app-page-bg-checkout flex min-h-full flex-col items-center justify-center p-8">
	<PageHeader title="Self-Checkout" subtitle="Please select an option to continue" showLogo />

	<nav
		class="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-4"
		style={checkoutIconThemeStyle}
	>
		<NavigationCard
			href="/checkout/borrow{queryString}"
			title="Borrow"
			description="Check out books"
			icon={BookOpen}
			iconColorValue="var(--bw-checkout-icon-borrow)"
			size="large"
		/>

		<NavigationCard
			href="/checkout/return{queryString}"
			title="Return"
			description="Return borrowed books"
			icon={Undo2}
			iconColorValue="var(--bw-checkout-icon-return)"
			size="large"
		/>

		<NavigationCard
			href="/checkout/list{queryString}"
			title="List"
			description="View status of books on the device"
			icon={List}
			iconColorValue="var(--bw-checkout-icon-list)"
			size="large"
		/>

		<NavigationCard
			href="/checkout/account{queryString}"
			title="Account"
			description="View your library account"
			icon={User}
			iconColorValue="var(--bw-checkout-icon-account)"
			size="large"
		/>
	</nav>
</div>
