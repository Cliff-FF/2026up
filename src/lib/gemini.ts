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
  "你的气场中带着一种‘我不卷，但谁也别想卷我’的硬核韧性。这不仅是性格使然，更是你八字中日主自坐强根的防御机制。在2026年丙午流年的纯火冲炼下，你那种深藏不露、伺机而动的意志力将被彻底激活，这是一种‘不破不立’的高能觉醒。不要畏惧当下的混沌，你其实更擅长在秩序重建的过程中，寻找那个最精确的权力切入点，并完成赛道的绝对反杀。",
  "你习惯在混乱中寻找深层秩序，这种外冷内热的特质源于你对环境能量分布的极度敏感。未来的周期里，由于流年月日时四柱的深度咬合，你的直觉将从辅助工具升级为生存核心Buff。2026年的极旺火气，正在试图蒸发掉你性格中多余的焦虑，转而凝练出更纯粹的执行力。此时你需要做的不是盲目奔跑，而是学会信任那些突如其来的‘直觉灵光’，那是你的元神在混乱中给出的最优解。",
  "作为天生的策略家，你的脑回路通常比周围人快出两个版本，这源于你八字中食伤与财星的精妙平衡。2026年丙午年，天干丙火红艳透出，预示着你之前的长期积累将迎来爆发式的‘财富加速’窗口。这种财富不仅仅是账面数字，更是社会关系的重组与个人影响力的跨维度提升。在当下的复杂环境中，你那种‘降维打击’的商业逻辑将成为你最硬核的逆风翻盘通行证。",
  "你拥有极强的共情能力与情感捕获力，这使你八字中的‘印星’磁场异常显著。然而，由于你的能量场过于通透，也极易被外界嘈杂的低频噪音干扰，导致精神内耗严重。在2026这个转折点上，你最需要掌握的技能不是‘链接’，而是‘断联’。学会通过专注某一领域的深度探索来实现自我的‘系统重启’。在丙火的热力照耀下，你的每一次退守，本质上都是在为接下来的高能爆发积蓄能量。",
  "你的生命力来自于‘破坏与重建’的无限循环，这种不羁的灵魂底色让你在任何时代都具有极高的辨识度。在2026年，当大环境开始进行深层洗牌时，你那‘不走寻常路’的天性将正式从异类转变为先锋。不要留恋旧时代的旧逻辑，勇于尝试变换赛道，甚至去打破你自己亲手建立的舒适区。丙午流年的火之文明正在快速迭代，这实际上是在呼唤像你这样敢于进行自我重塑、具备极强环境抗性的孤勇者。"
];

