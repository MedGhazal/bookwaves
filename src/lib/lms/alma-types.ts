export interface AlmaRFIDTag {
	barcode: string;
	partNumber: number;
	materialType: string;
	library: string;
	location: string;
}

export interface AlmaRFIDItem {
	barcode: string;
	secure: boolean;
	tags: AlmaRFIDTag[];
}

export interface AlmaSecurityPayload {
	barcode: string;
	secure: boolean;
}

export interface AlmaUpdatePayload {
	items: AlmaRFIDItem[];
}
