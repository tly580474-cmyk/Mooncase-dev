import { icon } from '../../core/icons';

export default {
  id: 'timestamp',
  name: '时间戳转换',
  icon: 'history',
  render(container: HTMLElement) {
    const now = Math.floor(Date.now() / 1000);

    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/dev" class="tool-page-back">${icon('code')} 开发调试</a>
          <h1 style="font: var(--text-headline-md);">时间戳转换</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">Unix 时间戳与人类可读日期互转</p>
        </div>
        <div class="tool-page-body">
          <div style="background: var(--color-surface-container-low); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 24px; text-align: center;">
            <div style="font: var(--text-label-md); color: var(--color-on-surface-variant); margin-bottom: 8px;">当前时间戳</div>
            <div id="ts-current" style="font: var(--text-headline-lg); font-family: var(--font-mono); color: var(--color-primary);">${now}</div>
            <div id="ts-current-ms" style="font: var(--text-body-sm); font-family: var(--font-mono); color: var(--color-outline); margin-top: 4px;">${Date.now()}</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div>
              <div class="tool-field">
                <label class="tool-label">时间戳 → 日期</label>
                <div style="display: flex; gap: 8px;">
                  <input id="ts-input" class="tool-input" placeholder="输入时间戳，如 ${now}" style="font-family: var(--font-mono);" />
                  <select id="ts-unit" class="tool-input" style="width: 80px; flex-shrink: 0;">
                    <option value="s">秒</option>
                    <option value="ms">毫秒</option>
                  </select>
                </div>
              </div>
              <div class="tool-actions">
                <button class="btn btn-primary" id="ts-to-date">转换</button>
              </div>
              <div id="ts-date-result" style="display: none;">
                <div class="tool-field">
                  <label class="tool-label">本地时间</label>
                  <input id="ts-local" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                </div>
                <div class="tool-field">
                  <label class="tool-label">UTC 时间</label>
                  <input id="ts-utc" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                </div>
                <div class="tool-field">
                  <label class="tool-label">ISO 8601</label>
                  <input id="ts-iso" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                </div>
                <div class="tool-field">
                  <label class="tool-label">相对时间</label>
                  <input id="ts-relative" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                </div>
              </div>
            </div>

            <div>
              <div class="tool-field">
                <label class="tool-label">日期 → 时间戳</label>
                <input id="date-input" type="datetime-local" class="tool-input" style="font-family: var(--font-mono);" />
              </div>
              <div class="tool-actions">
                <button class="btn btn-primary" id="date-to-ts">转换</button>
                <button class="btn btn-secondary" id="date-now">使用当前时间</button>
              </div>
              <div id="date-ts-result" style="display: none;">
                <div class="tool-field">
                  <label class="tool-label">秒级时间戳</label>
                  <div style="display: flex; gap: 8px;">
                    <input id="date-ts-s" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                    <button class="btn btn-ghost btn-icon" title="复制">${icon('clipboard')}</button>
                  </div>
                </div>
                <div class="tool-field">
                  <label class="tool-label">毫秒级时间戳</label>
                  <div style="display: flex; gap: 8px;">
                    <input id="date-ts-ms" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                    <button class="btn btn-ghost btn-icon" title="复制">${icon('clipboard')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Auto-update current timestamp
    const currentEl = container.querySelector('#ts-current')!;
    const currentMsEl = container.querySelector('#ts-current-ms')!;
    setInterval(() => {
      currentEl.textContent = String(Math.floor(Date.now() / 1000));
      currentMsEl.textContent = String(Date.now());
    }, 1000);

    // Timestamp → Date
    container.querySelector('#ts-to-date')!.addEventListener('click', () => {
      const raw = (container.querySelector('#ts-input') as HTMLInputElement).value.trim();
      if (!raw) return;
      let ms = parseInt(raw, 10);
      if (isNaN(ms)) return;
      const unit = (container.querySelector('#ts-unit') as HTMLSelectElement).value;
      if (unit === 's') ms *= 1000;

      const d = new Date(ms);
      if (isNaN(d.getTime())) return;

      (container.querySelector('#ts-local') as HTMLInputElement).value = d.toLocaleString('zh-CN', { dateStyle: 'full', timeStyle: 'medium' });
      (container.querySelector('#ts-utc') as HTMLInputElement).value = d.toUTCString();
      (container.querySelector('#ts-iso') as HTMLInputElement).value = d.toISOString();
      (container.querySelector('#ts-relative') as HTMLInputElement).value = getRelativeTime(ms);
      (container.querySelector('#ts-date-result') as HTMLElement).style.display = 'block';
    });

    // Date → Timestamp
    container.querySelector('#date-to-ts')!.addEventListener('click', () => {
      const val = (container.querySelector('#date-input') as HTMLInputElement).value;
      if (!val) return;
      const d = new Date(val);
      if (isNaN(d.getTime())) return;

      (container.querySelector('#date-ts-s') as HTMLInputElement).value = String(Math.floor(d.getTime() / 1000));
      (container.querySelector('#date-ts-ms') as HTMLInputElement).value = String(d.getTime());
      (container.querySelector('#date-ts-result') as HTMLElement).style.display = 'block';
    });

    // Use current time
    container.querySelector('#date-now')!.addEventListener('click', () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      (container.querySelector('#date-input') as HTMLInputElement).value = local;
      container.querySelector('#date-to-ts')!.dispatchEvent(new Event('click'));
    });

    // Copy buttons
    container.querySelectorAll('[title="复制"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const inp = (btn.closest('.tool-field')?.querySelector('.tool-input') as HTMLInputElement);
        if (inp) navigator.clipboard.writeText(inp.value);
      });
    });

    function getRelativeTime(ms: number): string {
      const diff = Date.now() - ms;
      const abs = Math.abs(diff);
      const future = diff < 0;
      const suffix = future ? '后' : '前';

      if (abs < 60_000) return `${Math.floor(abs / 1000)} 秒${suffix}`;
      if (abs < 3_600_000) return `${Math.floor(abs / 60_000)} 分钟${suffix}`;
      if (abs < 86_400_000) return `${Math.floor(abs / 3_600_000)} 小时${suffix}`;
      if (abs < 2_592_000_000) return `${Math.floor(abs / 86_400_000)} 天${suffix}`;
      if (abs < 31_536_000_000) return `${Math.floor(abs / 2_592_000_000)} 个月${suffix}`;
      return `${(abs / 31_536_000_000).toFixed(1)} 年${suffix}`;
    }
  },
  destroy() {
    // Timer is cleaned up by container being cleared
  },
};
