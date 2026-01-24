export type LogLevel = 'silent' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

const levelOrder: Record<LogLevel, number> = {
	silent: 0,
	fatal: 10,
	error: 20,
	warn: 30,
	info: 40,
	debug: 50,
	trace: 60
};

export function isValidLogLevel(level: string | undefined): level is LogLevel {
	return !!level && (level as LogLevel) in levelOrder;
}

export function parseLogLevel(level: string | undefined, fallback: LogLevel): LogLevel {
	if (isValidLogLevel(level)) return level as LogLevel;
	return fallback;
}

export function shouldLog(target: LogLevel, current: LogLevel): boolean {
	return levelOrder[target] !== undefined && levelOrder[target] <= levelOrder[current];
}
