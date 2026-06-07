import { icon } from '../../core/icons';
import { pinyin } from 'pinyin-pro';

export default {
  id: 'hanzi-pinyin',
  name: '汉字转拼音',
  icon: 'record_voice_over',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本处理</a>
          <h1 style="font: var(--text-headline-md);">汉字转拼音</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将中文汉字转换为拼音</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入汉字</label>
            <textarea id="py-input" class="tool-textarea" rows="8" placeholder="输入需要转换的汉字..."></textarea>
          </div>
          <div class="tool-actions">
            <label class="tool-checkbox"><input type="checkbox" id="py-tone" checked /> 带声调</label>
            <label class="tool-checkbox"><input type="checkbox" id="py-sep" checked /> 分隔符</label>
            <button class="btn btn-primary" id="py-btn">转换</button>
            <button class="btn btn-secondary" id="py-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">拼音结果</label>
            <textarea id="py-output" class="tool-textarea" rows="8" readonly placeholder="拼音将显示在这里..."></textarea>
          </div>
          <div class="tool-field">
            <label class="tool-label">逐字标注</label>
            <div id="py-annotated" class="tool-output" style="font-size: 18px; line-height: 2.4; letter-spacing: 4px;"></div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="py-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#py-input') as HTMLTextAreaElement;
    const output = container.querySelector('#py-output') as HTMLTextAreaElement;
    const annotated = container.querySelector('#py-annotated') as HTMLElement;
    const toneEl = container.querySelector('#py-tone') as HTMLInputElement;
    const sepEl = container.querySelector('#py-sep') as HTMLInputElement;

    function convert() {
      const text = input.value;
      if (!text) return;

      const withTone = toneEl.checked;
      const sep = sepEl.checked ? ' ' : '';
      const toneType = withTone ? 'symbol' : 'none';

      const pinyinArr = pinyin(text, { toneType, type: 'array' });
      const results: string[] = [];
      const annotatedParts: string[] = [];

      let pyIdx = 0;
      for (const ch of text) {
        if (/[一-鿿㐀-䶿]/.test(ch)) {
          const py = pinyinArr[pyIdx] || ch;
          results.push(py);
          annotatedParts.push(`<span title="${ch}" style="cursor: help;"><ruby>${ch}<rt style="font-size:12px;color:var(--color-primary);">${py}</rt></ruby></span>`);
          pyIdx++;
        } else if (/[a-zA-Z0-9]/.test(ch)) {
          results.push(ch);
          annotatedParts.push(ch);
        } else if (/\s/.test(ch)) {
          annotatedParts.push(' ');
        } else {
          results.push(ch);
          annotatedParts.push(`<span style="color:var(--color-outline);">${ch}</span>`);
        }
      }

      output.value = results.join(sep);
      annotated.innerHTML = annotatedParts.join('');
    }

    container.querySelector('#py-btn')!.addEventListener('click', convert);
    container.querySelector('#py-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
      annotated.innerHTML = '';
    });
    container.querySelector('#py-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
