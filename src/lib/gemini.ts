export interface BaZiCharacter {
  pillar: string;
  stem: string;
  branch: string;
  stemShishen: string;
  branchShishen: string;
  meaning: string;
}

export interface BaZiResult {
  vibeLabel: string;
  prediction: string;
  dayMaster: string;
  eightCharacters: BaZiCharacter[];
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

/**
 * 常用城市经度表 (用于真太阳时校准)
 */
const CITY_LONGITUDE: Record<string, number> = {
  "北京": 116.4, "上海": 121.4, "广州": 113.2, "深圳": 114.0, "杭州": 120.1,
  "成都": 104.0, "重庆": 106.5, "武汉": 114.3, "南京": 118.7, "西安": 108.9,
  "天津": 117.2, "苏州": 120.6, "郑州": 113.6, "长沙": 112.9, "东莞": 113.7,
  "沈阳": 123.4, "青岛": 120.3, "合肥": 117.2, "佛山": 113.1, "宁波": 121.5,
  "昆明": 102.7, "福州": 119.3, "无锡": 120.3, "厦门": 118.1, "哈尔滨": 126.6,
};

/**
 * 获取真太阳时校准后的时间 (分钟)
 */
function getTrueSolarTime(standardHour: number, standardMinute: number, city: string): { h: number, m: number } {
  const lon = CITY_LONGITUDE[city] || 120.0; // 默认北京时间所在经度
  const offsetMinutes = (lon - 120) * 4;
  let totalMinutes = standardHour * 60 + standardMinute + offsetMinutes;
  
  if (totalMinutes < 0) totalMinutes += 1440;
  if (totalMinutes >= 1440) totalMinutes -= 1440;
  
  return {
    h: Math.floor(totalMinutes / 60),
    m: Math.floor(totalMinutes % 60)
  };
}

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 精准儒略日计算
 */
function getJulianDay(year: number, month: number, day: number, hour: number = 12, minute: number = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5 + (hour / 24) + (minute / 1440);
}

/**
 * 简易立春/节气计算
 */
function getSolarTermDay(year: number, month: number): number {
  // 每个月对应的节气近似日期 (小寒, 立春, 惊蛰, 清明, 立夏, 芒种, 小暑, 立秋, 白露, 寒露, 立冬, 大雪)
  const baseDays = [0, 5, 4, 5, 5, 5, 6, 7, 7, 8, 8, 7, 7];
  let d = baseDays[month];
  
  // 针对核心节气(立春/清明等)进行年份偏移校准
  const offset = (year % 100 - 1) / 4;
  if (month === 2) { // 立春
     d = Math.floor((year % 100) * 0.2422 + 3.87) - Math.floor(offset);
  } else if (month === 4) { // 清明
     d = Math.floor((year % 100) * 0.2422 + 4.81) - Math.floor(offset);
  } else if (month === 1) { // 小寒
     d = Math.floor((year % 100) * 0.2422 + 5.40) - Math.floor(offset);
  }
  return d;
}

const SIXTY_GANZHI = Array.from({ length: 60 }, (_, i) => STEMS[i % 10] + BRANCHES[i % 12]);

// 地支主气对应的天干
const BRANCH_PRIMARY_STEM: Record<string, string> = {
  "子": "癸", "丑": "己", "寅": "甲", "卯": "乙", "辰": "戊", "巳": "丙", 
  "午": "丁", "未": "己", "申": "庚", "酉": "辛", "戌": "戊", "亥": "壬"
};

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
  gender: string,
  city: string,
  quizAnswers: { q: string; a: string }[]
): Promise<BaZiResult> {
  // 模拟计算延迟提升质感
  await new Promise(resolve => setTimeout(resolve, 2000));

  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const y = parseInt(yearStr);
  const m = parseInt(monthStr);
  const d = parseInt(dayStr);
  const [hStr, minStr] = timeStr.split(':');
  
  // 1. 真太阳时校准
  const solarTime = getTrueSolarTime(parseInt(hStr), parseInt(minStr), city);
  const hour = solarTime.h;

  // 2. 年柱 校准 (以立春为界)
  const liChunDay = getSolarTermDay(y, 2);
  let baziYear = y;
  if (m < 2 || (m === 2 && d < liChunDay)) {
    baziYear = y - 1;
  }
  const yrIndex = (baziYear - 4) % 60;
  const yearPillarIndex = yrIndex < 0 ? yrIndex + 60 : yrIndex;
  const yearPillar = SIXTY_GANZHI[yearPillarIndex];
  const yrStemIndex = STEMS.indexOf(yearPillar[0]);

  // 3. 日柱 校准
  let jd = getJulianDay(y, m, d, parseInt(hStr), parseInt(minStr));
  if (hour >= 23) {
    jd += 1;
  }
  const dayGZIndex = (Math.floor(jd + 0.5) + 49) % 60;
  const dayPillar = SIXTY_GANZHI[dayGZIndex < 0 ? dayGZIndex + 60 : dayGZIndex];
  const dayStem = dayPillar[0];
  const dayBranch = dayPillar[1];
  const dayStemIndex = STEMS.indexOf(dayStem);

  // 4. 月柱 校准 (核心逻辑：精准定位月令偏移)
  let solarMonth = m;
  if (d < getSolarTermDay(y, m)) {
    solarMonth -= 1;
  }
  
  // 映射到月令 (1=寅, 2=卯... 12=丑, 11=子)
  const baziMonthIndex = (solarMonth - 2 + 12) % 12 + 1;
  const mStemIndex = ((yrStemIndex % 5) * 2 + 2 + (baziMonthIndex - 1)) % 10;
  const mBranchIndex = (baziMonthIndex + 1) % 12; // 寅对应Index 2
  const monthPillar = STEMS[mStemIndex < 0 ? mStemIndex + 10 : mStemIndex] + BRANCHES[mBranchIndex];

  // 5. 时柱
  const hBranchIndex = Math.floor((hour + 1) / 2) % 12;
  const hStemIndex = ((dayStemIndex % 5) * 2 + hBranchIndex) % 10;
  const hourPillar = STEMS[hStemIndex < 0 ? hStemIndex + 10 : hStemIndex] + BRANCHES[hBranchIndex];

  // 综合种子因子
  const cityCode = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = Math.floor(jd) + hBranchIndex + cityCode;

  // 性格权重计算
  const scoreBase = 84;
  const finalScore = Math.min(99, scoreBase + (seed % 10) + quizAnswers.length);

  const shishenData = SHISHEN_MAP[dayStem] || SHISHEN_MAP["甲"];
  
  const genderMod = gender === "女" ? "坤造·内敛温润" : "乾造·刚毅果敢";

  const getShishen = (character: string) => {
    return shishenData[character] || (BRANCH_PRIMARY_STEM[character] ? shishenData[BRANCH_PRIMARY_STEM[character]] : "空");
  };

  const createPillar = (pillarName: string, gz: string, meaning: string): BaZiCharacter => ({
    pillar: pillarName,
    stem: gz[0],
    branch: gz[1],
    stemShishen: shishenData[gz[0]] || "比肩",
    branchShishen: getShishen(gz[1]),
    meaning
  });

  return {
    vibeLabel: VIBE_LABELS[seed % VIBE_LABELS.length],
    prediction: `${genderMod}。这份基于 ${city} (${solarTime.h}:${solarTime.m.toString().padStart(2, '0')} 真太阳时) 的能量解析显示：${PREDICTIONS[seed % PREDICTIONS.length]}`,
    dayMaster: `${dayStem}属${dayBranch}之命 (日元)`,
    eightCharacters: [
      createPillar("年柱", yearPillar, "代表先天根基与家族潜能。"),
      createPillar("月柱", monthPillar, "主导事业格局与当下的社会能量。"),
      createPillar("日柱", dayPillar, "核心人设，你灵魂最底层的色调。"),
      createPillar("时柱", hourPillar, "代表未来输出与最终的成就归宿。")
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
      directionTag: STRATEGIES[seed % STRATEGIES.length].tag,
      coreAdvice: STRATEGIES[seed % STRATEGIES.length].advice
    },
    score: finalScore,
    tags: ["硬核", gender === "女" ? "内秀" : "勇武", "人间清醒"].concat(seed % 3 === 0 ? ["潜力股"] : ["高能"])
  };
}

