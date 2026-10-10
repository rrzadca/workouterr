import { createApp } from './app.ts';
import { loadConfig, type Config } from './config.ts';

let config: Config;
try {
  config = loadConfig(process.env);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

createApp().listen(config.port, (error) => {
  if (error) {
    throw error;
  }
  console.log(`API listening on http://localhost:${config.port}`);
});
