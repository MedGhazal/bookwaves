<script lang="ts">
	import type { CheckoutSession, SessionItem } from '$lib/stores/checkout-session';
	import { getSuccessfulItems } from '$lib/stores/checkout-session';
	import type { LmsReturnDirective } from '$lib/lms/lms';
	import { SvelteMap } from 'svelte/reactivity';
	import { Check, TriangleAlert } from '@lucide/svelte';

	type Props = {
		session: CheckoutSession;
		onConfirm: () => void;
	};

	let { session, onConfirm }: Props = $props();

	const successfulItems = $derived(getSuccessfulItems(session));
	const failedItems = $derived(session.items.filter((item) => item.status !== 'success'));

	const directiveGroups = $derived.by(() => {
		if (session.type !== 'return')
			return [] as Array<{
				directive: LmsReturnDirective;
				items: SessionItem[];
			}>;

		const fallbackDirective: LmsReturnDirective = {
			binId: 'unspecified',
			label: 'No bin assigned',
			color: 'neutral',
			message: 'No sorting instruction provided',
			sortOrder: 99
		};

		const groups = new SvelteMap<string, { directive: LmsReturnDirective; items: SessionItem[] }>();

		for (const item of successfulItems) {
			const directive = item.directive ?? fallbackDirective;
			const key = directive.binId;
			const existing = groups.get(key);
			if (existing) {
				existing.items.push(item);
			} else {
				groups.set(key, { directive, items: [item] });
			}
		}

		return Array.from(groups.values()).sort((a, b) => {
			const aOrder = a.directive.sortOrder ?? 99;
			const bOrder = b.directive.sortOrder ?? 99;
			if (aOrder !== bOrder) return aOrder - bOrder;
			return a.directive.label.localeCompare(b.directive.label);
		});
	});

	const actionText = $derived(session.type === 'borrow' ? 'borrowed' : 'returned');
	const hasSortingSteps = $derived(session.type === 'return' && directiveGroups.length > 0);
	const totalSteps = $derived(hasSortingSteps ? directiveGroups.length + 1 : 1);
	let currentStep = $state(0);
	const activeStep = $derived(hasSortingSteps ? Math.min(currentStep, directiveGroups.length) : 0);

	function getDirectiveBadgeClass(color?: string) {
		switch (color) {
			case 'red':
				return 'badge-error';
			case 'green':
				return 'badge-success';
			case 'blue':
				return 'badge-info';
			case 'yellow':
				return 'badge-warning';
			default:
				return 'badge-neutral';
		}
	}

	function getStepClass(stepIndex: number, color?: string) {
		if (stepIndex > activeStep) return '';
		if (stepIndex === directiveGroups.length) return 'step-primary';

		switch (color) {
			case 'red':
				return 'step-error';
			case 'green':
				return 'step-success';
			case 'blue':
				return 'step-info';
			case 'yellow':
				return 'step-warning';
			default:
				return 'step-neutral';
		}
	}

	function handleConfirmStep() {
		if (activeStep < totalSteps - 1) {
			currentStep += 1;
		}
	}
</script>

<dialog class="modal-open modal">
	<div class="modal-box max-w-3xl">
		<h3 class="mb-6 text-2xl font-bold">
			{session.type === 'borrow' ? 'Checkout' : 'Return'} Summary
		</h3>

		{#if successfulItems.length > 0}
			{#if hasSortingSteps}
				<div class="mb-6">
					<ul class="steps steps-vertical w-full gap-2 lg:steps-horizontal lg:gap-0">
						{#each directiveGroups as group, index (group.directive.binId)}
							<li class={`step ${getStepClass(index, group.directive.color)}`}>
								{group.directive.label}
							</li>
						{/each}
						<li class={`step ${getStepClass(directiveGroups.length)}`}>Summary</li>
					</ul>
				</div>

				{#if activeStep < directiveGroups.length}
					{@const group = directiveGroups[activeStep]}
					<div class="mb-6 rounded-lg border border-base-200 bg-base-100 p-4">
						<div class="mb-3 flex items-center gap-3">
							<span class={`badge badge-lg ${getDirectiveBadgeClass(group.directive.color)}`}>
								{group.directive.label}
							</span>
							{#if group.directive.message}
								<span class="text-sm opacity-70">{group.directive.message}</span>
							{/if}
						</div>
						<p class="mb-3 text-sm opacity-70">
							Place the following items into this bin, then confirm.
						</p>
						<ul class="space-y-2">
							{#each group.items as item (item.rfidData.id)}
								<li
									class="flex items-start justify-between gap-3 rounded-md bg-base-200/50 px-3 py-2"
								>
									<div>
										<p class="font-medium">
											{item.mediaItem?.title || 'Unknown Item'}
										</p>
										{#if item.mediaItem?.author}
											<p class="text-xs opacity-70">by {item.mediaItem.author}</p>
										{/if}
									</div>
									<p class="text-xs opacity-60">ID: {item.rfidData.id}</p>
								</li>
							{/each}
						</ul>
					</div>
				{:else}
					<div class="mb-6">
						<h4 class="mb-3 text-lg font-semibold text-success">
							✓ Successfully {actionText}: {successfulItems.length}
							{successfulItems.length === 1 ? 'item' : 'items'}
						</h4>

						<ul class="space-y-2">
							{#each successfulItems as item (item.rfidData.id)}
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
			{:else}
				<div class="mb-6">
					<h4 class="mb-3 text-lg font-semibold text-success">
						✓ Successfully {actionText}: {successfulItems.length}
						{successfulItems.length === 1 ? 'item' : 'items'}
					</h4>

					<ul class="space-y-2">
						{#each successfulItems as item (item.rfidData.id)}
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
		{/if}

		{#if failedItems.length > 0 && (!hasSortingSteps || activeStep === directiveGroups.length)}
			<div class="mb-6">
				<h4 class="mb-3 text-lg font-semibold text-warning">
					⚠ {failedItems.length}
					{failedItems.length === 1 ? 'item' : 'items'} could not be processed
				</h4>
				<ul class="space-y-2">
					{#each failedItems as item (item.rfidData.id)}
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

		{#if !hasSortingSteps || activeStep === directiveGroups.length}
			<div class="modal-action">
				<button class="btn btn-block btn-primary" onclick={onConfirm}>
					{successfulItems.length > 0 ? 'Finish & Logout' : 'Close'}
				</button>
			</div>
		{:else}
			<div class="modal-action">
				<button class="btn btn-block btn-primary" onclick={handleConfirmStep}>
					Confirm bin complete
				</button>
			</div>
		{/if}
	</div>
</dialog>
