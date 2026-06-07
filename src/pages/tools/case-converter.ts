import { icon } from '../../core/icons';

export default {
  id: 'case-converter',
  name: '大小写转换器',
  icon: 'text_fields',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本处理</a>
          <h1 style="font: var(--text-headline-md);">大小写转换器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">文本大小写格式转换</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="case-input" class="tool-textarea" rows="8" placeholder="输入需要转换的文本..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="case-upper">全部大写</button>
            <button class="btn btn-primary" id="case-lower">全部小写</button>
            <button class="btn btn-primary" id="case-title">标题大小写</button>
            <button class="btn btn-primary" id="case-sentence">句首大写</button>
            <button class="btn btn-primary" id="case-toggle">大小写反转</button>
            <button class="btn btn-secondary" id="case-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">转换结果</label>
            <textarea id="case-output" class="tool-textarea" rows="8" readonly placeholder="结果将显示在这里..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="case-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#case-input') as HTMLTextAreaElement;
    const output = container.querySelector('#case-output') as HTMLTextAreaElement;

    const toTitle = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());
    const toSentence = (s: string) => s.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_m, sep, c) => sep + c.toUpperCase());
    const toggle = (s: string) => s.replace(/[a-zA-Z]/g, c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase());

    container.querySelector('#case-upper')!.addEventListener('click', () => { output.value = input.value.toUpperCase(); });
    container.querySelector('#case-lower')!.addEventListener('click', () => { output.value = input.value.toLowerCase(); });
    container.querySelector('#case-title')!.addEventListener('click', () => { output.value = toTitle(input.value); });
    container.querySelector('#case-sentence')!.addEventListener('click', () => { output.value = toSentence(input.value); });
    container.querySelector('#case-toggle')!.addEventListener('click', () => { output.value = toggle(input.value); });
    container.querySelector('#case-clear')!.addEventListener('click', () => { input.value = ''; output.value = ''; });
    container.querySelector('#case-copy')!.addEventListener('click', () => { navigator.clipboard.writeText(output.value); });
  },
};
