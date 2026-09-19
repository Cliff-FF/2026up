import test from 'node:test';
import assert from 'node:assert/strict';
import { analysisPersonality } from '../src/lib/gemini.ts';
test('calendar has twelve correctly numbered months including cross-year December', async () => {
  const result = await analysisPersonality('1990-06-15', '12:00', '女', '上海', []);
  assert.deepEqual(result.monthlyEnergy.map(m => m.monthNumber), Array.from({ length: 12 }, (_, i) => i + 1));
  assert.equal(result.monthlyEnergy[0].month, '己丑');
  assert.match(result.monthlyEnergy[0].dateRange, /01.05 - 02.03/);
  assert.match(result.monthlyEnergy[11].dateRange, /2027.01.04/);
  assert.ok(result.monthlyEnergy.every(m => m.direction.length === 4));
});
