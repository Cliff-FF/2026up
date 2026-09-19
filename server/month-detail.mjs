// Paid copy remains on the server. Never ship this module in the browser bundle.
const guide = (intro, meaning, focus, actions, avoid, question) => ({ intro, meaning, focus, actions, avoid, question });
const guides = {
  正财: guide('这个月，更容易把心思放在收入、开销和手头的正事上。', '正财，说白了就是一分耕耘一分收获：把事做好，拿到应得的回报。', '先把已有的活做好，把该收的钱收回来。', ['做完最重要的一项交付。', '报酬、期限提前说清楚。', '看一眼账单，砍掉一笔没必要的支出。'], '别一边嫌钱难赚，一边为便宜买一堆用不上的东西。', '这个月，哪件事带来了实在的回报？'),
  偏财: guide('这个月，更容易被新项目、新朋友或额外收入的点子吸引。', '偏财，讲的是固定安排之外的机会。可以留意，但不等于会有横财。', '多看看新路子，先小试，别一下子押太多。', ['找人聊一个新想法。', '选一个点子，花一周试试。', '先定好最多投入多少时间和钱。'], '听起来回报太轻松的事，先多问两句。', '哪个新机会值得继续，哪个该停了？'),
  正官: guide('这个月，工作里的责任、规则和别人对你的期待更值得留意。', '正官，可以理解成“把自己的角色做好”：守约、有交代，让人放心。', '把事情做稳，也让别人知道你做成了什么。', ['和负责人确认最重要的目标。', '有进展就说，有困难早点提。', '整理一份拿得出手的成果。'], '别默默接下所有事，忙不过来要说。', '哪件事让别人更愿意信任我？'),
  七杀: guide('这个月，容易有被催着往前走的感觉：事情急，压力也更明显。', '七杀，讲的是压力和挑战。名字听着凶，不等于会发生坏事。', '先解决最棘手的一件事，别同时硬扛所有问题。', ['找出最让你头疼的那件事。', '把它拆成今天能做的一步。', '卡住就找人帮忙，别死撑。'], '被催急了，也别在气头上做大决定。', '我解决了什么，还是只是一直在忙？'),
  比肩: guide('这个月，更容易在意“我想怎么做”，也更容易和同伴较劲。', '比肩，像是和你并肩的人：能互相支持，也可能互相比一比。', '找个靠谱的人一起做事，分工先说清。', ['约一个能互相督促的伙伴。', '说清各自负责哪部分。', '每周碰一次进度，不用天天盯着。'], '别把合作变成谁更厉害的比赛。', '和谁一起做事，我更轻松也更有劲？'),
  劫财: guide('这个月，人情往来、临时开销和跟风消费，可能更容易占掉你的预算。', '劫财，提醒的是资源分配和竞争。不是“注定破财”，而是要看好自己的边界。', '钱别花太快，忙别帮太满，先给自己留够。', ['给本月花销定个上限。', '大额消费放一晚再决定。', '不想答应的邀约，早点婉拒。'], '别为了合群，答应自己承担不起的花费。', '哪些钱和精力，其实可以省下来？'),
  食神: guide('这个月，更容易想吃点好的、过得舒服些，也想做点自己喜欢的事。', '食神，讲的是享受、表达和滋养。简单说，就是先把自己照顾好。', '把日常过舒服，再做一点有趣的东西。', ['认真吃一顿饭，早点睡一晚。', '给喜欢的爱好留一个下午。', '做点小作品，先让自己开心。'], '休息很好，但别用“放松”拖掉一直该处理的事。', '哪件小事让我觉得，日子还挺好的？'),
  伤官: guide('这个月，更容易有新点子，也更想说出自己的看法。', '伤官，讲的是表达和打破老办法。用好了是创作，急了容易说话太冲。', '把点子做出来，比争论谁对更有用。', ['挑一个想法，先做个粗糙版本。', '给三个人看看，听听哪里不明白。', '改一次就发出来，别无限打磨。'], '对事有意见就说事，别顺手否定一个人。', '我留下了作品，还是只留下了争论？'),
  正印: guide('这个月，更容易想学习、找人请教，或给自己一点休息和支持。', '正印，像老师、经验和后援：先吸收，再慢慢长出自己的本事。', '选一件真用得上的东西学，学完马上试一次。', ['一本书或一门课，选一个就够。', '有不懂的，找靠谱的人问。', '把学到的一点用在眼前的事上。'], '收藏不等于学会，也别一直等别人给答案。', '我学会了什么，又真的用上了什么？'),
  偏印: guide('这个月，更容易想一个人待着，钻研小众兴趣，或反复琢磨一个问题。', '偏印，讲的是独立思考和不走寻常路。能想得深，也容易想得太多。', '给自己一点安静，但别只在脑子里打转。', ['关掉一个让你分心的信息来源。', '留一小时研究真正好奇的事。', '想出一点就记下来，找机会试试。'], '同一个问题想了好几遍还没新发现，就先停一停。', '这次独处让我更清楚了，还是更纠结了？'),
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
    send(200, guide);
  } catch { send(503, { error: '会员验证暂时不可用，请稍后重试。' }); }
  return true;
}
