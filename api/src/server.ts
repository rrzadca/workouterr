import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.ts';
import { loadConfig, type Config } from './config.ts';
import { createPrismaClient } from './database.ts';
import { appVersion } from './version.ts';

let config: Config;
try {
  config = loadConfig(process.env);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const prisma = createPrismaClient(config.databaseUrl);

// The deploy puts index.html next to app.js, outside public/, so nginx never serves it and every page load gets it
// from the app with no-cache. Locally there is no file and ng serve serves the Angular app.
const indexHtmlPath = fileURLToPath(new URL('../public_nodejs/index.html', import.meta.url));

createApp({
  prisma,
  version: appVersion,
  indexHtmlPath: existsSync(indexHtmlPath) ? indexHtmlPath : undefined,
}).listen(config.port, (error) => {
  if (error) {
    throw error;
  }
  console.log(`API ${appVersion} listening on http://localhost:${config.port}`);
});
