// Paid copy remains on the server. Never ship this module in the browser bundle.
const guides = {
  正财: ['把积累变成看得见的成果。', ['列出本月最重要的一项交付，拆成每周可完成的小目标。', '整理收入与固定支出，给每笔额外开销留一天考虑。', '与合作方确认范围、时间和验收标准。'], '不要为了短期回报接下超出精力的任务。', '这个月，我完成了哪件能持续产生价值的事？'],
  偏财: ['给新机会留一点位置，也为尝试设好边界。', ['约一位不同领域的朋友聊聊，记录一个新思路。', '用一周做小规模尝试，先验证需求。', '提前设定时间和预算上限，月底决定是否继续。'], '不把偶然的好运当成必然的回报。', '哪一次小尝试，给了我新的可能？'],
  正官: ['让可靠被看见，让下一步更清晰。', ['选一个关键工作目标，与相关的人对齐预期。', '记录每周成果，主动发起一次进度沟通。', '整理作品或履历，为下一次机会做好准备。'], '不要用忙碌代替明确的交付。', '我希望别人因为什么记住我？'],
  七杀: ['把大挑战缩小，先推进最重要的一步。', ['列出当前最有压力的三件事，只选一件优先处理。', '把难题拆成一次能够完成的小动作。', '给高强度工作安排恢复时间，必要时主动求助。'], '不在情绪最强烈的时候做重大决定。', '我跨过了什么，又学会了什么？'],
  比肩: ['找到同行的人，让彼此成为助力。', ['邀请一个伙伴，一起设定本月的小目标。', '为合作明确分工、交付和沟通节奏。', '每周互相反馈一次，把进展变成持续动力。'], '不要因不好意思而省略边界和约定。', '什么样的合作让我更有能量？'],
  劫财: ['把时间、金钱和注意力留给真正重要的事。', ['检查订阅与重复支出，取消一项用不到的服务。', '为本月安排可自由支配的预算。', '练习拒绝一次超出能力或意愿的请求。'], '避免冲动消费和没有约定的借贷。', '我守住了哪一条重要的边界？'],
  食神: ['给生活留白，也给表达和创造留位置。', ['安排一次不以产出为目的的休息。', '做一道菜、拍一组照片或完成一件小作品。', '把让自己恢复精神的习惯放进每周日程。'], '不要把休息也变成必须完成的绩效。', '哪些小事让我重新喜欢自己的日常？'],
  伤官: ['把脑海里的点子，变成可以展示的作品。', ['从想法清单中挑一个，做最小可行版本。', '找三位可信的人收集具体反馈。', '调整一次后发布，记录实际回应。'], '表达不同意见时，先讲事实再讲判断。', '我让哪个想法真正落地了？'],
  正印: ['补充知识，也补充照顾自己的能力。', ['选一本书或一门课，每周固定学习两次。', '用自己的话整理一页笔记，试着教给别人。', '为睡眠和安静独处保留不被打扰的时间。'], '不要只收藏资料，却迟迟不开始。', '我学到的什么，可以用在当下？'],
  偏印: ['少一些噪声，让自己的判断慢慢清晰。', ['给信息输入做减法，暂停一个让你疲惫的来源。', '用一段完整的时间，研究一直好奇的问题。', '写下观察与假设，用一次小行动检验它。'], '避免在没有新信息时反复纠结同一个问题。', '哪条旧想法值得重新审视？'],
};
export async function monthDetail(req, res, config = process.env, fetcher = fetch) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname !== '/api/month-detail') return false;
  const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
  if (req.method !== 'GET') { send(405, { error: '请求方式不支持。' }); return true; }
  const base = config.VITE_SUPABASE_URL;
  const key = config.VITE_SUPABASE_ANON_KEY;
  if (!base || !key) { send(503, { error: '会员连接暂未配置，请稍后再试。' }); return true; }
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) { send(401, { error: '请先登录 FFCLIFF Pro 账户。' }); return true; }
  try {
    const options = { headers: { apikey: key, Authorization: auth }, signal: AbortSignal.timeout(10000), cache: 'no-store' };
    const userResponse = await fetcher(`${base}/auth/v1/user`, options);
    if (!userResponse.ok) { send(401, { error: '登录已过期，请重新登录。' }); return true; }
    const user = await userResponse.json();
    if (!user.id) throw new Error('Invalid user');
    const membershipResponse = await fetcher(`${base}/rest/v1/memberships?select=status&user_id=eq.${encodeURIComponent(user.id)}&limit=1`, options);
    if (!membershipResponse.ok) throw new Error('Membership unavailable');
    const rows = await membershipResponse.json();
    if (rows[0]?.status !== 'active') {
      send(403, { error: rows[0]?.status === 'pending' ? '付款申请审核中，通过后将自动打开本月解读。' : '尚未开通 Pro，请前往注册支付页完成申请。' }); return true;
    }
    const guide = Object.hasOwn(guides, url.searchParams.get('shishen')) ? guides[url.searchParams.get('shishen')] : null;
    if (!guide) { send(400, { error: '月份信息无效，请重新生成报告。' }); return true; }
    send(200, { intro: guide[0], actions: guide[1], avoid: guide[2], question: guide[3] });
  } catch { send(503, { error: '会员验证暂时不可用，请稍后重试。' }); }
  return true;
}
