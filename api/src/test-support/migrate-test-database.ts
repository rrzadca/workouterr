// Runs before `npm test`: creates the test database if needed and applies every migration to it.
import { execFileSync } from 'node:child_process';
import { testDatabaseUrl } from './test-database.ts';

execFileSync('prisma', ['migrate', 'deploy'], {
  stdio: 'inherit',
  // prisma.config.ts reads DATABASE_URL, and a variable set here wins over the one in .env
  env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
});