const STRATEGIES = [
  { tag: "低位潜伏", advice: "拒绝一切低效的无效社交，在深水区安静地打磨你的核心生存武器。沉默是本阶段你最强大的能量伪装，待丙午之火烧过，便是你破壳而出的时刻。" },
  { tag: "疯狂输出", advice: "当下的能量场正为你提供源源不断的燃料，这是你的主场。不要害羞，把你的所有创意和方案都大胆地推向前台，你的高频振动将吸引到最精准的贵人助力。" },
  { tag: "跨界套利", advice: "尝试你从未接触过的陌生领域，哪怕是利用业余时间去探索某个看似不相关的硬核赛道，也会产生奇妙的化学反应。2026年的机遇往往藏在那些被他人忽视的垂直裂缝中。" },
  { tag: "防御性理财", advice: "现金流的确定性高于一切收益蓝图。不要被那些听起来宏大而虚幻的赛道忽悠，聚焦于那些可触达、低杠杆、高流转的本地化项目。在这一轮周期里，守成即是进攻。" },
  { tag: "身心灵重塑", advice: "放下那些让你焦虑的数字信息，去高山，去旷野，去呼吸那些能过滤空气中浮躁气息的新鲜氧气。你当前的能量损耗主要源于与物理世界的断联，回归本原才能重获掌控感。" }
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

  // 6. 2026 丙午年 12个月流月能量精准校准
  const MONTH_DATES_2026 = [
    { name: "庚寅", range: "02.04 - 03.04", stem: "庚" },
    { name: "辛卯", range: "03.05 - 04.03", stem: "辛" },
    { name: "壬辰", range: "04.04 - 05.04", stem: "壬" },
    { name: "癸巳", range: "05.05 - 06.04", stem: "癸" },
    { name: "甲午", range: "06.05 - 07.06", stem: "甲" },
    { name: "乙未", range: "07.07 - 08.06", stem: "乙" },
    { name: "丙申", range: "08.07 - 09.06", stem: "丙" },
    { name: "丁酉", range: "09.07 - 10.07", stem: "丁" },
    { name: "戊戌", range: "10.08 - 11.06", stem: "戊" },
    { name: "己亥", range: "11.07 - 12.06", stem: "己" },
    { name: "庚子", range: "12.07 - 01.04", stem: "庚" },
    { name: "辛丑", range: "01.05 - 02.03", stem: "辛" }
  ];

  const getShishenMeaning = (shishen: string) => {
    const vibes: Record<string, string> = {
      "正财": "经济稳健，利于务实开拓。",
      "偏财": "财气横溢，适合捕捉先机。",
      "正官": "贵人相助，事业平稳上升。",
      "七杀": "变动中求生，谨言慎行。",
      "比肩": "人脉聚合，利于团队协作。",
      "劫财": "注意消耗，适度收敛锋芒。",
      "食神": "才华横溢，享受生活点滴。",
      "伤官": "创新活跃，警惕口舌是非。",
      "正印": "得道多助，利于学习深造。",
      "偏印": "思维独到，适合深度反思。"
    };
    return vibes[shishen] || "平稳运行。";
  };

  const getElement = (stem: string) => {
    const idx = STEMS.indexOf(stem);
    return ELEMENTS[idx] || "未知";
  };

  const getMonthlyDirection = (shishen: string) => {
    const directions: Record<string, string> = {
      "正财": "踏实搞钱",
      "偏财": "横财就手",
      "正官": "事业开挂",
      "七杀": "硬核突围",
      "比肩": "组队快跑",
      "劫财": "守好荷包",
      "食神": "开心干饭",
      "伤官": "脑洞大开",
      "正印": "原地回血",
      "偏印": "古灵精怪"
    };
    return directions[shishen] || "顺势顺心";
  };

  const getMonthlyVibe = (shishen: string, stem: string) => {
    const isHarmonious = STEMS.indexOf(stem) % 2 === STEMS.indexOf(dayStem) % 2;
    const vibes: Record<string, string> = {
      "正财": isHarmonious ? "钱袋鼓鼓" : "辛苦搬砖",
      "偏财": isHarmonious ? "好运敲门" : "理智消费",
      "正官": isHarmonious ? "贵人罩你" : "按部就班",
      "七杀": isHarmonious ? "逆风翻盘" : "低调避风",
      "比肩": isHarmonious ? "朋友多多" : "竞争博弈",
      "劫财": isHarmonious ? "大方分享" : "别瞎剁手",
      "食神": isHarmonious ? "吃嘛嘛香" : "宅家回电",
      "伤官": isHarmonious ? "才华横溢" : "谨言慎行",
      "正印": isHarmonious ? "被宠坏了" : "学习进步",
      "偏印": isHarmonious ? "神机妙算" : "少想多做"
    };
    return vibes[shishen] || "心情明媚";
  };

  return {
    vibeLabel: VIBE_LABELS[seed % VIBE_LABELS.length],
    prediction: `${genderMod}。这份基于 ${city} (${solarTime.h}:${solarTime.m.toString().padStart(2, '0')} 真太阳时) 的深度解析：${PREDICTIONS[seed % PREDICTIONS.length]} 在丙午年的火木相生格局下，你的日主 ${dayStem} 将面临一次前所未有的磁场重塑。这不仅是运势的波动，更是你个人底层逻辑的数字化升级。请聚焦于当前的 ${STRATEGIES[seed % STRATEGIES.length].tag}，这将是你未来三年的核心资产点。`,
    dayMaster: `${dayStem}属${dayBranch}之命 (日元)`,
    eightCharacters: [
      createPillar("年柱", yearPillar, "代表先天根基与家族潜能。"),
      createPillar("月柱", monthPillar, "主导事业格局与当下的社会能量。"),
      createPillar("日柱", dayPillar, "核心人设，你灵魂最底层的色调。"),
      createPillar("时柱", hourPillar, "代表未来输出与最终的成就归宿。")
    ],
    monthlyEnergy: MONTH_DATES_2026.map((m) => {
      const mShishen = shishenData[m.stem] || "气场";
      return {
        month: m.name,
        dateRange: `2026 ${m.range}`,
        element: getElement(m.stem),
        shishen: mShishen,
        shishenMeaning: getShishenMeaning(mShishen),
        direction: getMonthlyDirection(mShishen),
        vibe: getMonthlyVibe(mShishen, m.stem)
      };
    }),
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


