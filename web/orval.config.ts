import { defineConfig } from 'orval';

// Generates projects/api-client from the API's OpenAPI document: zod schemas, with the TypeScript types inferred from
// them. Regenerate with `npm run generate:api-client` after every API change.
export default defineConfig({
  apiClient: {
    input: { target: '../contracts/openapi/workouterr.json' },
    output: {
      target: 'projects/api-client/src/index.ts',
      client: 'zod',
      mode: 'single',
      // Removes files the document no longer produces.
      clean: true,
      // Formats with the workspace's .prettierrc, so the generated code passes `npm run format:check`.
      formatter: 'prettier',
      override: {
        // A named schema per component (HealthResponse), reused by the operation schemas (GetHealthResponse).
        zod: { generateReusableSchemas: true },
      },
    },
  },
});
