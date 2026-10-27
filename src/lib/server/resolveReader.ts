import { getAllReaders, getServerMiddlewareUrl } from '#lib/reader/factory.js';
import type { RFIDReader, ReaderInfo } from '#lib/reader/interface.js';
import { FeigRFIDReader } from '#lib/reader/feig.js';
import { mockRFIDReader } from '#lib/reader/mock.js';
import type { MiddlewareInstanceConfig } from '#lib/server/config.js';
import { getConfig } from '#lib/server/config.js';
import { logger } from '#lib/server/logger.js';
import {
	isKnownMiddlewareType,
	describeKnownMiddlewareTypes,
	UnknownMiddlewareTypeError
} from '#lib/reader/middlewareTypes.js';

export interface ResolvedReader {
	reader: RFIDReader;
	readerInfo: ReaderInfo;
	middleware: MiddlewareInstanceConfig;
}

function normalizeAddress(value?: unknown): string {
	if (typeof value !== 'string') return '';
	const trimmed = value.trim();
	if (!trimmed) return '';

	try {
		// Allow matching values like http://1.2.3.4:7070
		if (trimmed.startsWith('http')) {
			const url = new URL(trimmed);
			return url.hostname;
		}
	} catch (error) {
		logger.debug({ err: error, value }, 'Failed to normalize reader address');
	}

	const [host] = trimmed.split(':');
	return host || trimmed;
}

function createReaderInstance(
	instance: MiddlewareInstanceConfig,
	info: ReaderInfo
): RFIDReader | null {
	const type = instance.type.toLowerCase();

	if (!isKnownMiddlewareType(type)) {
		// Configuration error: named and logged distinctly from "reader instance creation
		// failed for an operational reason" (e.g. an unreachable Feig middleware).
		logger.error(
			{ instance: instance.id, type: instance.type },
			`Unrecognised middleware type. Recognised types: ${describeKnownMiddlewareTypes()}`
		);
		return null;
	}

	switch (type) {
		case 'mock':
			return mockRFIDReader;
		case 'feig':
		case 'http':
			try {
				return new FeigRFIDReader({
					baseUrl: getServerMiddlewareUrl(instance),
					readerName: info.name
				});
			} catch (error) {
				logger.error(
					{ err: error, instance: instance.id },
					`Invalid middleware URL for "${type}" reader`
				);
				return null;
			}
		default: {
			logger.error(
				{ instance: instance.id, type },
				'Middleware type recognised but not implemented in createReaderInstance'
			);
			return null;
		}
	}
}

export async function resolveReaderByIp(readerIp: string): Promise<ResolvedReader | null> {
	const target = normalizeAddress(readerIp);
	if (!target) {
		return null;
	}

	const config = getConfig();

	for (const instance of config.middleware_instances) {
		let readers: ReaderInfo[];

		try {
			readers = await getAllReaders(instance);
		} catch (error) {
			const message =
				error instanceof UnknownMiddlewareTypeError
					? 'Skipping middleware with unrecognised type while resolving reader by IP'
					: 'Failed to load readers for middleware';
			logger.error({ err: error, instance: instance.id }, message);
			continue;
		}

		const match = readers.find((reader) => normalizeAddress(reader.address) === target);
		if (!match) continue;

		const reader = createReaderInstance(instance, match);
		if (!reader) {
			logger.error(
				{ instance: instance.id, reader: match.name },
				'Unable to create reader instance'
			);
			continue;
		}

		return {
			reader,
			readerInfo: match,
			middleware: instance
		};
	}

	return null;
}
