import { monthDetail } from '../server/month-detail.mjs';

// Vercel's Node runtime invokes this file for /api/month-detail.
// The membership check remains server-side; the Supabase anon key is read from
// the Vercel project environment and is never hard-coded into the function.
export default async function handler(req, res) {
  await monthDetail(req, res, process.env);
}
