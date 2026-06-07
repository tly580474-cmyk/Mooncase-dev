import { icon } from '../../core/icons';

interface CronField {
  name: string;
  min: number;
  max: number;
  label: string;
}

const FIELDS: CronField[] = [
  { name: 'minute', min: 0, max: 59, label: '分钟' },
  { name: 'hour', min: 0, max: 23, label: '小时' },
  { name: 'day', min: 1, max: 31, label: '日' },
  { name: 'month', min: 1, max: 12, label: '月' },
  { name: 'weekday', min: 0, max: 6, label: '星期' },
];

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function parseField(field: string, min: number, max: number): number[] {
  const values = new Set<number>();

  for (const part of field.split(',')) {
    if (part === '*') {
      for (let i = min; i <= max; i++) values.add(i);
    } else if (part.includes('/')) {
      const [range, step] = part.split('/');
      const stepNum = parseInt(step, 10);
      if (isNaN(stepNum) || stepNum <= 0) continue;
      const start = range === '*' ? min : parseInt(range, 10);
      for (let i = start; i <= max; i += stepNum) values.add(i);
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = a; i <= b; i++) values.add(i);
      }
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n)) values.add(n);
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return '无效的 Cron 表达式（需要 5 个字段）';

  const [min, hour, day, month, weekday] = parts;

  const segments: string[] = [];

  // Month
  if (month !== '*') {
    const months = parseField(month, 1, 12);
    segments.push(months.map(m => MONTH_NAMES[m]).join('、'));
  }

  // Day
  if (day !== '*') {
    const days = parseField(day, 1, 31);
    segments.push(`每月 ${days.join('、')} 日`);
  }

  // Weekday
  if (weekday !== '*') {
    const days = parseField(weekday, 0, 6);
    segments.push(`星期${days.map(d => WEEKDAY_NAMES[d]).join('、')}`);
  }

  // Time
  if (hour === '*' && min === '*') {
    segments.push('每分钟');
  } else if (hour === '*') {
    const mins = parseField(min, 0, 59);
    segments.push(`每小时的第 ${mins.join('、')} 分钟`);
  } else if (min === '*') {
    const hours = parseField(hour, 0, 23);
    segments.push(`${hours.join('、')} 时的每分钟`);
  } else {
    const hours = parseField(hour, 0, 23);
    const mins = parseField(min, 0, 59);
    const timeStrs: string[] = [];
    for (const h of hours) {
      for (const m of mins) {
        timeStrs.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    if (timeStrs.length <= 6) {
      segments.push(timeStrs.join('、'));
    } else {
      segments.push(`${timeStrs[0]} 等 ${timeStrs.length} 个时间点`);
    }
  }

  const everyMin = min === '*' && hour === '*';
  const everyDay = day === '*' && month === '*' && weekday === '*';

  if (everyMin && everyDay) return '每分钟执行';

  return segments.join('，') + ' 执行';
}

function getNextRuns(expr: string, count: number): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minE, hourE, dayE, monthE, weekdayE] = parts;
  const mins = parseField(minE, 0, 59);
  const hours = parseField(hourE, 0, 23);
  const days = parseField(dayE, 1, 31);
  const months = parseField(monthE, 1, 12);
  const weekdays = parseField(weekdayE, 0, 6);

  if (!mins.length || !hours.length || !days.length || !months.length || !weekdays.length) return [];

  const results: Date[] = [];
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);
  const isAllDays = dayE === '*';
  const isAllWeekdays = weekdayE === '*';

  let safety = 0;
  while (results.length < count && safety < 525_960) { // ~1 year of minutes
    safety++;
    if (months.includes(d.getMonth() + 1)) {
      const dayMatch = isAllDays || days.includes(d.getDate());
      const wdMatch = isAllWeekdays || weekdays.includes(d.getDay());
      if (dayMatch && wdMatch && hours.includes(d.getHours()) && mins.includes(d.getMinutes())) {
        results.push(new Date(d));
      }
    }
    d.setMinutes(d.getMinutes() + 1);
  }

  return results;
}

