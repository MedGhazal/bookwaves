import type { PageServerLoad } from './$types';
import { loadMiddlewareReaders } from '#lib/server/middlewareReaders.js';

export const load = (async () => {
	const { config, middlewareReaders } = await loadMiddlewareReaders();
	return {
		lmsType: config.lms.type,
		loginMode: config.login?.mode,
		lmsApiKeyMasked: config.lms.api_key ? '*** configured ***' : '*** not set ***',
		middlewareReaders,
		middlewareConfigProblems: config.middlewareConfigProblems,
		checkoutProfiles: config.checkout?.profiles ?? []
	};
}) satisfies PageServerLoad;
