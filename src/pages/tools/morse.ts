import { icon } from '../../core/icons';

const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.',
  '@': '.--.-.', '-': '-....-', '(': '-.--.', ')': '-.--.-', '&': '.-...',
  ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '\'': '.----.',
};

const REVERSE_MAP: Record<string, string> = {};
for (const [char, morse] of Object.entries(MORSE_MAP)) {
  REVERSE_MAP[morse] = char;
}

export default {
  id: 'morse',
  name: '摩斯密码转换器',
  icon: 'morse',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/encoding" class="tool-page-back">${icon('binary')} 编码解码</a>
          <h1 style="font: var(--text-headline-md);">摩斯密码转换器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">文本与摩斯密码互转</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="mc-input" class="tool-textarea" rows="6" placeholder="输入英文文本（A-Z、0-9、标点）..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="mc-encode">文本 → 摩斯</button>
            <button class="btn btn-primary" id="mc-decode">摩斯 → 文本</button>
            <button class="btn btn-secondary" id="mc-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">结果</label>
            <textarea id="mc-output" class="tool-textarea" rows="6" readonly placeholder="结果将显示在这里...（字母用空格分隔，单词用 / 分隔）"></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="mc-copy">${icon('content_copy')} 复制结果</button>
          </div>
          <div style="margin-top: 16px; padding: 16px; background: var(--color-surface-variant); border-radius: var(--radius-md);">
            <details>
              <summary style="cursor: pointer; font: var(--text-label-md); color: var(--color-on-surface-variant);">查看摩斯密码表</summary>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 4px; margin-top: 12px; font: var(--text-body-sm);">
                ${Object.entries(MORSE_MAP).map(([c, m]) => `<span><b>${c}</b> ${m}</span>`).join('')}
              </div>
            </details>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#mc-input') as HTMLTextAreaElement;
    const output = container.querySelector('#mc-output') as HTMLTextAreaElement;

    container.querySelector('#mc-encode')!.addEventListener('click', () => {
      const text = input.value.toUpperCase();
      const words = text.split(/\s+/);
      const result = words.map(word => {
        return word.split('').map(char => MORSE_MAP[char] || char).join(' ');
      }).join(' / ');
      output.value = result;
    });

    container.querySelector('#mc-decode')!.addEventListener('click', () => {
      const text = input.value.trim();
      const words = text.split(/\s*\/\s*/);
      const result = words.map(word => {
        return word.split(/\s+/).map(code => REVERSE_MAP[code] || code).join('');
      }).join(' ');
      output.value = result;
    });

    container.querySelector('#mc-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });

    container.querySelector('#mc-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
