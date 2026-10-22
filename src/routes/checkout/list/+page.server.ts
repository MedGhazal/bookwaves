import type { PageServerLoad } from './$types';
import { getConfig, type LoginMode } from '#lib/server/config.js';
import { logger } from '#lib/server/logger.js';

export const load = (async () => {
	let securitySynchingActive = false;
    let hideLocation = false;
	try {
		const config = getConfig();
        securitySynchingActive = config.checkout?.security_synching_enabled ?? false;
        hideLocation = config.hide_location ?? false;
	} catch (error) {
		logger.error({ err: error }, 'Failed to load config');
	}
    return {
        securitySynchingActive,
        hideLocation
    }
}) satisfies PageServerLoad;
