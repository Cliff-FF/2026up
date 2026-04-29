export interface BaZiResult {
  vibeLabel: string;
  prediction: string;
  dayMaster: string;
  eightCharacters: {
    pillar: string;
    stem: string;
    branch: string;
    shishen: string;
    meaning: string;
  }[];
  monthlyEnergy: {
    month: string;
    dateRange: string;
    element: string;
    shishen: string;
    shishenMeaning: string;
    direction: string;
    vibe: string;
  }[];
  yearlyStrategy: {
    domesticCities: { name: string; score: string; reason: string }[];
    intlCities: { name: string; score: string; reason: string }[];
    directionTag: string;
    coreAdvice: string;
  };
  score: number;
  tags: string[];
}

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const SIXTY_GANZHI = Array.from({ length: 60 }, (_, i) => STEMS[i % 10] + BRANCHES[i % 12]);
const ELEMENTS = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];

const SHISHEN_MAP: Record<string, Record<string, string>> = {
  "甲": { "甲": "比肩", "乙": "劫财", "丙": "食神", "丁": "伤官", "戊": "偏财", "己": "正财", "庚": "七杀", "辛": "正官", "壬": "偏印", "癸": "正印" },
  "乙": { "乙": "比肩", "甲": "劫财", "丁": "食神", "丙": "伤官", "己": "偏财", "戊": "正财", "辛": "七杀", "庚": "正官", "癸": "偏印", "壬": "正印" },
  "丙": { "丙": "比肩", "丁": "劫财", "戊": "食神", "己": "伤官", "庚": "偏财", "辛": "正财", "壬": "七杀", "癸": "正官", "甲": "偏印", "乙": "正印" },
  "丁": { "丁": "比肩", "丙": "劫财", "己": "食神", "戊": "伤官", "辛": "偏财", "庚": "正财", "癸": "七杀", "壬": "正官", "乙": "偏印", "甲": "正印" },
  "戊": { "戊": "比肩", "己": "劫财", "庚": "食神", "辛": "伤官", "壬": "偏财", "癸": "正财", "甲": "七杀", "乙": "正官", "丙": "偏印", "丁": "正印" },
  "己": { "己": "比肩", "戊": "劫财", "辛": "食神", "庚": "伤官", "癸": "偏财", "壬": "正财", "乙": "七杀", "甲": "正官", "丁": "偏印", "丙": "正印" },
  "庚": { "庚": "比肩", "辛": "劫财", "壬": "食神", "癸": "伤官", "甲": "偏财", "乙": "正财", "丙": "七杀", "丁": "正官", "戊": "偏印", "己": "正印" },
  "辛": { "辛": "比肩", "庚": "劫财", "癸": "食神", "壬": "伤官", "乙": "偏财", "甲": "正财", "丁": "七杀", "丙": "正官", "己": "偏印", "戊": "正印" },
  "壬": { "壬": "比肩", "癸": "劫财", "甲": "食神", "乙": "伤官", "丙": "偏财", "丁": "正财", "戊": "七杀", "己": "正官", "庚": "偏印", "辛": "正印" },
  "癸": { "癸": "比肩", "壬": "劫财", "乙": "食神", "甲": "伤官", "丁": "偏财", "丙": "正财", "己": "七杀", "戊": "正官", "辛": "偏印", "庚": "正印" },
};

/**
 * 精准儒略日计算 (用于校准八字)
 */
function getJulianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

const VIBE_LABELS = [
  "脆皮打工人", "高能小陀螺", "深海哲学家", "发疯型天才", "赛博佛系少年", 
  "人间清醒剂", "低耗能摸鱼家", "硬核浪漫型", "高频社交达人", "孤勇执行者",
  "进击的斜杠青年", "隐形显眼包", "精神股东", "恋爱脑绝缘体", "情绪过山车"
];

const PREDICTIONS = [
  "你的气场中带着一种‘我不卷，但谁也别想卷我’的韧性。2026年是你的觉醒年。",
  "你习惯在混乱中寻找秩序，外冷内热。未来的周期里，你的直觉将成为最强的Buff。",
  "天生的策略家，你的脑回路通常比别人快两个版本。2026年适合开启‘财富加速’模式。",
  "拥有极强的共情能力，但容易被外界噪音干扰。今年你需要学会‘关机’和‘重启’。",
  "你的生命力来自于破坏与重建，不破不立。未来的地图里，变换赛道会有奇效。"
];

const STRATEGIES = [
  { tag: "低位潜伏", advice: "拒绝一切无效社交，在安静处打磨你的核心武器。" },
  { tag: "疯狂输出", advice: "这是你的主场，不要害羞，把你的所有创意都怼到老板脸上。" },
  { tag: "跨界套利", advice: "尝试你从未接触过的领域，哪怕是去摆摊卖红薯也会有惊喜。" },
  { tag: "防御性理财", advice: "现金为王，不要被那些听起来很高级的所谓‘赛道’忽悠。" },
  { tag: "身心灵重塑", advice: "放下手机，去爬山，去呼吸，去感受那些真实存在的东西。" }
];

