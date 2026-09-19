import { describePersonality, yearFocus, type Personality } from './personality.ts';
import { travelPreference, type TravelPreference } from './cities.ts';

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
  personality: Personality;
  travelPreference: TravelPreference;
  dayMaster: string;
  eightCharacters: BaZiCharacter[];
  monthlyEnergy: {
    monthNumber: number;
    month: string;
    dateRange: string;
    element: string;
    shishen: string;
    shishenMeaning: string;
    direction: string;
    vibe: string;
  }[];
  yearlyStrategy: {
    shishen: string;
    directionTag: string;
    coreAdvice: string;
  };
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

  const shishenData = SHISHEN_MAP[dayStem] || SHISHEN_MAP["甲"];
  const personality = describePersonality(quizAnswers);
  const annualShishen = shishenData['丙'];
  const focus = yearFocus(annualShishen);

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
    { name: "己丑", range: "01.05 - 02.03", stem: "己" },
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
    { name: "庚子", range: "12.07 - 2027.01.04", stem: "庚" }
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
      "偏财": "探索机会",
      "正官": "推进事业",
      "七杀": "迎接挑战",
      "比肩": "寻找伙伴",
      "劫财": "存钱减负",
      "食神": "好好生活",
      "伤官": "大胆创作",
      "正印": "学习充电",
      "偏印": "独处沉淀"
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
    vibeLabel: personality.tags.slice(0, 2).join(' · '),
    personality,
    travelPreference: travelPreference(quizAnswers),
    dayMaster: `日主 ${dayStem} · 五行属${ELEMENTS[dayStemIndex]}`,
    eightCharacters: [
      createPillar("年柱", yearPillar, "传统解读：家庭与早年环境。"),
      createPillar("月柱", monthPillar, "传统解读：工作与社会角色。"),
      createPillar("日柱", dayPillar, "传统解读：自己与亲密关系。"),
      createPillar("时柱", hourPillar, "传统解读：长远打算与晚年。")
    ],
    monthlyEnergy: MONTH_DATES_2026.map((m, index) => {
      const mShishen = shishenData[m.stem] || "气场";
      return {
        monthNumber: index + 1,
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
      shishen: annualShishen,
      directionTag: focus.tag,
      coreAdvice: focus.advice
    },
    tags: personality.tags
  };
}
