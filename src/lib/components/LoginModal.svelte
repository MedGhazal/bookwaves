<script lang="ts">
	import { onMount } from 'svelte';
	import { loginUser } from '$lib/lms/lms.remote';
	import { setAuthUser } from '$lib/stores/auth';
	import { CircleX } from '@lucide/svelte';
	import { clientLogger } from '$lib/client/logger';

	type LoginMode = 'username_password' | 'username_only';

	interface Props {
		onSuccess: () => void;
		onCancel?: () => void;
		loginMode?: LoginMode;
	}

	let { onSuccess, onCancel, loginMode = 'username_password' }: Props = $props();

	const requiresPassword = $derived(loginMode !== 'username_only');
	let username = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
	let usernameInput: HTMLInputElement | null = null;
	const handleCancel = () => onCancel?.();

	onMount(() => {
		usernameInput?.focus();
		usernameInput?.select();
	});

	async function handleSubmit(event?: Event) {
		event?.preventDefault();

		const normalizedUsername = username.trim();

		if (!normalizedUsername) {
			errorMessage = 'Please enter a username';
			return;
		}

		if (requiresPassword && !password) {
			errorMessage = 'Please enter a password';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			const payload = requiresPassword
				? { user: normalizedUsername, password }
				: { user: normalizedUsername };
			const success = await loginUser(payload);

			if (success) {
				setAuthUser(normalizedUsername);
				onSuccess();
			} else {
				errorMessage = 'Login failed. Please try again.';
			}
		} catch (error) {
			errorMessage = 'An error occurred. Please try again.';
			clientLogger.error('Login error:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="modal-open modal">
	<div
		class="modal-box max-w-xl rounded-3xl bg-base-100/95 text-base-content shadow-2xl ring-1 ring-base-300/70"
	>
		<div class="flex items-start justify-between gap-3">
			<div>
				<div
					class="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase"
				>
					<span>{requiresPassword ? 'Username + password' : 'Username only'}</span>
				</div>
				<h3 class="text-3xl leading-tight font-black">Login Required</h3>
				<p class="mt-2 text-base-content/70">
					{requiresPassword
						? 'Enter your username and password to continue.'
						: 'Scan your ID or enter your username, then press Enter to continue.'}
				</p>
			</div>
			<div
				class="rounded-2xl bg-base-200/70 px-3 py-2 text-xs font-semibold tracking-wide text-base-content/70 uppercase"
			>
				HID ready
			</div>
		</div>

		{#if errorMessage}
			<div class="mt-4 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-error">
				<div class="flex items-center gap-3">
					<CircleX />
					<span>{errorMessage}</span>
				</div>
			</div>
		{/if}

		<form class="mt-6 space-y-5" onsubmit={handleSubmit}>
			<div class="form-control gap-2">
				<label class="label" for="username">
					<span class="label-text text-sm font-semibold">Username / Barcode</span>
				</label>
				<input
					id="username"
					type="text"
					inputmode="text"
					autocomplete="username"
					placeholder="Scan or type your username"
					class="input-bordered input input-lg w-full"
					bind:this={usernameInput}
					bind:value={username}
					disabled={isLoading}
				/>
				<p class="text-xs text-base-content/60">
					Focused for barcode scanners; press Enter to submit.
				</p>
			</div>

			{#if requiresPassword}
				<div class="form-control gap-2">
					<label class="label" for="password">
						<span class="label-text text-sm font-semibold">Password / PIN</span>
					</label>
					<input
						id="password"
						type="password"
						autocomplete="current-password"
						placeholder="Enter your password"
						class="input-bordered input input-lg w-full"
						bind:value={password}
						disabled={isLoading}
					/>
				</div>
			{/if}

			<div class="modal-action mt-8 flex items-center justify-end gap-3">
				<button
					type="button"
					class="btn px-5 btn-ghost"
					onclick={handleCancel}
					disabled={isLoading}
				>
					Cancel
				</button>
				<button class="btn px-6 btn-lg btn-primary" type="submit" disabled={isLoading}>
					{#if isLoading}
						<span class="loading loading-spinner"></span>
						Logging in...
					{:else}
						Login
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