export async function analysisPersonality(
  birthDate: string,
  timeStr: string,
  quizAnswers: { q: string; a: string }[]
): Promise<BaZiResult> {
  // 模拟计算延迟提升质感
  await new Promise(resolve => setTimeout(resolve, 2000));

  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const y = parseInt(yearStr);
  const m = parseInt(monthStr);
  const d = parseInt(dayStr);
  const hour = parseInt(timeStr.split(':')[0]);

  // 1. 年柱 (以立春为界，此处简化以公历年计)
  const yrIndex = (y - 4) % 60;
  const yearPillar = SIXTY_GANZHI[yrIndex < 0 ? yrIndex + 60 : yrIndex];

  // 2. 日柱 (核心校准：1993-09-11 必须为 乙未)
  const jd = getJulianDay(y, m, d);
  const dayGZIndex = Math.floor(jd + 49) % 60;
  const dayPillar = SIXTY_GANZHI[dayGZIndex];
  const dayStem = dayPillar[0];
  const dayBranch = dayPillar[1];

  // 3. 月柱 (基于年干和月份)
  const monthBranchIndex = (m + 1) % 12;
  const monthStemIndex = ((y % 5) * 2 + Math.floor(m * 2 / 2.5)) % 10; // 简易算法
  const monthPillar = STEMS[monthStemIndex] + BRANCHES[monthBranchIndex];

  // 4. 时柱
  const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
  const hourStemIndex = ((dayGZIndex % 5) * 2 + Math.floor((hour + 1) / 2)) % 10;
  const hourPillar = STEMS[hourStemIndex] + BRANCHES[hourBranchIndex];

  // 性格权重计算
  const scoreBase = 80;
  const dayOffset = Math.floor(jd);
  const finalScore = Math.min(99, scoreBase + (dayOffset % 10) + quizAnswers.length);

  const shishenData = SHISHEN_MAP[dayStem] || SHISHEN_MAP["甲"];

  return {
    vibeLabel: VIBE_LABELS[dayOffset % VIBE_LABELS.length],
    prediction: PREDICTIONS[dayOffset % PREDICTIONS.length],
    dayMaster: `${dayStem}属${dayBranch}之命 (日元)`,
    eightCharacters: [
      { pillar: "年", stem: yearPillar[0], branch: yearPillar[1], shishen: shishenData[yearPillar[0]] || "命气", meaning: "代表你的先天基因与祖荫Buff。" },
      { pillar: "月", stem: monthPillar[0], branch: monthPillar[1], shishen: shishenData[monthPillar[0]] || "事业", meaning: "职场副本的主导能量，搞钱的姿势。" },
      { pillar: "日", stem: dayPillar[0], branch: dayPillar[1], shishen: "自我", meaning: "核心人设，最真实的底色。" },
      { pillar: "时", stem: hourPillar[0], branch: hourPillar[1], shishen: shishenData[hourPillar[0]] || "归宿", meaning: "最终的输出结果与个人作品。" }
    ],
    monthlyEnergy: Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}月`,
      dateRange: `2026.${(i+1).toString().padStart(2, '0')}.01 - 2026.${(i+1).toString().padStart(2, '0')}.30`,
      element: ELEMENTS[i % 10],
      shishen: shishenData[STEMS[i % 10]] || "偏官",
      shishenMeaning: i % 3 === 0 ? "这是你的能量爆发期" : "建议进入省电模式",
      direction: i % 4 === 0 ? "疯狂搞钱" : i % 4 === 1 ? "低调摸鱼" : i % 4 === 2 ? "拒绝内耗" : "直接开摆",
      vibe: i % 2 === 0 ? "环境高度兼容" : "可能有Bug，建议避坑"
    })),
    yearlyStrategy: {
      domesticCities: [
        { name: "成都", score: "96", reason: "慢节奏磁场，修复精神内耗。" },
        { name: "上海", score: "91", reason: "高频共振，适合开启新项目。" }
      ],
      intlCities: [
        { name: "京都", score: "94", reason: "木气充足，深度清理缓存。" },
        { name: "冰岛", score: "89", reason: "强力脱敏，重塑意志力。" }
      ],
      directionTag: STRATEGIES[dayOffset % STRATEGIES.length].tag,
      coreAdvice: STRATEGIES[dayOffset % STRATEGIES.length].advice
    },
    score: finalScore,
    tags: ["硬核", "不卷", "人间清醒"].concat(dayOffset % 3 === 0 ? ["潜力股"] : ["高能"])
  };
}
