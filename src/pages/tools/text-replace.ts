import { icon } from '../../core/icons';

export default {
  id: 'text-replace',
  name: '文本替换与提取',
  icon: 'find_replace',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本工具</a>
          <h1 style="font: var(--text-headline-md);">文本替换与提取</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">批量查找替换文本内容，支持正则</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="tr-input" class="tool-textarea" rows="10" placeholder="输入原始文本..."></textarea>
          </div>
          <div class="tool-split">
            <div class="tool-field">
              <label class="tool-label">查找内容</label>
              <input id="tr-find" class="tool-input" type="text" placeholder="输入要查找的内容..." />
            </div>
            <div class="tool-field">
              <label class="tool-label">替换为</label>
              <input id="tr-replace" class="tool-input" type="text" placeholder="输入替换内容（留空则删除）" />
            </div>
          </div>
          <div class="tool-actions">
            <label class="tool-checkbox"><input type="checkbox" id="tr-regex" /> 正则模式</label>
            <label class="tool-checkbox"><input type="checkbox" id="tr-global" checked /> 全部替换</label>
            <label class="tool-checkbox"><input type="checkbox" id="tr-ignore-case" /> 忽略大小写</label>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="tr-replace-btn">替换</button>
            <button class="btn btn-primary" id="tr-extract-btn">提取匹配</button>
            <button class="btn btn-secondary" id="tr-count-btn">统计匹配</button>
            <button class="btn btn-secondary" id="tr-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">结果 <span id="tr-status" style="font-weight: 400; color: var(--color-on-surface-variant);"></span></label>
            <textarea id="tr-output" class="tool-textarea" rows="10" readonly placeholder="结果将显示在这里..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="tr-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#tr-input') as HTMLTextAreaElement;
    const findEl = container.querySelector('#tr-find') as HTMLInputElement;
    const replaceEl = container.querySelector('#tr-replace') as HTMLInputElement;
    const output = container.querySelector('#tr-output') as HTMLTextAreaElement;
    const status = container.querySelector('#tr-status') as HTMLElement;
    const regexEl = container.querySelector('#tr-regex') as HTMLInputElement;
    const globalEl = container.querySelector('#tr-global') as HTMLInputElement;
    const ignoreCaseEl = container.querySelector('#tr-ignore-case') as HTMLInputElement;

    function buildRegex(forceGlobal = false): RegExp | null {
      let flags = '';
      if (globalEl.checked || forceGlobal) flags += 'g';
      if (ignoreCaseEl.checked) flags += 'i';
      try {
        return regexEl.checked
          ? new RegExp(findEl.value, flags)
          : new RegExp(findEl.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      } catch {
        return null;
      }
    }

    container.querySelector('#tr-replace-btn')!.addEventListener('click', () => {
      const re = buildRegex();
      if (!re || !findEl.value) { status.textContent = '请输入查找内容'; return; }
      const result = input.value.replace(re, replaceEl.value);
      const count = (input.value.match(re) || []).length;
      output.value = result;
      status.textContent = `替换了 ${count} 处`;
    });

    container.querySelector('#tr-extract-btn')!.addEventListener('click', () => {
      const re = buildRegex(true);
      if (!re || !findEl.value) { status.textContent = '请输入查找内容'; return; }
      const matches = input.value.match(re) || [];
      output.value = matches.join('\n');
      status.textContent = `提取了 ${matches.length} 个匹配`;
    });

    container.querySelector('#tr-count-btn')!.addEventListener('click', () => {
      const re = buildRegex(true);
      if (!re || !findEl.value) { status.textContent = '请输入查找内容'; return; }
      const count = (input.value.match(re) || []).length;
      status.textContent = `找到 ${count} 个匹配`;
      output.value = '';
    });

    container.querySelector('#tr-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
      findEl.value = '';
      replaceEl.value = '';
      status.textContent = '';
    });

    container.querySelector('#tr-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
