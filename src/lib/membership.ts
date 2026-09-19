const env = import.meta.env;
export const portalUrl = env.VITE_FFCLIFF_PRO_URL || 'https://ffcliff.com/#membership-portal';
const sessionKey = 'ffcliff-membership-session';
export function getToken(): string | null {
  try { return JSON.parse(localStorage.getItem(sessionKey) || 'null')?.access_token || null; }
  catch { return null; }
}
export async function login(email: string, password: string) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) throw new Error('会员连接暂未配置，请稍后再试。');
  const response = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error('登录失败，请检查邮箱、密码与邮箱验证状态。');
  localStorage.setItem(sessionKey, JSON.stringify({ access_token: data.access_token, user: data.user }));
}
export type MonthDetail = { intro: string; meaning: string; focus: string; actions: string[]; avoid: string; question: string };
export async function loadDetail(shishen: string): Promise<MonthDetail> {
  const token = getToken();
  if (!token) throw new Error('请用 FFCLIFF Pro 的同一账户登录，验证会员资格。');
  const response = await fetch(`/api/month-detail?shishen=${encodeURIComponent(shishen)}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || '验证暂时失败，请稍后重试。');
  return data;
}
