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

createApp({ prisma, version: appVersion }).listen(config.port, (error) => {
  if (error) {
    throw error;
  }
  console.log(`API ${appVersion} listening on http://localhost:${config.port}`);
});
