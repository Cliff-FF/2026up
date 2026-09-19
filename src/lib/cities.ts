export const INTERESTS = ['海边散步', '山野自然', '历史文化', '城市生活', '当地美食'] as const;
export type Interest = typeof INTERESTS[number];
export const PACES = ['慢一点', '动静平衡', '热闹充实'] as const;
export type Pace = typeof PACES[number];
export const COMPANY = ['留点独处', '都可以', '认识新朋友'] as const;
export type Company = typeof COMPANY[number];
export type TravelPreference = { interest: Interest; pace: Pace; company: Company };
export const TRAVEL_QUESTIONS = [
  { q: '如果换个城市住一阵，你最想靠近什么？', options: [...INTERESTS], type: '旅居偏好' },
  { q: '这次旅居，你希望日子怎么过？', options: [...PACES], type: '生活节奏' },
  { q: '到了新的地方，你更想？', options: [...COMPANY], type: '相处方式' },
];

export type City = { name: string; region: string; group: 'domestic' | 'international'; interests: Interest[]; pace: Pace; company: Company; highlight: string; note: string };
const city = (name: string, region: string, group: City['group'], interests: Interest[], pace: Pace, company: Company, highlight: string, note: string): City => ({ name, region, group, interests, pace, company, highlight, note });
// Curated destination characteristics, not live prices or a measured livability ranking.
// Pace and social setting describe the suggested stay, not every neighborhood.
export const CITIES: City[] = [
  city('大理', '云南', 'domestic', ['山野自然', '历史文化'], '慢一点', '认识新朋友', '苍山、洱海和古城，适合把散步变成每天的固定节目。', '想安静住，可以把住处和古城最热闹的街道分开。'),
  city('昆明', '云南', 'domestic', ['山野自然', '城市生活'], '动静平衡', '都可以', '翠湖、滇池与市区生活可以兼顾，适合边住边慢慢探索。', '湖边游玩和日常办事不一定在同一个片区。'),
  city('丽江', '云南', 'domestic', ['历史文化', '山野自然'], '慢一点', '留点独处', '古城巷子与雪山风景，适合散步、拍照和留白。', '古城热门街区较热闹，长住先看房间隔音。'),
  city('景洪', '云南', 'domestic', ['山野自然', '当地美食'], '慢一点', '都可以', '热带植物、澜沧江和傣味，适合换一种日常。', '偏热的环境是否舒服，要结合出行月份。'),
  city('腾冲', '云南', 'domestic', ['山野自然', '历史文化'], '慢一点', '留点独处', '和顺古镇、火山地貌与温泉，适合给行程留出空白。', '景点比较分散，先想好日常交通。'),
  city('成都', '四川', 'domestic', ['当地美食', '城市生活'], '动静平衡', '认识新朋友', '茶馆、公园和街头小吃，适合从日常吃喝开始认识城市。', '挑住处时，先看通勤距离，再看网红打卡点。'),
  city('重庆', '重庆', 'domestic', ['当地美食', '城市生活'], '热闹充实', '认识新朋友', '山城街巷、江边夜景和火锅，适合喜欢热闹的人。', '坡道和台阶多，步行距离不等于平路距离。'),
  city('杭州', '浙江', 'domestic', ['山野自然', '城市生活'], '动静平衡', '都可以', '西湖、茶山和城市街区，适合工作之外找一段散步时间。', '景区与工作生活圈分开考虑，住得顺手更重要。'),
  city('苏州', '江苏', 'domestic', ['历史文化', '城市生活'], '慢一点', '留点独处', '园林、运河和老街，适合慢慢走、慢慢看。', '古城与新城的生活体验不同，先选想住的片区。'),
  city('南京', '江苏', 'domestic', ['历史文化', '当地美食'], '动静平衡', '都可以', '博物馆、城墙和街巷小吃，适合喜欢历史又不想离开城市的人。', '夏冬体感差异明显，按出行季节挑活动。'),
  city('上海', '上海', 'domestic', ['城市生活', '历史文化'], '热闹充实', '认识新朋友', '展览、街区建筑和城市活动，适合想多看、多交流的时候。', '活动多也容易把日程排满，给自己留几天空档。'),
  city('北京', '北京', 'domestic', ['历史文化', '城市生活'], '热闹充实', '认识新朋友', '博物馆、胡同和文化空间，适合带着问题去看展、听分享。', '跨城区移动耗时，住处尽量靠近常去的地方。'),
  city('深圳', '广东', 'domestic', ['城市生活', '海边散步'], '热闹充实', '认识新朋友', '城市公园、海滨步道和创意街区，适合喜欢边走边找新事物的人。', '海边与市中心可能相距较远，先定生活重心。'),
  city('广州', '广东', 'domestic', ['当地美食', '城市生活'], '热闹充实', '认识新朋友', '早茶、骑楼街和街坊小店，适合从一日三餐认识当地生活。', '热门美食街适合逛，长住还要看周边日常便利。'),
  city('厦门', '福建', 'domestic', ['海边散步', '城市生活'], '动静平衡', '都可以', '海边步道、老街和咖啡馆，适合给城市生活加一点海风。', '岛内外距离不同，先确认常去的海边和住处。'),
  city('泉州', '福建', 'domestic', ['历史文化', '当地美食'], '慢一点', '留点独处', '古城寺庙、红砖建筑与闽南小吃，适合步行探索。', '热门古城街道不一定安静，住处可选在外围。'),
  city('青岛', '山东', 'domestic', ['海边散步', '历史文化'], '动静平衡', '都可以', '海岸线和老城建筑，适合散步、拍照和逛街换着来。', '海边风大，按季节准备衣物。'),
  city('威海', '山东', 'domestic', ['海边散步', '山野自然'], '慢一点', '留点独处', '沿海步道与沙滩，适合把一天过得简单一点。', '海滨体验季节性强，先看出行月份。'),
  city('珠海', '广东', 'domestic', ['海边散步', '城市生活'], '慢一点', '都可以', '情侣路、海滨公园和城市生活，适合想靠海又保留便利的人。', '海岛游与市区长住是两种不同安排。'),
  city('海口', '海南', 'domestic', ['海边散步', '当地美食'], '慢一点', '都可以', '骑楼老街、海滨和海南小吃，适合先住进当地日常。', '不同季节湿热感有变化，长住前先短住体验。'),
  city('三亚', '海南', 'domestic', ['海边散步', '山野自然'], '慢一点', '认识新朋友', '海湾和沙滩，适合想把休息和户外放在前面的人。', '各海湾生活便利度不同，不能只看海景。'),
  city('桂林', '广西', 'domestic', ['山野自然', '历史文化'], '慢一点', '留点独处', '漓江与喀斯特山水，适合把时间留给户外。', '市区生活与阳朔游玩需要分开规划。'),
  city('景德镇', '江西', 'domestic', ['历史文化', '城市生活'], '动静平衡', '认识新朋友', '陶瓷作坊、展览和市集，适合想动手做点东西的人。', '手作课程先问清时长和费用，再安排长住。'),
  city('西安', '陕西', 'domestic', ['历史文化', '当地美食'], '热闹充实', '都可以', '城墙、博物馆与面食街巷，适合喜欢历史和吃喝的人。', '热门场馆可能要预约，别把每天都排成打卡。'),
  city('清迈', '泰国', 'international', ['历史文化', '山野自然'], '慢一点', '认识新朋友', '古城、兰纳文化与周边山地，适合慢住和探索交替。', '出行前单独查看当季空气状况。'),
  city('曼谷', '泰国', 'international', ['城市生活', '当地美食'], '热闹充实', '认识新朋友', '街头美食、河岸和城市文化，适合喜欢不断发现新店的人。', '跨区交通会影响日常，尽量围绕轨道交通选住处。'),
  city('华欣', '泰国', 'international', ['海边散步', '当地美食'], '慢一点', '留点独处', '海滨和夜市，适合以散步、吃饭、休息为主的日子。', '选住处时确认实际步行到海边的路线。'),
  city('普吉镇', '泰国', 'international', ['历史文化', '当地美食'], '动静平衡', '都可以', '老城建筑与当地餐馆，适合喜欢海岛中的城市生活的人。', '普吉镇不等于海滩区，去海边需安排交通。'),
  city('岘港', '越南', 'international', ['海边散步', '城市生活'], '动静平衡', '认识新朋友', '沙滩与城市相邻，也能去周边山地和会安走走。', '海滨活动受季节影响，按月份安排。'),
  city('会安', '越南', 'international', ['历史文化', '海边散步'], '慢一点', '留点独处', '古城街巷与周边海岸，适合步行、骑行和慢看。', '古城核心区游客多，想安静可住外围。'),
  city('大叻', '越南', 'international', ['山野自然', '当地美食'], '慢一点', '留点独处', '高地景观、湖泊与咖啡，适合偏爱山城生活的人。', '坡地出行和市区步行要留足时间。'),
  city('胡志明市', '越南', 'international', ['城市生活', '当地美食'], '热闹充实', '认识新朋友', '市场、咖啡馆与街头吃食，适合喜欢热闹城市日常的人。', '车流繁忙，先看住处附近能否舒服步行。'),
  city('乌布', '印度尼西亚 · 巴厘岛', 'international', ['山野自然', '历史文化'], '慢一点', '留点独处', '稻田、手工艺与巴厘文化，适合想把日子放慢的人。', '中心街区和外围村落差别很大，先明确想住哪种环境。'),
  city('苍古', '印度尼西亚 · 巴厘岛', 'international', ['海边散步', '城市生活'], '热闹充实', '认识新朋友', '冲浪海岸与咖啡馆，适合想在海边认识新朋友的人。', '街区并非处处适合步行，选住处前确认日常路线。'),
  city('吉隆坡', '马来西亚', 'international', ['城市生活', '当地美食'], '热闹充实', '认识新朋友', '多元餐饮与城市设施，适合喜欢大城市生活的人。', '优先看轨道交通和日常采买距离。'),
  city('乔治市', '马来西亚 · 槟城', 'international', ['历史文化', '当地美食'], '动静平衡', '都可以', '老街、街头艺术和小吃，适合边走边吃、认识当地文化。', '热门老街较热闹，留意住宿隔音。'),
  city('怡保', '马来西亚', 'international', ['当地美食', '历史文化'], '慢一点', '留点独处', '老城、咖啡和周边石灰岩景观，适合简单慢住。', '市外景点分散，需要安排交通。'),
  city('京都', '日本', 'international', ['历史文化', '山野自然'], '慢一点', '留点独处', '寺院、园林与传统街巷，适合安静地看细节。', '热门景点人多，生活区和观光区分开选。'),
  city('福冈', '日本', 'international', ['当地美食', '海边散步'], '动静平衡', '都可以', '屋台、城市公园和海湾，适合吃喝散步都有的日常。', '海滨片区与市中心的生活节奏不同。'),
  city('东京', '日本', 'international', ['城市生活', '历史文化'], '热闹充实', '认识新朋友', '展览、书店和各有个性的街区，适合想密集接触新东西的人。', '城市很大，围绕常去的街区选择住处。'),
  city('大阪', '日本', 'international', ['当地美食', '城市生活'], '热闹充实', '认识新朋友', '商店街、餐饮与城市活动，适合喜欢人间烟火的人。', '娱乐区适合逛，长住还要考虑晚间噪声。'),
  city('那霸', '日本 · 冲绳', 'international', ['海边散步', '历史文化'], '动静平衡', '都可以', '琉球文化与海岛城市日常，适合想兼顾探索和休息的人。', '市中心不等于海滩度假区，去沙滩需安排交通。'),
  city('里斯本', '葡萄牙', 'international', ['城市生活', '历史文化'], '热闹充实', '认识新朋友', '河岸、老街和文化空间，适合喜欢城市漫步的人。', '坡道较多，选房要考虑日常步行路线。'),
  city('波尔图', '葡萄牙', 'international', ['历史文化', '当地美食'], '动静平衡', '都可以', '杜罗河岸、老城和当地餐饮，适合边住边慢慢逛。', '老城有坡道，住处位置比地图上的距离更重要。'),
  city('丰沙尔', '葡萄牙 · 马德拉', 'international', ['山野自然', '海边散步'], '慢一点', '留点独处', '海岛城市与周边山地，适合以户外为生活重心的人。', '山地活动要单独核查天气、线路和交通。'),
  city('巴伦西亚', '西班牙', 'international', ['海边散步', '城市生活'], '动静平衡', '认识新朋友', '海滩、城市公园和街区生活，适合想兼顾户外与城市的人。', '海滩区和老城不是同一个生活圈。'),
  city('巴塞罗那', '西班牙', 'international', ['城市生活', '海边散步'], '热闹充实', '认识新朋友', '建筑、艺术与海滨，适合想在城市里持续探索的人。', '热门景区和安静居住区分开选择。'),
  city('墨尔本', '澳大利亚', 'international', ['城市生活', '当地美食'], '热闹充实', '认识新朋友', '咖啡馆、巷道与艺术空间，适合喜欢城市文化的人。', '不同街区差异明显，先围绕日常活动选位置。'),
];

