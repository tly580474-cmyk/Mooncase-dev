import { icon } from '../../core/icons';

function caesar(text: string, shift: number, decrypt: boolean): string {
  if (decrypt) shift = -shift;
  return text.split('').map(ch => {
    if (ch >= 'A' && ch <= 'Z') {
      return String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26 + 26) % 26 + 65);
    }
    if (ch >= 'a' && ch <= 'z') {
      return String.fromCharCode(((ch.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97);
    }
    return ch;
  }).join('');
}

function bruteForce(text: string): string[] {
  const results: string[] = [];
  for (let i = 1; i <= 25; i++) {
    results.push(`偏移 ${String(i).padStart(2)}: ${caesar(text, i, true)}`);
  }
  return results;
}

export default {
  id: 'caesar-cipher',
  name: '凯撒密码',
  icon: 'swap_horiz',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/security" class="tool-page-back">${icon('security')} 安全工具</a>
          <h1 style="font: var(--text-headline-md);">凯撒密码</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">经典的字母位移加密，支持暴力枚举破解</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="cc-input" class="tool-textarea" rows="3" placeholder="输入英文文本..."></textarea>
          </div>

          <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
            <div class="tool-field" style="flex: 0 0 200px;">
              <label class="tool-label">偏移量 (1-25)</label>
              <input id="cc-shift" class="tool-input" type="number" min="1" max="25" value="3" />
            </div>
            <div style="display: flex; gap: 8px; flex: 1;">
              <button class="btn btn-primary" id="cc-encrypt" style="flex: 1;">${icon('lock')} 加密</button>
              <button class="btn btn-ghost" id="cc-decrypt" style="flex: 1;">${icon('unlock')} 解密</button>
            </div>
          </div>

          <div class="tool-field" style="margin-top: 16px;">
            <label class="tool-label">结果</label>
            <textarea id="cc-output" class="tool-textarea" rows="3" readonly></textarea>
          </div>

          <div class="tool-actions">
            <button class="btn btn-ghost" id="cc-brute">${icon('search')} 暴力枚举 (25 种偏移)</button>
          </div>

          <div id="cc-results" style="display: none; margin-top: 16px;">
            <label class="tool-label">暴力枚举结果</label>
            <pre id="cc-brute-results" style="
              padding: 12px; background: var(--color-surface-container);
              border-radius: var(--radius-md); font: var(--text-body-sm);
              max-height: 360px; overflow-y: auto; white-space: pre-wrap;
            "></pre>
          </div>
        </div>
      </div>
    `;

    const inputEl = container.querySelector('#cc-input') as HTMLTextAreaElement;
    const outputEl = container.querySelector('#cc-output') as HTMLTextAreaElement;
    const shiftEl = container.querySelector('#cc-shift') as HTMLInputElement;

    container.querySelector('#cc-encrypt')!.addEventListener('click', () => {
      const shift = parseInt(shiftEl.value) || 3;
      outputEl.value = caesar(inputEl.value, shift, false);
    });

    container.querySelector('#cc-decrypt')!.addEventListener('click', () => {
      const shift = parseInt(shiftEl.value) || 3;
      outputEl.value = caesar(inputEl.value, shift, true);
    });

    container.querySelector('#cc-brute')!.addEventListener('click', () => {
      const results = bruteForce(inputEl.value);
      (container.querySelector('#cc-brute-results') as HTMLElement).textContent = results.join('\n');
      (container.querySelector('#cc-results') as HTMLElement).style.display = '';
    });
  },
};
