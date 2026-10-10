import { after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from './generated/prisma/client.ts';
import { createTestPrismaClient, resetDatabase } from './test-support/test-database.ts';

const prisma = createTestPrismaClient();

beforeEach(async () => {
  await resetDatabase(prisma);
});

after(async () => {
  await prisma.$disconnect();
});

test('weight columns are PostgreSQL numeric with 2 decimal places', async () => {
  const [column] = await prisma.$queryRaw<{ dataType: string; precision: number; scale: number }[]>`
    SELECT data_type AS "dataType", numeric_precision AS "precision", numeric_scale AS "scale"
    FROM information_schema.columns
    WHERE table_name = 'exercise' AND column_name = 'weight_step'`;
  assert.deepEqual(column, { dataType: 'numeric', precision: 5, scale: 2 });
});

test('a weight round-trips as an exact Decimal, never a float', async () => {
  const { id } = await prisma.exercise.create({
    data: { name: 'Bench press', weightStep: new Prisma.Decimal('41.25') },
  });

  const { weightStep } = await prisma.exercise.findUniqueOrThrow({ where: { id } });

  assert.ok(weightStep instanceof Prisma.Decimal, 'weightStep should be a Decimal, not a number');
  assert.equal(weightStep.toString(), '41.25');
  assert.ok(weightStep.equals('41.25'));
});

test('sums of weights stay exact (0.1 + 0.2 = 0.3, unlike floats)', async () => {
  await prisma.exercise.createMany({
    data: [
      { name: 'Curl', weightStep: new Prisma.Decimal('0.1') },
      { name: 'Raise', weightStep: new Prisma.Decimal('0.2') },
    ],
  });

  const { _sum } = await prisma.exercise.aggregate({ _sum: { weightStep: true } });

  assert.notEqual(0.1 + 0.2, 0.3); // the float problem this column type avoids
  assert.equal(_sum.weightStep?.toString(), '0.3');
});
