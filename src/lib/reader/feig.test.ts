import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeigRFIDReader } from './feig';

vi.mock('$app/env', () => ({ browser: true }));

vi.stubGlobal('window', {});

const listeners = new Map<string, EventListener>();
const eventSource = {
	addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
		listeners.set(type, listener as EventListener);
	},
	close() {}
};

vi.stubGlobal(
	'EventSource',
	class FakeEventSource {
		addEventListener = eventSource.addEventListener;
		close = eventSource.close;
	}
);

afterEach(() => {
	listeners.clear();
	vi.clearAllMocks();
});

describe('Feig notification stream', () => {
	it('delivers backend tag events with nullable fields and no RSSI', () => {
		const reader = new FeigRFIDReader({ baseUrl: 'http://feig.test', readerName: 'reader1' });
		const onEvent = vi.fn();
		reader.startMonitoring(onEvent);

		const backendPayload = {
			readerName: 'reader1',
			timestamp: '2026-10-22T11:23:50.754Z',
			eventType: 'TAG_EVENT',
			epc: 'tag-1',
			tagId: 'tag-1',
			tagType: null,
			mediaId: null,
			secured: null,
			pc: null,
			rssiValues: [],
			readerTimestamp: null,
			hfBlockSize: null,
			hfBlockCount: null,
			hfBlocksHex: null,
			stable: false,
			seenCount: 1,
			presenceDurationMs: 0,
			bestRssi: null
		};
		expect(listeners.has('tag')).toBe(true);
		listeners.get('tag')?.(new MessageEvent('tag', { data: JSON.stringify(backendPayload) }));

		expect(onEvent).toHaveBeenCalledWith({
			type: 'added',
			item: expect.objectContaining({ id: 'tag-1', rssi: -50 })
		});
	});
});
