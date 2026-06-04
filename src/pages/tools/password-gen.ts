import { icon } from '../../core/icons';

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean }): string {
  let chars = '';
  if (opts.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.digits) chars += '0123456789';
  if (opts.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, v => chars[v % chars.length]).join('');
}

function calcStrength(len: number, opts: Record<string, boolean>): { label: string; color: string; width: string } {
  const pool = (opts.lower ? 26 : 0) + (opts.upper ? 26 : 0) + (opts.digits ? 10 : 0) + (opts.symbols ? 24 : 0);
  const entropy = Math.floor(len * Math.log2(Math.max(pool, 1)));
  if (entropy < 40) return { label: '弱', color: 'var(--color-error)', width: '25%' };
  if (entropy < 60) return { label: '中', color: 'var(--color-primary)', width: '50%' };
  if (entropy < 80) return { label: '强', color: 'var(--color-success)', width: '75%' };
  return { label: '极强', color: 'var(--color-primary-fixed-dim)', width: '100%' };
}

export default {
  id: 'password-gen',
  name: '密码生成器',
  icon: 'password',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/security" class="tool-page-back">${icon('security')} 安全工具</a>
          <h1 style="font: var(--text-headline-md);">密码生成器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">生成安全随机密码</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">密码长度: <span id="pw-len-val">16</span></label>
            <input type="range" id="pw-length" min="6" max="64" value="16" style="width: 100%; accent-color: var(--color-primary);" />
          </div>
          <div class="tool-actions" style="gap: 20px;">
            <label class="tool-checkbox"><input type="checkbox" id="pw-upper" checked /> 大写字母 (A-Z)</label>
            <label class="tool-checkbox"><input type="checkbox" id="pw-lower" checked /> 小写字母 (a-z)</label>
            <label class="tool-checkbox"><input type="checkbox" id="pw-digits" checked /> 数字 (0-9)</label>
            <label class="tool-checkbox"><input type="checkbox" id="pw-symbols" checked /> 特殊字符 (!@#...)</label>
          </div>
          <div class="tool-field">
            <div style="display: flex; align-items: center; gap: 12px;">
              <input id="pw-output" class="tool-input" type="text" readonly style="font-family: var(--font-mono); font-size: 18px; letter-spacing: 1px; flex: 1;" placeholder="点击生成..." />
              <button class="btn btn-primary" id="pw-gen">生成</button>
              <button class="btn btn-ghost" id="pw-copy">${icon('clipboard')} 复制</button>
            </div>
          </div>
          <div class="tool-field">
            <label class="tool-label">强度</label>
            <div style="background: var(--color-surface-container); border-radius: 999px; height: 8px; overflow: hidden;">
              <div id="pw-strength-bar" style="height: 100%; width: 0%; border-radius: 999px; transition: width 0.3s, background 0.3s;"></div>
            </div>
            <span id="pw-strength-text" style="font: var(--text-label-md);"></span>
          </div>
        </div>
      </div>
    `;

    const lengthEl = container.querySelector('#pw-length') as HTMLInputElement;
    const lenVal = container.querySelector('#pw-len-val') as HTMLElement;
    const output = container.querySelector('#pw-output') as HTMLInputElement;
    const bar = container.querySelector('#pw-strength-bar') as HTMLElement;
    const strengthText = container.querySelector('#pw-strength-text') as HTMLElement;

    function getOpts() {
      return {
        upper: (container.querySelector('#pw-upper') as HTMLInputElement).checked,
        lower: (container.querySelector('#pw-lower') as HTMLInputElement).checked,
        digits: (container.querySelector('#pw-digits') as HTMLInputElement).checked,
        symbols: (container.querySelector('#pw-symbols') as HTMLInputElement).checked,
      };
    }

    function update() {
      const len = Number(lengthEl.value);
      lenVal.textContent = String(len);
      const opts = getOpts();
      const pw = generatePassword(len, opts);
      output.value = pw;
      const strength = calcStrength(len, opts);
      bar.style.width = strength.width;
      bar.style.background = strength.color;
      strengthText.textContent = strength.label;
      strengthText.style.color = strength.color;
    }

    lengthEl.addEventListener('input', update);
    container.querySelector('#pw-gen')!.addEventListener('click', update);
    container.querySelector('#pw-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });

    update();
  },
};
