import { icon } from '../../core/icons';

const FULL_TO_HALF: Record<string, string> = {};
const HALF_TO_FULL: Record<string, string> = {};

// ASCII printable characters 33-126 -> full-width equivalents 65281-65374
for (let i = 0; i < 94; i++) {
  const half = String.fromCharCode(33 + i);
  const full = String.fromCharCode(65281 + i);
  HALF_TO_FULL[half] = full;
  FULL_TO_HALF[full] = half;
}
// Space
HALF_TO_FULL[' '] = '　';
FULL_TO_HALF['　'] = ' ';

export default {
  id: 'full-half-width',
  name: '全半角转换',
  icon: 'swap_horiz',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本处理</a>
          <h1 style="font: var(--text-headline-md);">全半角转换</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">中英文全角半角字符互转</p>
        </div>

        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="hw-input" class="tool-textarea" rows="10" placeholder="输入需要转换的文本..."></textarea>
          </div>

          <div class="tool-actions">
            <button class="btn btn-primary" id="hw-to-half">全角 → 半角</button>
            <button class="btn btn-primary" id="hw-to-full">半角 → 全角</button>
            <button class="btn btn-secondary" id="hw-clear">清空</button>
          </div>

          <div class="tool-field">
            <label class="tool-label">转换结果</label>
            <textarea id="hw-output" class="tool-textarea" rows="10" readonly placeholder="转换结果将显示在这里..."></textarea>
          </div>

          <div class="tool-actions">
            <button class="btn btn-ghost" id="hw-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;

    const inputEl = container.querySelector('#hw-input') as HTMLTextAreaElement;
    const outputEl = container.querySelector('#hw-output') as HTMLTextAreaElement;

    container.querySelector('#hw-to-half')!.addEventListener('click', () => {
      outputEl.value = inputEl.value.replace(/[！-～　]/g, ch =>
        FULL_TO_HALF[ch] ?? ch
      );
    });

    container.querySelector('#hw-to-full')!.addEventListener('click', () => {
      outputEl.value = inputEl.value.replace(/[!-~ ]/g, ch =>
        HALF_TO_FULL[ch] ?? ch
      );
    });

    container.querySelector('#hw-clear')!.addEventListener('click', () => {
      inputEl.value = '';
      outputEl.value = '';
    });

    container.querySelector('#hw-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(outputEl.value);
    });
  },
};