const PRESETS: [string, string][] = [
  ['每分钟', '* * * * *'],
  ['每小时', '0 * * * *'],
  ['每天零点', '0 0 * * *'],
  ['每天 8:30', '30 8 * * *'],
  ['每周一 9:00', '0 9 * * 1'],
  ['每月 1 号', '0 0 1 * *'],
  ['每 5 分钟', '*/5 * * * *'],
  ['工作日 9:00', '0 9 * * 1-5'],
];

export default {
  id: 'cron-parser',
  name: 'Cron 表达式解析',
  icon: 'history',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/generator" class="tool-page-back">${icon('sparkles')} 生成器</a>
          <h1 style="font: var(--text-headline-md);">Cron 表达式解析</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">解析 Cron 表达式，查看含义和未来执行时间</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">Cron 表达式</label>
            <div style="display: flex; gap: 8px;">
              <input id="cron-input" class="tool-input" placeholder="* * * * *" style="font-family: var(--font-mono); font-size: 16px; letter-spacing: 2px;" />
              <button class="btn btn-primary" id="cron-parse">解析</button>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
              ${PRESETS.map(([label, expr]) => `<button class="btn btn-ghost cron-preset" data-expr="${expr}" style="font-size: 12px; padding: 4px 10px;">${label}</button>`).join('')}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 16px 0; text-align: center;">
            ${FIELDS.map((f, i) => `
              <div style="background: var(--color-surface-container-low); border-radius: var(--radius-md); padding: 10px;">
                <div style="font: var(--text-label-sm); color: var(--color-outline); margin-bottom: 4px;">${f.label}</div>
                <div id="cron-field-${i}" style="font-family: var(--font-mono); font-size: 15px; color: var(--color-primary);">-</div>
              </div>
            `).join('')}
          </div>

          <div id="cron-desc" style="display: none;">
            <div class="tool-field">
              <label class="tool-label">含义</label>
              <div id="cron-meaning" style="background: var(--color-surface-container-low); border-radius: var(--radius-md); padding: 16px; font: var(--text-body-lg);"></div>
            </div>
            <div class="tool-field">
              <label class="tool-label">未来 10 次执行时间</label>
              <div id="cron-next-runs" style="background: var(--color-surface-container-low); border-radius: var(--radius-md); padding: 16px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#cron-input') as HTMLInputElement;

    function parse() {
      const expr = input.value.trim();
      const parts = expr.split(/\s+/);

      // Update field display
      for (let i = 0; i < 5; i++) {
        const el = container.querySelector(`#cron-field-${i}`)!;
        el.textContent = parts[i] ?? '-';
      }

      if (parts.length !== 5) {
        (container.querySelector('#cron-desc') as HTMLElement).style.display = 'none';
        return;
      }

      (container.querySelector('#cron-desc') as HTMLElement).style.display = 'block';
      (container.querySelector('#cron-meaning')!).textContent = describeCron(expr);

      const runs = getNextRuns(expr, 10);
      const runsEl = container.querySelector('#cron-next-runs')!;
      if (runs.length === 0) {
        runsEl.innerHTML = '<span style="color: var(--color-error);">无法解析执行时间，请检查表达式</span>';
      } else {
        runsEl.innerHTML = runs.map((d, i) => {
          const weekday = WEEKDAY_NAMES[d.getDay()];
          const dateStr = d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return `<div style="display: flex; align-items: center; gap: 12px; padding: 6px 0; ${i < runs.length - 1 ? 'border-bottom: 1px solid var(--color-outline-variant);' : ''}">
            <span style="color: var(--color-outline); font: var(--text-label-sm); width: 20px;">${i + 1}</span>
            <span style="font-family: var(--font-mono); font-size: 13px;">${dateStr}</span>
            <span style="font: var(--text-label-sm); color: var(--color-outline);">周${weekday}</span>
          </div>`;
        }).join('');
      }
    }

    container.querySelector('#cron-parse')!.addEventListener('click', parse);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') parse(); });
    input.addEventListener('input', parse);

    // Presets
    container.querySelectorAll('.cron-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.getAttribute('data-expr')!;
        parse();
      });
    });
  },
};
