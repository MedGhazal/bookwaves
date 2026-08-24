import { getConfig } from '$lib/server/config';
import type { LibraryManagementSystem } from '../../lms/lms';
import { createMockLMS } from './mock';
import { AlmaLMS } from './alma';

let cached: LibraryManagementSystem | null = null;

export function getLms(): LibraryManagementSystem {
	if (cached) return cached;

	// const { lms: lmsConfig, checkout } = getConfig();
  const config = getConfig();
	const { lms: lmsConfig, login, checkout } = getConfig();
	const coverImageProvider = lmsConfig.cover_image_provider;

	if (config.lms.type === 'alma') {
		if (!config.lms.api_key) {
			throw new Error('Missing Alma API key in configuration (lms.api_key)');
		}
		cached = new AlmaLMS({
			checkoutProfiles: config.checkout?.profiles
			apiKey: lmsConfig.api_key,
			pinLogin: login?.mode === 'username_password_or_pin',
			checkoutProfiles: checkout?.profiles,
			coverImageProvider
		});
		return cached;
	}

	cached = createMockLMS({
		coverImageProvider
	});
	return cached;
}
