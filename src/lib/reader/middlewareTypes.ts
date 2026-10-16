/**
 * The middleware `type` values BookWaves recognises.
 *
 * This is the **single named extension point** for "which middleware types exist." Nothing
 * outside this file should hardcode a middleware type literal to decide whether a type is
 * known — `src/lib/reader/factory.ts`, `src/lib/server/resolveReader.ts` and
 * `src/lib/stores/reader-selection.ts` all defer to `isKnownMiddlewareType` /
 * `describeKnownMiddlewareTypes` below rather than each keeping their own copy of the list.
 *
 * `http` is the vendor-neutral type key: it reaches the exact same construction path as `feig`
 * (a reader built from the instance's `url` and `internal_url` — nothing in that path is
 * Feig-specific), so a third-party middleware speaking the same HTTP protocol can register
 * without claiming a vendor relationship it doesn't have. `feig` keeps working unchanged;
 * removing it is a decision for later, once no known installation still depends on the
 * vendor-named form. Adding a type also requires updating the reader construction switches.
 */
export const KNOWN_MIDDLEWARE_TYPES = ['mock', 'feig', 'http'] as const;

/**
 * Whether `type` (case-insensitively) is one of the middleware types BookWaves knows how to
 * build a reader for. Callers should normalise with `.toLowerCase()` themselves if they need
 * the normalised value afterwards; this function does it internally for the check itself.
 */
export function isKnownMiddlewareType(type: string): boolean {
	const normalized = type.toLowerCase();
	return (KNOWN_MIDDLEWARE_TYPES as readonly string[]).includes(normalized);
}

/** Human-readable list of recognised types, for error messages. */
export function describeKnownMiddlewareTypes(): string {
	return KNOWN_MIDDLEWARE_TYPES.join(', ');
}

/** The operator-facing message for a `middleware_instances` entry with an unrecognised `type`. */
export function unknownMiddlewareTypeMessage(middlewareId: string, type: string): string {
	return (
		`Middleware "${middlewareId}" has unrecognised type "${type}". ` +
		`Recognised types: ${describeKnownMiddlewareTypes()}.`
	);
}

/**
 * Thrown when a `middleware_instances` entry names a `type` BookWaves does not recognise.
 * This is a configuration error and must not be swallowed into an empty reader list — callers
 * should let it surface (or explicitly catch it and report it), not treat it like "reachable,
 * zero readers configured".
 */
export class UnknownMiddlewareTypeError extends Error {
	readonly middlewareId: string;
	readonly type: string;

	constructor(middlewareId: string, type: string) {
		super(unknownMiddlewareTypeMessage(middlewareId, type));
		this.name = 'UnknownMiddlewareTypeError';
		this.middlewareId = middlewareId;
		this.type = type;
	}
}
