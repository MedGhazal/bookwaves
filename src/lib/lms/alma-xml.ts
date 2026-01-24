import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import type { AlmaRFIDItem, AlmaRFIDTag } from './alma-types';

const xmlBuilder = new XMLBuilder({
	ignoreAttributes: false,
	format: true,
	suppressEmptyNode: true
});

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	textNodeName: '#text'
});

type XmlObject = Record<string, unknown>;

const toRecord = (value: unknown): XmlObject | undefined =>
	typeof value === 'object' && value !== null ? (value as XmlObject) : undefined;

function extractText(node: unknown): string | undefined {
	if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
		return String(node).trim();
	}

	const record = toRecord(node);
	if (record && typeof record['#text'] === 'string') return record['#text'].trim();
	return undefined;
}

function parseBoolean(node: unknown): boolean | undefined {
	if (typeof node === 'boolean') return node;
	const value = extractText(node);
	if (!value) return undefined;
	if (value.toLowerCase() === 'true') return true;
	if (value.toLowerCase() === 'false') return false;
	return undefined;
}

function extractReaderIp(parsed: XmlObject | undefined): string | undefined {
	const security = toRecord(parsed?.security);
	const items = toRecord(parsed?.items);
	const item = toRecord(parsed?.item);
	const update = toRecord(parsed?.update);
	const updateItem = toRecord(parsed?.updateItem);

	const candidates = [
		parsed?.reader_ip,
		parsed?.readerIp,
		security?.reader_ip,
		items?.reader_ip,
		item?.reader_ip,
		update?.reader_ip,
		updateItem?.reader_ip
	];

	for (const candidate of candidates) {
		const ip = extractText(candidate);
		if (ip) return ip;
	}

	return undefined;
}

export function buildGetItemsResponse(
	items: Array<
		AlmaRFIDItem & { is_complete?: boolean; total_num_of_parts?: number; tags?: AlmaRFIDTag[] }
	>
): string {
	const itemElements = items.map((item) => ({
		barcode: item.barcode,
		is_secure: item.secure,
		is_complete: item.is_complete ?? true,
		total_num_of_parts: item.total_num_of_parts ?? item.tags?.length ?? 1,
		tags: {
			tag: (item.tags ?? []).map((tag) => ({
				tag_id: tag.barcode,
				part_num: tag.partNumber,
				material_type: tag.materialType,
				library: tag.library,
				location: tag.location
			}))
		}
	}));

	return xmlBuilder.build({
		'?xml': {
			'@_version': '1.0',
			'@_encoding': 'UTF-8'
		},
		rfid: {
			items: {
				item: itemElements.length === 1 ? itemElements[0] : itemElements
			}
		}
	});
}

export function buildSuccessResponse(success: boolean): string {
	return xmlBuilder.build({
		'?xml': {
			'@_version': '1.0',
			'@_encoding': 'UTF-8'
		},
		rfid: {
			success
		}
	});
}

export function buildErrorResponse(message: string): string {
	return xmlBuilder.build({
		'?xml': {
			'@_version': '1.0',
			'@_encoding': 'UTF-8'
		},
		rfid: {
			ExceptionDetail: {
				Message: message
			}
		}
	});
}

export function parseSetSecurityPayload(xml: string): {
	barcode: string;
	secure: boolean;
	readerIp?: string;
	secureProvided: boolean;
} {
	const parsed = xmlParser.parse(xml) as unknown;
	const parsedRecord = toRecord(parsed) ?? ({} as XmlObject);
	const payload = toRecord(parsedRecord.rfid) ?? parsedRecord;
	const secureValue = parseBoolean(payload?.is_secure ?? payload?.secure);
	return {
		barcode: extractText(payload?.barcode) || '',
		secure: secureValue ?? false,
		secureProvided: secureValue !== undefined,
		readerIp: extractReaderIp(payload) ?? extractReaderIp(parsedRecord)
	};
}

export function parseItemUpdatePayload(xml: string): {
	readerIp?: string;
	items: Array<AlmaRFIDItem & { secureProvided: boolean }>;
} {
	const parsed = xmlParser.parse(xml) as unknown;
	const parsedRecord = toRecord(parsed) ?? ({} as XmlObject);
	const root = toRecord(parsedRecord.rfid) ?? parsedRecord;
	const itemsContainer = toRecord(root.items);
	const items = itemsContainer?.item ?? root.item;

	if (!items) {
		return { readerIp: extractReaderIp(root) ?? extractReaderIp(parsedRecord), items: [] };
	}

	const itemArray = Array.isArray(items) ? items : [items];

	return {
		readerIp: extractReaderIp(root) ?? extractReaderIp(parsedRecord),
		items: itemArray
			.filter(Boolean)
			.map((itemNode) => toRecord(itemNode))
			.filter((item): item is XmlObject => Boolean(item))
			.map((item) => {
				const tagsContainer = toRecord(item.tags);
				const tagsNode = tagsContainer?.tag ?? item.tags ?? item.rfidtag;
				const tagsArray = Array.isArray(tagsNode) ? tagsNode : tagsNode ? [tagsNode] : [];
				const secureValue = parseBoolean(item?.is_secure ?? item?.secure);

				return {
					barcode: extractText(item?.barcode) || '',
					secure: secureValue ?? false,
					secureProvided: secureValue !== undefined,
					tags: tagsArray.map((tagNode) => {
						const tag = toRecord(tagNode) ?? {};
						const partNumberValue = extractText(tag?.part_num) || extractText(tag?.partNumber);
						const partNumber = Number.parseInt(partNumberValue ?? '', 10);

						return {
							barcode: extractText(tag?.tag_id) || extractText(tag?.barcode) || '',
							partNumber: Number.isNaN(partNumber) ? 1 : partNumber,
							materialType:
								extractText(tag?.material_type) || extractText(tag?.materialType) || 'BOOK',
							library: extractText(tag?.library) || '',
							location: extractText(tag?.location) || ''
						};
					})
				};
			})
	};
}

export function parseUpdateItemPayload(xml: string): {
	barcode: string;
	secure?: boolean;
	secureProvided: boolean;
	readerIp?: string;
} {
	const parsed = xmlParser.parse(xml) as unknown;
	const parsedRecord = toRecord(parsed) ?? ({} as XmlObject);
	const root = toRecord(parsedRecord.rfid) ?? parsedRecord;
	const rootItem = toRecord(root.item);
	const barcode =
		extractText(root?.barcode) ||
		extractText(rootItem?.barcode) ||
		extractText(parsedRecord?.barcode) ||
		'';
	const secureValue = parseBoolean(
		root?.is_secure ?? root?.secure ?? rootItem?.is_secure ?? rootItem?.secure
	);

	return {
		barcode,
		secure: secureValue,
		secureProvided: secureValue !== undefined,
		readerIp: extractReaderIp(root) ?? extractReaderIp(parsedRecord)
	};
}
