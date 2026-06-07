import { icon } from '../../core/icons';

export default {
  id: 'regex-test',
  name: '正则测试',
  icon: 'regular_expression',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/dev" class="tool-page-back">${icon('code')} 开发调试</a>
          <h1 style="font: var(--text-headline-md);">正则表达式测试</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">实时测试正则表达式匹配</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-split">
            <div class="tool-field">
              <label class="tool-label">正则表达式</label>
              <input id="regex-pattern" class="tool-input" type="text" placeholder="输入正则表达式，如: \\d+" />
            </div>
            <div class="tool-field">
              <label class="tool-label">标志</label>
              <div class="tool-actions" style="gap: 16px;">
                <label class="tool-checkbox"><input type="checkbox" id="regex-g" checked /> g (全局)</label>
                <label class="tool-checkbox"><input type="checkbox" id="regex-i" /> i (忽略大小写)</label>
                <label class="tool-checkbox"><input type="checkbox" id="regex-m" /> m (多行)</label>
              </div>
            </div>
          </div>
          <div class="tool-field">
            <label class="tool-label">测试文本</label>
            <textarea id="regex-text" class="tool-textarea" rows="10" placeholder="输入要匹配的文本..."></textarea>
          </div>
          <div class="tool-field">
            <label class="tool-label">匹配结果 <span id="regex-count" style="font-weight: 400; color: var(--color-on-surface-variant);"></span></label>
            <div id="regex-output" class="tool-output" style="min-height: 60px;">输入正则和文本后自动匹配</div>
          </div>
        </div>
      </div>
    `;

    const patternEl = container.querySelector('#regex-pattern') as HTMLInputElement;
    const textEl = container.querySelector('#regex-text') as HTMLTextAreaElement;
    const outputEl = container.querySelector('#regex-output') as HTMLElement;
    const countEl = container.querySelector('#regex-count') as HTMLElement;
    const gEl = container.querySelector('#regex-g') as HTMLInputElement;
    const iEl = container.querySelector('#regex-i') as HTMLInputElement;
    const mEl = container.querySelector('#regex-m') as HTMLInputElement;

    function test() {
      const pattern = patternEl.value;
      const text = textEl.value;
      if (!pattern || !text) {
        outputEl.innerHTML = '输入正则和文本后自动匹配';
        countEl.textContent = '';
        return;
      }
      try {
        let flags = '';
        if (gEl.checked) flags += 'g';
        if (iEl.checked) flags += 'i';
        if (mEl.checked) flags += 'm';
        const re = new RegExp(pattern, flags);
        const matches: string[] = [];
        let m: RegExpExecArray | null;
        if (flags.includes('g')) {
          while ((m = re.exec(text)) !== null) {
            matches.push(m[0]);
            if (m.index === re.lastIndex) re.lastIndex++;
          }
        } else {
          m = re.exec(text);
          if (m) matches.push(m[0]);
        }
        countEl.textContent = `${matches.length} 个匹配`;
        if (matches.length === 0) {
          outputEl.innerHTML = '<span style="color: var(--color-on-surface-variant); opacity: 0.6;">无匹配结果</span>';
        } else {
          outputEl.innerHTML = matches.map((m, i) =>
            `<div style="padding: 4px 0; border-bottom: 1px solid var(--color-outline-variant);"><span style="color: var(--color-primary); font-weight: 600;">#${i + 1}</span> <code style="background: var(--color-surface-container); padding: 2px 6px; border-radius: 4px;">${escapeHtml(m)}</code></div>`
          ).join('');
        }
      } catch (e: any) {
        countEl.textContent = '';
        outputEl.innerHTML = `<span style="color: var(--color-error);">正则语法错误: ${escapeHtml(e.message)}</span>`;
      }
    }

    patternEl.addEventListener('input', test);
    textEl.addEventListener('input', test);
    gEl.addEventListener('change', test);
    iEl.addEventListener('change', test);
    mEl.addEventListener('change', test);
  },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
