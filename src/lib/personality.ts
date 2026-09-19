export type Personality = { headline: string; summary: string; points: { label: string; title: string; text: string }[]; reminder: string; tags: string[] };
export function describePersonality(answers: { q: string; a: string }[]): Personality {
  const choices = answers.map(a => a.a);
  const social = choices.includes('在人群中释放光芒');
  const quiet = choices.includes('待在实验室里沉思');
  const act = choices.includes('立刻执行，忘了也没事');
  const wait = choices.includes('先存起来，等感觉对了再说');
  const rest = choices.includes('想想要不还是睡一觉');
  const logic = choices.includes('冷酷的数据推导');
  const intuition = choices.includes('玄学的直觉共鸣');
  const headline = social ? (act ? '你在行动和交流中找到方向。' : '和人聊一聊，你更容易想清楚。') : quiet ? (act ? '你喜欢自己拿主意，想到就试。' : '留点独处时间，你更容易理清思路。') : '先找到舒服的节奏，再决定怎么走。';
  const points = [
    { label: '怎么恢复状态', title: social ? '多见人' : quiet ? '留点独处' : '给自己留白', text: social ? '你选了在人群中释放光芒。遇到卡点，找聊得来的人说说，往往比闷头想更舒服。' : quiet ? '你选了独自沉思。需要专注时，少安排一点聚会，不用勉强自己一直在线。' : '还没有这一项答案。留意让自己放松的是交流还是独处。' },
    { label: '怎么开始做事', title: act ? '先试再说' : wait ? '想清楚再动' : rest ? '休息好了再来' : '从一小步开始', text: act ? '你愿意马上动手。把尝试做小一点，尽快看看行不行，比一下子投入太多更合适。' : wait ? '你习惯先把想法存起来。给它定个试做日期，别让好点子一直停在收藏夹里。' : rest ? '累的时候，你更想先缓一缓。休息后只选一件小事开始，不用一次补完所有进度。' : '选一件今天能完成的事，做完再决定下一步。' },
    { label: '怎么做决定', title: logic ? '先看事实' : intuition ? '相信感受' : '多看一眼依据', text: logic ? '你更依赖数据。信息够用就做决定，不必等到所有不确定都消失。' : intuition ? '你更依赖直觉。先记下感觉，再找一个事实核对，让判断更踏实。' : '遇到重要选择，写下理由，也看看自己的感受。' },
  ];
  return { headline, summary: '从你的选择看，这三件事值得记住。', points, reminder: act ? '一次只试一个想法，做完再开下一件。' : wait ? '给想做的事定个开始日期，别一直等状态。' : rest ? '先把作息照顾好，再一点点加回想做的事。' : '给重要的事留时间，不用把每天都排满。', tags: points.map(p => p.title) };
}

const YEAR_FOCUS: Record<string, { tag: string; advice: string }> = {
  正财: { tag: '把手头的事做成', advice: '先把已有项目做稳，谈清报酬、按时交付。别因为新点子多，就总把眼前的事放到一边。' },
  偏财: { tag: '给新机会一次小尝试', advice: '可以见新朋友、试新项目。先用一小段时间试水，觉得合适再继续投入。' },
  正官: { tag: '让别人看见你的靠谱', advice: '把职责和目标说清楚，按约定做完。想争取机会，就主动展示已经做出的成果。' },
  七杀: { tag: '先处理最难的一件事', advice: '别同时扛所有任务。挑最影响你的一个问题，拆小、处理，需要帮忙就开口。' },
  比肩: { tag: '找个能一起做事的人', advice: '有人一起推进，会更有动力。开始合作前，把谁做什么、怎样分工说清楚。' },
  劫财: { tag: '少一点消耗，多一点余地', advice: '花钱和答应别人之前，先停一下。把自己的时间、精力和预算留够。' },
  食神: { tag: '把生活过舒服一点', advice: '吃好、休息好，也做点单纯喜欢的事。有余力了，再把兴趣慢慢做成作品。' },
  伤官: { tag: '把想法做出来', advice: '挑一个点子，写出来、拍出来或做个样品。先给别人看，再慢慢改。' },
  正印: { tag: '学会一件真用得上的事', advice: '少囤资料，选一本书或一门课学下去。学完马上用一次，比收藏更多有帮助。' },
  偏印: { tag: '留点时间，想清楚自己要什么', advice: '少刷一点消息，把一直好奇的问题往深处看。想明白一点，就试着做一点。' },
};
export function yearFocus(shishen: string) { return YEAR_FOCUS[shishen] || YEAR_FOCUS.正印; }
