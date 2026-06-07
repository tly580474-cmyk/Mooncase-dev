import { icon } from '../../core/icons';

export default {
  id: 'char-count',
  name: '字符统计',
  icon: 'abc',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本处理</a>
          <h1 style="font: var(--text-headline-md);">字符统计</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">统计文本的字符数、单词数、行数</p>
        </div>

        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="cc-input" class="tool-textarea" rows="12" placeholder="在此粘贴或输入文本..."></textarea>
          </div>

          <div class="stat-grid" id="cc-stats">
            <div class="stat-card">
              <div class="stat-value" id="cc-chars">0</div>
              <div class="stat-label">字符数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="cc-chars-nospace">0</div>
              <div class="stat-label">字符数（不含空格）</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="cc-words">0</div>
              <div class="stat-label">单词数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="cc-lines">0</div>
              <div class="stat-label">行数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="cc-cn">0</div>
              <div class="stat-label">中文字符</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="cc-en">0</div>
              <div class="stat-label">英文字母</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const inputEl = container.querySelector('#cc-input') as HTMLTextAreaElement;

    function update() {
      const text = inputEl.value;
      const chars = text.length;
      const charsNoSpace = text.replace(/\s/g, '').length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text ? text.split('\n').length : 0;
      const cn = (text.match(/[一-鿿]/g) || []).length;
      const en = (text.match(/[a-zA-Z]/g) || []).length;

      (container.querySelector('#cc-chars') as HTMLElement).textContent = String(chars);
      (container.querySelector('#cc-chars-nospace') as HTMLElement).textContent = String(charsNoSpace);
      (container.querySelector('#cc-words') as HTMLElement).textContent = String(words);
      (container.querySelector('#cc-lines') as HTMLElement).textContent = String(lines);
      (container.querySelector('#cc-cn') as HTMLElement).textContent = String(cn);
      (container.querySelector('#cc-en') as HTMLElement).textContent = String(en);
    }

    inputEl.addEventListener('input', update);
  },
};
