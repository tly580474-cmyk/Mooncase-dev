import { icon } from '../../core/icons';

export default {
  id: 'text-dedup',
  name: '文本去重',
  icon: 'content_copy',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本处理</a>
          <h1 style="font: var(--text-headline-md);">文本去重</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">去除重复行，支持排序</p>
        </div>

        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本（每行一条）</label>
            <textarea id="dedup-input" class="tool-textarea" rows="12" placeholder="粘贴需要去重的文本，每行一条..."></textarea>
          </div>

          <div class="tool-actions">
            <button class="btn btn-primary" id="dedup-btn">去重</button>
            <label class="tool-checkbox">
              <input type="checkbox" id="dedup-sort" /> 排序
            </label>
            <label class="tool-checkbox">
              <input type="checkbox" id="dedup-trim" checked /> 忽略首尾空格
            </label>
            <button class="btn btn-secondary" id="dedup-clear">清空</button>
          </div>

          <div class="tool-field">
            <label class="tool-label">去重结果 <span id="dedup-count" style="color: var(--color-on-surface-variant); font-weight: 400;"></span></label>
            <textarea id="dedup-output" class="tool-textarea" rows="12" readonly placeholder="去重结果将显示在这里..."></textarea>
          </div>

          <div class="tool-actions">
            <button class="btn btn-ghost" id="dedup-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;

    const inputEl = container.querySelector('#dedup-input') as HTMLTextAreaElement;
    const outputEl = container.querySelector('#dedup-output') as HTMLTextAreaElement;
    const countEl = container.querySelector('#dedup-count') as HTMLElement;
    const sortEl = container.querySelector('#dedup-sort') as HTMLInputElement;
    const trimEl = container.querySelector('#dedup-trim') as HTMLInputElement;

    container.querySelector('#dedup-btn')!.addEventListener('click', () => {
      const lines = inputEl.value.split('\n');
      const processed = trimEl.checked ? lines.map(l => l.trim()) : lines;
      const unique = [...new Set(processed)];
      if (sortEl.checked) unique.sort((a, b) => a.localeCompare(b, 'zh'));
      outputEl.value = unique.join('\n');
      countEl.textContent = `（${unique.length} 行，去除 ${lines.length - unique.length} 行重复）`;
    });

    container.querySelector('#dedup-clear')!.addEventListener('click', () => {
      inputEl.value = '';
      outputEl.value = '';
      countEl.textContent = '';
    });

    container.querySelector('#dedup-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(outputEl.value);
    });
  },
};
