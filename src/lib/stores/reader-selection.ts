import type { RFIDReader } from '#lib/reader/interface.js';
import { FeigRFIDReader } from '#lib/reader/feig.js';
import { mockRFIDReader } from '#lib/reader/mock.js';
import { clientLogger } from '#lib/client/logger.js';
import {
	isKnownMiddlewareType,
	describeKnownMiddlewareTypes
} from '#lib/reader/middlewareTypes.js';

/**
 * Helper functions to get the currently selected reader from localStorage
 * This allows other parts of the application to access the selected reader
 */

export function getSelectedMiddleware(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('selectedMiddleware');
}

export function getSelectedReader(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('selectedReader');
}

export function setSelectedReaderConfig(middleware: string, reader: string): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem('selectedMiddleware', middleware);
	localStorage.setItem('selectedReader', reader);
}

export function getSelectedFormat(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('selectedFormat');
}

export function setSelectedFormat(format: string): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem('selectedFormat', format);
}

export function getSelectedReaderConfig(): {
	middleware: string;
	reader: string;
} | null {
	const middleware = getSelectedMiddleware();
	const reader = getSelectedReader();

	if (!middleware || !reader) return null;

	return { middleware, reader };
}

/**
 * Create an RFIDReader instance from the stored selection
 * @param middlewareUrl Optional URL override for the middleware (for feig/http readers)
 * @param middlewareType The type of middleware (feig, http, mock, etc.)
 * @returns RFIDReader instance or null if no reader is selected
 */
export function createReaderFromSelection(
	middlewareUrl?: string,
	middlewareType?: string
): RFIDReader | null {
	const config = getSelectedReaderConfig();
	if (!config) return null;

	const type = middlewareType?.toLowerCase() || 'feig';

	if (!isKnownMiddlewareType(type)) {
		clientLogger.warn(
			`Unrecognised middleware type "${middlewareType}". Recognised types: ${describeKnownMiddlewareTypes()}`
		);
		return null;
	}

	switch (type) {
		case 'mock':
			return mockRFIDReader;

		case 'feig':
		case 'http':
			return new FeigRFIDReader({
				baseUrl: middlewareUrl,
				readerName: config.reader
			});

		default:
			return null;
	}
}

/**
 * Get reader configuration from URL params with fallback to localStorage
 * Priority: URL params > localStorage > null
 * @param middlewareId Middleware ID from URL params
 * @param readerId Reader ID from URL params
 * @returns Reader configuration or null
 */
export function getReaderConfigWithParams(
	middlewareId?: string | null,
	readerId?: string | null
): { middleware: string; reader: string } | null {
	// Prefer URL params if provided
	if (middlewareId && readerId) {
		return { middleware: middlewareId, reader: readerId };
	}

	// Fallback to localStorage
	return getSelectedReaderConfig();
}

/**
 * Create an RFIDReader instance from URL params or localStorage
 * Priority: URL params > localStorage > null
 * @param middlewareId Middleware ID from URL params
 * @param readerId Reader ID from URL params
 * @param middlewareUrl Middleware URL (for feig/http readers)
 * @param middlewareType Middleware type (feig, http, mock, etc.)
 * @returns RFIDReader instance or null
 */
export function createReaderFromParams(
	middlewareId?: string | null,
	readerId?: string | null,
	middlewareUrl?: string,
	middlewareType?: string
): RFIDReader | null {
	const config = getReaderConfigWithParams(middlewareId, readerId);
	if (!config) {
		clientLogger.warn(
			'No reader configuration found. Please configure via URL params or admin page.'
		);
		return null;
	}

	const type = middlewareType?.toLowerCase() || 'feig';

	clientLogger.info('Creating reader with config:', {
		middleware: config.middleware,
		reader: config.reader,
		type,
		url: middlewareUrl
	});

	if (!isKnownMiddlewareType(type)) {
		clientLogger.warn(
			`Unrecognised middleware type "${middlewareType}". Recognised types: ${describeKnownMiddlewareTypes()}`
		);
		return null;
	}

	switch (type) {
		case 'mock':
			return mockRFIDReader;

		case 'feig':
		case 'http':
			if (!middlewareUrl) {
				clientLogger.error(`"${type}" reader requires a middleware URL`);
				return null;
			}
			return new FeigRFIDReader({
				baseUrl: middlewareUrl,
				readerName: config.reader
			});

		default:
			return null;
	}
}

/**
 * Explains, for the checkout list and gate pages, why `createReaderFromParams` returned `null`
 * when the URL already names a middleware — distinguishing "the operator has not selected a
 * reader yet" (normal, not an error) from "this middleware's type is not one BookWaves
 * recognises" (a real configuration problem). Those two used to collapse into the same
 * `reader_not_configured` message, which is why an unrecognised type read as a normal,
 * unconfigured state instead of a problem worth fixing. Returns `null` when there is no
 * evidence of a type-related problem (including when no type was supplied at all, which is the
 * ordinary "nothing selected yet" case).
 */
export function getReaderConfigProblem(
	middlewareType?: string | null
): 'unknown_middleware_type' | null {
	if (!middlewareType) return null;
	return isKnownMiddlewareType(middlewareType.toLowerCase()) ? null : 'unknown_middleware_type';
}
