import type { BaZiResult } from './gemini';
export async function savePoster(result: BaZiResult) {
  await document.fonts.ready;
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1500;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#f4f2e9'; ctx.fillRect(0, 0, 1200, 1500);
  const text = (value: string, x: number, y: number, size: number, color = '#263f34', weight = 500) => { ctx.fillStyle = color; ctx.font = `${weight} ${size}px system-ui, sans-serif`; ctx.fillText(value, x, y); };
  text('顺月 SHUNYUE  /  2026 年度行动指南', 72, 85, 25);
  text('顺着节奏，把日子过好。', 72, 190, 64, '#263f34', 700);
  text(`我的生活底色：${result.vibeLabel}`, 72, 260, 29);
  const colors = ['#e1e8d9', '#f1e4c9', '#e8e2d8', '#dce6e1'];
  result.monthlyEnergy.forEach((m, i) => {
    const x = 72 + i % 3 * 360; const y = 310 + Math.floor(i / 3) * 255;
    ctx.fillStyle = colors[Math.floor(i / 3)]; ctx.beginPath(); ctx.roundRect(x, y, 336, 230, 15); ctx.fill();
    text(`${String(m.monthNumber).padStart(2, '0')} 月`, x + 25, y + 44, 25);
    text(m.shishen, x + 247, y + 44, 23, '#647166');
    text(m.direction, x + 25, y + 122, 47, '#263f34', 700);
    text(m.vibe, x + 25, y + 180, 26, '#647166');
  });
  text('不必时时用力，只需月月有方向。', 72, 1390, 28);
  text('顺月 × FFCLIFF  ·  生活灵感，行动由你决定', 72, 1450, 23, '#697369');
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Export failed')), 'image/png'));
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = '顺月-2026年度行动卡.png'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
}