export function travelPreference(answers: { q: string; a: string }[]): TravelPreference {
  const read = (index: number) => answers.find(a => a.q === TRAVEL_QUESTIONS[index].q)?.a;
  return {
    interest: INTERESTS.find(v => v === read(0)) || '山野自然',
    pace: PACES.find(v => v === read(1)) || '动静平衡',
    company: COMPANY.find(v => v === read(2)) || '都可以',
  };
}

export type CityRecommendation = City & { reason: string; matches: string[] };
export function recommendCities(preference: TravelPreference, limit = 3) {
  const ranked = CITIES.map((entry, index) => {
    const matches: string[] = [];
    let score = 0;
    if (entry.interests.includes(preference.interest)) { score += 8; matches.push(preference.interest); }
    if (entry.pace === preference.pace) { score += 4; matches.push(preference.pace); }
    if (entry.company === preference.company && preference.company !== '都可以') { score += 2; matches.push(preference.company); }
    return { entry, score, matches, index };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  const pick = (group: City['group']): CityRecommendation[] => ranked.filter(r => r.entry.group === group).slice(0, limit).map(({ entry, matches }) => ({
    ...entry, matches, reason: matches.length ? `你想要「${matches.join('」「')}」，可以先看看这里。` : '换一种生活方式的备选，先短住体验。',
  }));
  return { domesticCities: pick('domestic'), intlCities: pick('international') };
}
