import { icon } from '../../core/icons';

export default {
  id: 'word-extract',
  name: '单词提取',
  icon: 'dictionary',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本处理</a>
          <h1 style="font: var(--text-headline-md);">单词提取</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">从文本中提取所有不重复的单词</p>
        </div>

        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="we-input" class="tool-textarea" rows="12" placeholder="粘贴或输入包含英文单词的文本..."></textarea>
          </div>

          <div class="tool-actions">
            <button class="btn btn-primary" id="we-btn">提取单词</button>
            <label class="tool-checkbox">
              <input type="checkbox" id="we-sort" checked /> 按字母排序
            </label>
            <label class="tool-checkbox">
              <input type="checkbox" id="we-lower" /> 转小写
            </label>
            <button class="btn btn-secondary" id="we-clear">清空</button>
          </div>

          <div class="tool-field">
            <label class="tool-label">提取结果 <span id="we-count" style="color: var(--color-on-surface-variant); font-weight: 400;"></span></label>
            <textarea id="we-output" class="tool-textarea" rows="12" readonly placeholder="提取结果将显示在这里..."></textarea>
          </div>

          <div class="tool-actions">
            <button class="btn btn-ghost" id="we-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;

    const inputEl = container.querySelector('#we-input') as HTMLTextAreaElement;
    const outputEl = container.querySelector('#we-output') as HTMLTextAreaElement;
    const countEl = container.querySelector('#we-count') as HTMLElement;
    const sortEl = container.querySelector('#we-sort') as HTMLInputElement;
    const lowerEl = container.querySelector('#we-lower') as HTMLInputElement;

    container.querySelector('#we-btn')!.addEventListener('click', () => {
      const text = inputEl.value;
      const matches = text.match(/[a-zA-Z]+(?:'[a-zA-Z]+)*/g) || [];
      let words = [...new Set(matches)];
      if (lowerEl.checked) words = words.map(w => w.toLowerCase());
      if (sortEl.checked) words.sort((a, b) => a.localeCompare(b));
      outputEl.value = words.join('\n');
      countEl.textContent = `（共 ${words.length} 个不重复单词）`;
    });

    container.querySelector('#we-clear')!.addEventListener('click', () => {
      inputEl.value = '';
      outputEl.value = '';
      countEl.textContent = '';
    });

    container.querySelector('#we-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(outputEl.value);
    });
  },
};
