import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES, INTERESTS, PACES, COMPANY, TRAVEL_QUESTIONS, travelPreference, recommendCities } from '../src/lib/cities.ts';
import { describePersonality, yearFocus } from '../src/lib/personality.ts';

test('destination catalog covers domestic and international stays without duplicate places', () => {
  assert.equal(CITIES.length, 48);
  assert.equal(new Set(CITIES.map(c => c.name)).size, CITIES.length);
  assert.equal(CITIES.filter(c => c.group === 'domestic').length, 24);
  assert.equal(CITIES.filter(c => c.group === 'international').length, 24);
});
test('all supported preferences return stable, distinct recommendations with accurate match reasons', () => {
  for (const interest of INTERESTS) for (const pace of PACES) for (const company of COMPANY) {
    const preference = { interest, pace, company };
    const result = recommendCities(preference, 6);
    assert.deepEqual(result, recommendCities(preference, 6));
    for (const [group, cities] of Object.entries(result)) {
      assert.equal(cities.length, 6);
      assert.equal(new Set(cities.map(c => c.name)).size, 6);
      assert.ok(cities.slice(0, 3).every(c => c.interests.includes(interest)));
      for (const city of cities) {
        assert.equal(city.group, group === 'domesticCities' ? 'domestic' : 'international');
        for (const match of city.matches) assert.ok(city.interests.includes(match) || city.pace === match || city.company === match);
      }
    }
  }
});
test('changing preferences changes the result instead of rotating a fixed city list', () => {
  const calm = recommendCities({ interest: '海边散步', pace: '慢一点', company: '留点独处' });
  const active = recommendCities({ interest: '城市生活', pace: '热闹充实', company: '认识新朋友' });
  assert.equal(calm.domesticCities[0].name, '威海');
  assert.notEqual(calm.intlCities[0].name, active.intlCities[0].name);
  assert.notDeepEqual(calm.domesticCities.map(c => c.name), active.domesticCities.map(c => c.name));
  const all = recommendCities({ interest: '城市生活', pace: '热闹充实', company: '认识新朋友' }, 24);
  assert.equal(all.domesticCities.length + all.intlCities.length, CITIES.length);
});
test('travel questionnaire answers are used directly and malformed answers fall back safely', () => {
  const answers = TRAVEL_QUESTIONS.map((q, i) => ({ q: q.q, a: ['历史文化', '慢一点', '留点独处'][i] }));
  assert.deepEqual(travelPreference(answers), { interest: '历史文化', pace: '慢一点', company: '留点独处' });
  assert.deepEqual(travelPreference([{ q: TRAVEL_QUESTIONS[0].q, a: 'unknown' }]), travelPreference([]));
});
test('personality follows actual answers, independent of gender and city name', () => {
  const describe = choices => describePersonality(choices.map(a => ({ q: '', a })));
  const a = describe(['在人群中释放光芒', '立刻执行，忘了也没事', '冷酷的数据推导']);
  const b = describe(['待在实验室里沉思', '先存起来，等感觉对了再说', '玄学的直觉共鸣']);
  assert.notEqual(a.headline, b.headline);
  assert.deepEqual(a.tags, ['多见人', '先试再说', '先看事实']);
  assert.deepEqual(b.tags, ['留点独处', '想清楚再动', '相信感受']);
  assert.match(describe([]).points[0].text, /还没有/);
  assert.notEqual(yearFocus('正财').tag, yearFocus('劫财').tag);
});
