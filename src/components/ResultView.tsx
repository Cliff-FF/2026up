import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Download, Loader2, X } from 'lucide-react';
import type { BaZiResult } from '../lib/gemini';
import { getToken, loadDetail, login, portalUrl, type MonthDetail } from '../lib/membership';
import { savePoster } from '../lib/poster';

type Month = BaZiResult['monthlyEnergy'][number];
export function ResultView({ result, reset }: { result: BaZiResult; reset: () => void }) {
  const [selected, setSelected] = useState<Month | null>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [saving, setSaving] = useState(false);
  async function share() {
    setSaving(true);
    try { await savePoster(result); setShareMessage('年度行动卡已保存，可以分享给朋友。'); }
    catch { setShareMessage('保存失败，请重试或截图保存上方行动卡。'); }
    finally { setSaving(false); }
  }
  return <main className="result-page">
    <nav className="result-nav" aria-label="报告导航"><a href="./" aria-label="顺月首页"><span className="brand-mark">顺</span> 顺月 <span className="brand-en">SHUNYUE</span></a><button onClick={reset}>重新测一次 <ArrowUpRight size={14} /></button></nav>
    <section className="annual-poster" aria-labelledby="annual-title">
      <div className="poster-heading"><div><p className="eyebrow">你的年度行动指南 · 2026</p><h1 id="annual-title">顺着节奏，<br className="mobile-break" /><span>把日子过好。</span></h1><p className="poster-subtitle">一年十二个月，每个月只抓住一件重要的事。</p></div><div className="year-stamp" aria-hidden="true">20<br />26<span>顺时而行 · 悦己而活</span></div></div>
      <div className="poster-persona"><span>你的生活底色</span><strong>{result.vibeLabel}</strong><span className="persona-tags">{result.tags.slice(0, 3).join(' / ')}</span></div>
      <div className="month-grid">{result.monthlyEnergy.map((month, index) => <button className={`month-tile tone-${Math.floor(index / 3)}`} key={month.monthNumber} onClick={() => setSelected(month)} aria-label={`${month.monthNumber}月，${month.direction}，查看详细解读`}>
        <span className="month-top"><span><b>{String(month.monthNumber).padStart(2, '0')}</b> 月</span><ArrowUpRight size={15} /></span><strong>{month.direction}</strong><span className="month-hint">{month.vibe}</span>
      </button>)}</div>
      <div className="poster-bottom"><span>不必时时用力，只需月月有方向。</span><span>顺月 × FFCLIFF</span></div>
    </section>
    <div className="share-row"><p>年度总览免费 · 点击月份，探索行动细节</p><button className="secondary-button" onClick={share} disabled={saving}><Download size={16} />{saving ? '正在生成…' : '保存我的年度行动卡'}</button></div>
    <p className="share-message" role="status">{shareMessage}</p>
    <section className="reading-section" aria-labelledby="birth-title"><div className="section-heading"><div><p className="eyebrow">01 / 认识自己</p><h2 id="birth-title">你的生辰解读表</h2></div><span className="day-master">{result.dayMaster}</span></div>
      <div className="birth-table-wrap"><table className="birth-table"><thead><tr><th scope="col">四柱</th>{result.eightCharacters.map(p => <th scope="col" key={p.pillar}>{p.pillar}</th>)}</tr></thead><tbody>
        <tr className="characters"><th scope="row">天干</th>{result.eightCharacters.map(p => <td key={p.pillar}>{p.stem}<small>{p.stemShishen}</small></td>)}</tr>
        <tr className="characters"><th scope="row">地支</th>{result.eightCharacters.map(p => <td key={p.pillar}>{p.branch}<small>{p.branchShishen}</small></td>)}</tr>
        <tr className="meanings"><th scope="row">解读</th>{result.eightCharacters.map(p => <td key={p.pillar}>{p.meaning}</td>)}</tr>
      </tbody></table></div>
    </section>
    <section className="reading-section interpretation"><div className="section-heading"><div><p className="eyebrow">02 / 读懂你的节奏</p><h2>先了解自己，再决定往哪里走。</h2></div></div><div className="interpretation-grid"><article><h3>{result.vibeLabel}</h3><p>{result.prediction}</p></article><aside><span className="eyebrow">这一年的提醒</span><h3>{result.yearlyStrategy.directionTag}</h3><p>{result.yearlyStrategy.coreAdvice}</p></aside></div></section>
    <section className="reading-section"><div className="section-heading"><div><p className="eyebrow">03 / 换个地方，换种心情</p><h2>适合你的远方</h2></div></div><div className="city-grid">{[...result.yearlyStrategy.domesticCities, ...result.yearlyStrategy.intlCities].map(city => <article key={city.name}><span>目的地灵感</span><h3>{city.name}</h3><p>{city.reason}</p></article>)}</div></section>
    <footer className="result-footer"><strong>顺月 <span>SHUNYUE</span></strong><p>生辰与性格的趣味探索，给生活一些灵感。行动由你决定。</p><p>月份以公历编号，流月解读按节气区间，具体日期见月度详情。</p><button onClick={reset}>重新开始 →</button></footer>
    {selected && <MonthDialog month={selected} close={() => setSelected(null)} />}
  </main>;
}

