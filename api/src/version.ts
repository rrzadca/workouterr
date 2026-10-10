import packageJson from '../package.json' with { type: 'json' };

/** The API version from api/package.json, reported by GET /api/health. */
export const appVersion: string = packageJson.version;
