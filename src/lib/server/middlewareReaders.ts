import { getAllReaders } from '$lib/reader/factory';
import type { ReaderInfo } from '$lib/reader/interface';
import { getConfig } from '$lib/server/config';
import { logger } from '$lib/server/logger';

export async function loadMiddlewareReaders() {
	const config = getConfig();

	const middlewareReaders = await Promise.all(
		config.middleware_instances.map(async (instance) => {
			try {
				const readers = await getAllReaders(instance);
				return { instance, readers };
			} catch (error) {
				logger.error({ err: error, instance: instance.id }, 'Error fetching readers');
				return {
					instance,
					readers: [] as ReaderInfo[]
				};
			}
		})
	);

	return { config, middlewareReaders };
}
