import * as zod from 'zod';

const configSchema = zod.object({
  DATABASE_URL: zod.url({ protocol: /^postgres(ql)?$/ }),
  PORT: zod.coerce.number().int().min(1).max(65535).default(3000),
});

export interface Config {
  databaseUrl: string;
  port: number;
}

export function loadConfig(environment: NodeJS.ProcessEnv): Config {
  const result = configSchema.safeParse(environment);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid configuration:\n${problems.join('\n')}`);
  }
  return {
    databaseUrl: result.data.DATABASE_URL,
    port: result.data.PORT,
  };
}
