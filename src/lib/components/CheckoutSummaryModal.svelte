<script lang="ts">
	import type { CheckoutSession } from '$lib/stores/checkout-session';
	import { getSuccessfulItems } from '$lib/stores/checkout-session';
	import { Check, TriangleAlert } from '@lucide/svelte';

	type Props = {
		session: CheckoutSession;
		onConfirm: () => void;
	};

	let { session, onConfirm }: Props = $props();

	const successfulItems = $derived(getSuccessfulItems(session));
	const failedItems = $derived(session.items.filter((item) => item.status !== 'success'));

	const actionText = $derived(session.type === 'borrow' ? 'borrowed' : 'returned');
</script>

<dialog class="modal-open modal">
	<div class="modal-box max-w-3xl">
		<h3 class="mb-6 text-2xl font-bold">
			{session.type === 'borrow' ? 'Checkout' : 'Return'} Summary
		</h3>

		{#if successfulItems.length > 0}
			<div class="mb-6">
				<h4 class="mb-3 text-lg font-semibold text-success">
					✓ Successfully {actionText}: {successfulItems.length}
					{successfulItems.length === 1 ? 'item' : 'items'}
				</h4>

				<ul class="space-y-2">
					{#each successfulItems as item}
						<li class="flex items-start gap-3 rounded-lg bg-success/10 p-3">
							<span class="text-success"><Check /></span>
							<div class="flex-1">
								<p class="font-medium">
									{item.mediaItem?.title || 'Unknown Item'}
								</p>
								{#if item.mediaItem?.author}
									<p class="text-sm opacity-70">by {item.mediaItem.author}</p>
								{/if}
								<p class="mt-1 text-xs opacity-60">ID: {item.rfidData.id}</p>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if failedItems.length > 0}
			<div class="mb-6">
				<h4 class="mb-3 text-lg font-semibold text-warning">
					⚠ {failedItems.length}
					{failedItems.length === 1 ? 'item' : 'items'} could not be processed
				</h4>
				<ul class="space-y-2">
					{#each failedItems as item}
						<li class="flex items-start gap-3 rounded-lg bg-warning/10 p-3">
							<span class="text-warning"><TriangleAlert /></span>
							<div class="flex-1">
								<p class="font-medium">
									{item.mediaItem?.title || 'Unknown Item'}
								</p>
								{#if item.mediaItem?.author}
									<p class="text-sm opacity-70">by {item.mediaItem.author}</p>
								{/if}
								<p class="mt-1 text-sm text-error">{item.message}</p>
								<p class="mt-1 text-xs opacity-60">ID: {item.rfidData.id}</p>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if successfulItems.length === 0 && failedItems.length === 0}
			<div class="py-8 text-center">
				<p class="text-lg opacity-70">No items were processed in this session.</p>
			</div>
		{/if}

		<div class="modal-action">
			<button class="btn btn-block btn-primary" onclick={onConfirm}>
				{successfulItems.length > 0 ? 'Finish & Logout' : 'Close'}
			</button>
		</div>
	</div>
</dialog>
