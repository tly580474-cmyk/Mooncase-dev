import { icon } from '../../core/icons';

export default {
  id: 'char-counter',
  name: '字符文字计数器',
  icon: 'counter',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本工具</a>
          <h1 style="font: var(--text-headline-md);">字符文字计数器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">详细统计字符、中英文、数字、标点数量</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="cc2-input" class="tool-textarea" rows="12" placeholder="在此粘贴或输入文本..." style="font-family: var(--font-mono);"></textarea>
          </div>
          <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr);">
            <div class="stat-card"><div class="stat-value" id="cc2-total">0</div><div class="stat-label">总字符数</div></div>
            <div class="stat-card"><div class="stat-value" id="cc2-nospace">0</div><div class="stat-label">不含空格</div></div>
            <div class="stat-card"><div class="stat-value" id="cc2-words">0</div><div class="stat-label">单词/词语数</div></div>
            <div class="stat-card"><div class="stat-value" id="cc2-lines">0</div><div class="stat-label">行数</div></div>
          </div>
          <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr);">
            <div class="stat-card"><div class="stat-value" id="cc2-cn" style="color: var(--color-primary);">0</div><div class="stat-label">中文汉字</div></div>
            <div class="stat-card"><div class="stat-value" id="cc2-en" style="color: #22c55e;">0</div><div class="stat-label">英文字母</div></div>
            <div class="stat-card"><div class="stat-value" id="cc2-num" style="color: #f59e0b;">0</div><div class="stat-label">数字</div></div>
            <div class="stat-card"><div class="stat-value" id="cc2-punct" style="color: var(--color-error);">0</div><div class="stat-label">标点符号</div></div>
          </div>
          <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr);">
            <div class="stat-card"><div class="stat-value" id="cc2-space">0</div><div class="stat-label">空白字符</div></div>
            <div class="stat-card"><div class="stat-value" id="cc2-symbols">0</div><div class="stat-label">特殊符号</div></div>
            <div class="stat-card"><div class="stat-value" id="cc2-bytes">0</div><div class="stat-label">UTF-8 字节</div></div>
            <div class="stat-card"><div class="stat-value" id="cc2-paragraphs">0</div><div class="stat-label">段落数</div></div>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#cc2-input') as HTMLTextAreaElement;

    function update() {
      const text = input.value;
      const len = text.length;
      const noSpace = text.replace(/\s/g, '').length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text ? text.split('\n').length : 0;
      const cn = (text.match(/[一-鿿]/g) || []).length;
      const en = (text.match(/[a-zA-Z]/g) || []).length;
      const num = (text.match(/[0-9]/g) || []).length;
      const punct = (text.match(/[!-/:-@[-`{-~　-〿＀-￯]/g) || []).length;
      const space = (text.match(/\s/g) || []).length;
      const symbols = noSpace - cn - en - num - punct;
      const bytes = new TextEncoder().encode(text).length;
      const paragraphs = text.trim() ? text.split(/\n\s*\n/).length : 0;

      const set = (id: string, v: number) => {
        (container.querySelector(id) as HTMLElement).textContent = String(v);
      };
      set('#cc2-total', len);
      set('#cc2-nospace', noSpace);
      set('#cc2-words', words);
      set('#cc2-lines', lines);
      set('#cc2-cn', cn);
      set('#cc2-en', en);
      set('#cc2-num', num);
      set('#cc2-punct', punct);
      set('#cc2-space', space);
      set('#cc2-symbols', Math.max(0, symbols));
      set('#cc2-bytes', bytes);
      set('#cc2-paragraphs', paragraphs);
    }

    input.addEventListener('input', update);
  },
};
