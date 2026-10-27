import { getAllReaders } from '#lib/reader/factory.js';
import type { ReaderInfo } from '#lib/reader/interface.js';
import { getConfig, type MiddlewareInstanceConfig } from '#lib/server/config.js';
import { logger } from '#lib/server/logger.js';

// The result is page data, so only the fields the browser needs leave the server.
function toBrowserInstance({ id, type, url }: MiddlewareInstanceConfig) {
	return { id, type, url };
}

export interface MiddlewareReaderResult {
	instance: ReturnType<typeof toBrowserInstance>;
	readers: ReaderInfo[];
	/**
	 * Set when `getAllReaders` failed for this instance (e.g. an unrecognised `type`, or a
	 * network failure). An empty `readers` array with no `error` means "reachable, nothing
	 * configured"; an empty array with `error` set means the middleware could not be queried at
	 * all — the Admin page and `ReaderSelector.svelte` render these differently so the two stop
	 * looking like the same "no readers" state.
	 */
	error?: string;
}

export async function loadMiddlewareReaders(
	options: { operatingMode?: 'host' | 'notification' } = {}
): Promise<{
	config: ReturnType<typeof getConfig>;
	middlewareReaders: MiddlewareReaderResult[];
}> {
	const config = getConfig();

	const middlewareReaders = await Promise.all(
		config.middleware_instances.map(async (instance): Promise<MiddlewareReaderResult> => {
			try {
				const readers = await getAllReaders(instance);
				return {
					instance: toBrowserInstance(instance),
					readers: options.operatingMode
						? readers.filter(
								(reader) => reader.mode?.trim().toLowerCase() === options.operatingMode
							)
						: readers
				};
			} catch (error) {
				logger.error({ err: error, instance: instance.id }, 'Error fetching readers');
				return {
					instance: toBrowserInstance(instance),
					readers: [] as ReaderInfo[],
					error: error instanceof Error ? error.message : 'Error fetching readers'
				};
			}
		})
	);

	return { config, middlewareReaders };
}