function MonthDialog({ month, close }: { month: Month; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState<MonthDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const inFlight = useRef(false);
  const alive = useRef(true);
  async function verify() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true);
    try { const data = await loadDetail(month.shishen); if (alive.current) { setDetail(data); setMessage(''); } }
    catch (error) { if (alive.current) { setDetail(null); setMessage(error instanceof Error ? error.message : '验证失败，请重试。'); } }
    finally { inFlight.current = false; if (alive.current) setBusy(false); }
  }
  useEffect(() => {
    alive.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    if (getToken()) void verify();
    const check = () => { if (document.visibilityState === 'visible' && getToken()) void verify(); };
    const interval = window.setInterval(check, 15000);
    window.addEventListener('focus', check); window.addEventListener('storage', check); document.addEventListener('visibilitychange', check);
    return () => { alive.current = false; document.body.style.overflow = previousOverflow; clearInterval(interval); window.removeEventListener('focus', check); window.removeEventListener('storage', check); document.removeEventListener('visibilitychange', check); };
  }, []);
  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await login(email, password); setPassword(''); await verify(); }
    catch (error) { setMessage(error instanceof Error ? error.message : '登录失败'); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} className="month-dialog" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}>
    <div className="dialog-content"><button autoFocus className="dialog-close" onClick={close} aria-label="关闭"><X size={20} /></button><p className="eyebrow">2026 · {month.monthNumber} 月行动指南</p><h2>{month.direction}</h2><p className="dialog-subtitle">{month.dateRange} · {month.month} · {month.element}</p>
      {detail ? <div className="month-detail"><p className="detail-intro">{detail.intro}</p><h3>这个月，可以这样做</h3><ol>{detail.actions.map(action => <li key={action}>{action}</li>)}</ol><h3>留意一件事</h3><p>{detail.avoid}</p><div className="reflection"><span>月末，问问自己</span><p>{detail.question}</p></div><small>这是一份行动灵感，不是对未来的保证。</small></div> : <>
        <div className="pro-offer"><span className="pro-badge">FFCLIFF PRO</span><h3>每个月，都知道怎么迈出下一步。</h3><p>订阅会员，畅看全部月份的详细解读、行动建议与月末复盘。</p><div className="pro-price">¥99 <span>/ 年</span></div><p className="free-note">年度行动卡、生辰表与整体解读始终免费</p></div>
        <a className="primary-button" href={portalUrl} target="_blank" rel="noopener noreferrer">前往注册与支付 <ArrowUpRight size={17} /></a><p className="payment-note">在 FFCLIFF 原会员页完成注册、付款与审核后，回到这里。使用同一账户验证，通过后自动打开本月。</p>
        <button className="secondary-button full-width" disabled={busy} onClick={() => { if (getToken()) void verify(); else setShowLogin(true); }}>{busy ? <><Loader2 size={16} className="animate-spin" />正在验证会员…</> : '已有会员 / 我已完成付款，验证资格'}</button>
        {showLogin && <form className="member-login" onSubmit={signIn}><label>FFCLIFF 账户邮箱<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label><label>密码<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label><button className="primary-button" disabled={busy}>登录并查看本月</button></form>}
        {message && <p className="verification-message" role="status">{message}</p>}
        {getToken() && <button className="switch-account" onClick={() => setShowLogin(!showLogin)}>重新登录 / 切换账户</button>}
      </>}
    </div>
  </dialog>;
}
