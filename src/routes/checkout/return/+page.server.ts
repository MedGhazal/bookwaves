import type { PageServerLoad } from './$types';
import { getConfig, type LoginMode } from '#lib/server/config.js';
import { logger } from '#lib/server/logger.js';

export const load = (async () => {
	let autoReturnActive = true;
	try {
		const config = getConfig();
        autoReturnActive = config.checkout?.auto_return ?? true;
	} catch (error) {
		logger.error({ err: error }, 'Failed to load return config');
	}
    return {
        autoReturnActive
    }
}) satisfies PageServerLoad;
