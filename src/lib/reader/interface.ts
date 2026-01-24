export interface RFIDData {
	/** Unique identifier (EPC/UID) */
	id: string;
	/** Additional data stored on the tag */
	data?: string;
	/** Signal strength indicator */
	rssi?: number;
	/** Timestamp when item was detected */
	timestamp: Date;
	/** Security/EAS state of the tag */
	secured?: boolean;
	/** Tag type (e.g., DE290, DE6, etc.) */
	tagType?: string;
	/** Media ID extracted from tag */
	mediaId?: string;
	/** Protocol control word */
	pc?: string;
	/** Antenna RSSI values */
	antennaRssi?: Array<{ antennaNumber: number; rssi: number }>;
}

export interface EPCBankAnalysis {
	readSuccess: boolean;
	pcValue?: string;
	epcLengthInWords?: number;
	epcLengthInBytes?: number;
	actual?: string;
	theoretical?: string;
	matches?: boolean;
}

export interface TidBankAnalysis {
	readSuccess: boolean;
	lengthBytes?: number;
	tidHex?: string;
}

export interface ReservedBankAnalysis {
	readableWithoutAuth?: boolean;
	readableWithAuth?: boolean;
	theoretical?: string;
	actual?: string;
	matches?: boolean;
	passwordsAreZero?: boolean;
	passwordProtectionConfigured?: boolean;
	passwordProtectionRequired?: boolean;
	passwordCorrect?: boolean;
	passwordMismatch?: boolean;
	passwordProtected?: boolean;
	passwordsMatch?: boolean;
}

export interface LockStatusAnalysis {
	reservedBank?: string;
	reservedBankStatus?: string;
}

export interface SecurityAssessmentAnalysis {
	properlySecured?: boolean;
	passwordCorrect?: boolean;
	issues?: string[];
	passwordProtectionConfigured?: boolean;
	passwordProtectionRequired?: boolean;
}

export interface TagAnalysis {
	tagType?: string;
	mediaId?: string;
	epcBank?: EPCBankAnalysis;
	tidBank?: TidBankAnalysis;
	reservedBank?: ReservedBankAnalysis;
	lockStatus?: LockStatusAnalysis;
	securityAssessment?: SecurityAssessmentAnalysis;
}

export interface AnalyzeResult {
	success: boolean;
	epc?: string;
	analysis?: TagAnalysis;
	message?: string;
	error?: string;
}

export type RFIDEventType = 'added' | 'removed' | 'updated';

export interface RFIDEvent {
	type: RFIDEventType;
	item: RFIDData;
}

export type RFIDEventCallback = (event: RFIDEvent) => void;

export interface RFIDReader {
	/**
	 * Perform inventory to get all currently detected items (one-time snapshot)
	 * Corresponds to GET /inventory/{readerName}
	 */
	inventory(): Promise<RFIDData[]>;

	/**
	 * Start monitoring for items with live updates via callback
	 * @param callback Function called when items are added/removed/updated
	 * @returns Unsubscribe function
	 */
	startMonitoring(callback: RFIDEventCallback): () => void;

	/**
	 * Stop monitoring (if not using callback-based approach)
	 */
	stopMonitoring(): Promise<void>;

	/**
	 * Edit an existing tag's media ID
	 * Corresponds to POST /edit/{readerName}
	 * @param epc Current EPC of the tag
	 * @param mediaId New media ID to write
	 */
	edit(
		epc: string,
		mediaId: string
	): Promise<{
		success: boolean;
		mediaId?: string;
		oldEpc?: string;
		newEpc?: string;
		tagType?: string;
		message?: string;
	}>;

	/**
	 * Secure an item (activate EAS/alarm)
	 * Corresponds to POST /secure/{readerName}
	 * @param epc The tag EPC to secure
	 */
	secure(epc: string): Promise<{
		success: boolean;
		epc?: string;
		tagType?: string;
		message?: string;
		secured?: boolean;
	}>;

	/**
	 * Unsecure an item (deactivate EAS/alarm for checkout)
	 * Corresponds to POST /unsecure/{readerName}
	 * @param epc The tag EPC to unsecure
	 */
	unsecure(epc: string): Promise<{
		success: boolean;
		epc?: string;
		tagType?: string;
		message?: string;
		secured?: boolean;
	}>;

	/**
	 * Read detailed information from a specific tag
	 * @param epc The tag EPC to read
	 */
	read(epc: string): Promise<RFIDData | null>;

	/**
	 * Permanently disable an RFID tag (kill command)
	 * WARNING: This action is irreversible and will render the tag unusable
	 * @param epc The tag EPC to kill
	 */
	kill(epc: string): Promise<boolean>;

	/**
	 * Check if the reader is currently connected
	 */
	isConnected(): Promise<boolean>;

	/**
	 * Get reader status and diagnostics
	 */
	getStatus(): Promise<{
		connected: boolean;
		mode?: string;
		model?: string;
		antennas?: number[];
		antennaMask?: string;
		notificationActive?: boolean;
		notificationPort?: number;
		connectionStatus?: string;
		power?: number;
	}>;

	/**
	 * Initialize a new RFID tag with specific format and media ID
	 * Corresponds to POST /initialize/{readerName}
	 * @param mediaId The media ID to write
	 * @param format Tag format (DE290, CD290, DE6, DE290F, DE386)
	 * @param secured Whether to mark the tag as secured
	 */
	initialize(
		mediaId: string,
		format?: string,
		secured?: boolean
	): Promise<{
		success: boolean;
		epc?: string;
		format?: string;
		tagType?: string;
		pc?: string;
		mediaId?: string;
		secured?: boolean;
		message?: string;
	}>;

	/**
	 * Clear a tag (zero passwords, restore TID as EPC)
	 * Corresponds to POST /clear/{readerName}
	 * @param epc EPC of the tag to clear
	 */
	clear(epc: string): Promise<{
		success: boolean;
		newEpc?: string;
		oldEpc?: string;
		newPc?: string;
		tid?: string;
		message?: string;
	}>;

	/**
	 * Analyze a tag's memory and security status
	 * Corresponds to GET /analyze/{readerName}
	 * @param epc EPC of the tag to analyze
	 */
	analyze(epc: string): Promise<AnalyzeResult>;
}

/**
 * Information about an available RFID reader
 */
export interface ReaderInfo {
	/** Reader name/identifier */
	name: string;
	/** Reader IP address or connection string */
	address: string;
	/** Connection port */
	port: number;
	/** Reader mode/model */
	mode: string;
	/** Antenna indices available on the reader */
	antennas: number[];
	/** Antenna mask (hex string) */
	antennaMask: string;
	/** Whether the reader is currently connected */
	isConnected: boolean;
	/** Connection status description */
	connectionStatus: string;
	/** Whether notification mode is active */
	notificationActive: boolean;
	/** Notification listener port (if active) */
	notificationPort?: number;
}
