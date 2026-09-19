import { useMemo, useState } from 'react';
import { CITIES, INTERESTS, PACES, COMPANY, recommendCities, type TravelPreference } from '../lib/cities';

export function CityRecommendations({ initial }: { initial: TravelPreference }) {
  const [preference, setPreference] = useState(initial);
  const [limit, setLimit] = useState(3);
  const recommendations = useMemo(() => recommendCities(preference, limit), [preference, limit]);
  const maxCount = Math.max(CITIES.filter(c => c.group === 'domestic').length, CITIES.filter(c => c.group === 'international').length);
  return <section className="reading-section destinations" aria-labelledby="cities-title">
    <div className="section-heading"><div><p className="eyebrow">03 / 去哪里住一阵</p><h2 id="cities-title">换个地方，也要住得合拍。</h2></div><span className="catalog-count">{CITIES.length} 个国内外目的地</span></div>
    <p className="section-intro">按你喜欢的环境和生活节奏来选。想法变了？改一下偏好，推荐也会跟着变。</p>
    <div className="travel-preferences">
      <label>最想靠近<select value={preference.interest} onChange={e => setPreference({ ...preference, interest: e.target.value as TravelPreference['interest'] })}>{INTERESTS.map(v => <option key={v}>{v}</option>)}</select></label>
      <label>生活节奏<select value={preference.pace} onChange={e => setPreference({ ...preference, pace: e.target.value as TravelPreference['pace'] })}>{PACES.map(v => <option key={v}>{v}</option>)}</select></label>
      <label>相处方式<select value={preference.company} onChange={e => setPreference({ ...preference, company: e.target.value as TravelPreference['company'] })}>{COMPANY.map(v => <option key={v}>{v}</option>)}</select></label>
    </div>
    <div aria-live="polite" aria-atomic="false">
      {([['国内，先看看这些', recommendations.domesticCities], ['国外，换一种日常', recommendations.intlCities]] as const).map(([label, cities]) => <div className="destination-group" key={label}>
        <h3>{label}</h3><div className="destination-grid">{cities.map((city, index) => <article className="destination-card" key={city.name}>
          <div className="destination-top"><span>{city.region}</span><span>{String(index + 1).padStart(2, '0')}</span></div>
          <h4>{city.name}</h4><div className="destination-tags">{city.interests.map(tag => <span className={tag === preference.interest ? 'matched' : ''} key={tag}>{tag}</span>)}</div>
          <p className="destination-reason">{city.reason}</p><p>{city.highlight}</p>
          <div className="destination-note"><strong>住之前想一下</strong><p>{city.note}</p></div>
        </article>)}</div>
      </div>)}
    </div>
    <div className="destination-footer">{limit < maxCount && <button className="secondary-button" onClick={() => setLimit(Math.min(maxCount, limit + 3))}>再看几座城市</button>}{limit > 3 && <button className="secondary-button" onClick={() => setLimit(3)}>收起备选</button>}<p>按生活偏好匹配，不是运势排名。先短住体验，再决定是否长住。</p></div>
  </section>;
}
