import { describe, expect, it } from 'vitest';
import {
	isKnownMiddlewareType,
	UnknownMiddlewareTypeError,
	unknownMiddlewareTypeMessage
} from './middlewareTypes';

describe('isKnownMiddlewareType', () => {
	it('accepts mock, the vendor-neutral type and the Feig-specific one it replaces', () => {
		expect(isKnownMiddlewareType('http')).toBe(true);
		expect(isKnownMiddlewareType('feig')).toBe(true);
		expect(isKnownMiddlewareType('mock')).toBe(true);
	});

	it.each(['Feig', 'HTTP', 'Mock'])('ignores case for %s', (type) => {
		expect(isKnownMiddlewareType(type)).toBe(true);
	});

	it('rejects anything else, including the empty string', () => {
		expect(isKnownMiddlewareType('fieg')).toBe(false);
		expect(isKnownMiddlewareType('')).toBe(false);
	});
});

describe('UnknownMiddlewareTypeError', () => {
	it('carries the same message the Admin page shows for the entry', () => {
		const error = new UnknownMiddlewareTypeError('m1', 'fieg');

		expect(error.message).toBe(unknownMiddlewareTypeMessage('m1', 'fieg'));
		expect(error.message).toContain('mock, feig, http');
	});
});
