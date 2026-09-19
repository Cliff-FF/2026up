import test from 'node:test';
import assert from 'node:assert/strict';
import { monthDetail } from '../server/month-detail.mjs';
const config = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'public-test-key' };
async function run({ token = 'test-token', status = 'active', userStatus = 200, membershipStatus = 200, shishen = '正印', method = 'GET', settings = config, networkFailure = false } = {}) {
  const calls = [];
  let code, body;
  const req = { url: `/api/month-detail?shishen=${encodeURIComponent(shishen)}`, method, headers: token ? { authorization: `Bearer ${token}` } : {} };
  const res = { writeHead(value, headers) { code = value; assert.equal(headers['Cache-Control'], 'no-store'); }, end(value) { body = JSON.parse(value); } };
  await monthDetail(req, res, settings, async (url, options) => {
    calls.push(url); assert.equal(options.headers.Authorization, `Bearer ${token}`);
    if (networkFailure) throw new Error('offline');
    return url.endsWith('/auth/v1/user') ? new Response(JSON.stringify({ id: 'verified-user' }), { status: userStatus }) : new Response(JSON.stringify(status === 'none' ? [] : [{ status }]), { status: membershipStatus });
  });
  return { code, body, calls };
}
test('anonymous cannot read paid text', async () => { const r = await run({ token: null }); assert.equal(r.code, 401); assert.equal(r.calls.length, 0); assert.equal(r.body.actions, undefined); });
test('invalid or expired identity cannot read paid text', async () => { const r = await run({ userStatus: 401 }); assert.equal(r.code, 401); assert.equal(r.calls.length, 1); });
for (const status of ['none', 'pending', 'rejected']) test(`${status} membership cannot read paid text`, async () => { const r = await run({ status }); assert.equal(r.code, 403); assert.equal(r.body.actions, undefined); });
test('only server-verified active membership receives monthly detail', async () => { const r = await run(); assert.equal(r.code, 200); assert.equal(r.body.actions.length, 3); assert.match(r.calls[1], /user_id=eq.verified-user/); });
test('membership service failure fails closed', async () => { assert.equal((await run({ membershipStatus: 500 })).code, 503); assert.equal((await run({ networkFailure: true })).code, 503); });
test('missing configuration fails closed', async () => { assert.equal((await run({ settings: {} })).code, 503); });
test('invalid detail keys and unsupported methods rejected', async () => { assert.equal((await run({ shishen: '__proto__' })).code, 400); assert.equal((await run({ method: 'POST' })).code, 405); });
