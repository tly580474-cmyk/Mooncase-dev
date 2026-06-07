import { icon } from '../../core/icons';
import { Converter } from 'opencc-js';

export default {
  id: 'cn-traditional',
  name: '繁简中文转换器',
  icon: 'translate',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本处理</a>
          <h1 style="font: var(--text-headline-md);">繁简中文转换器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">简体中文与繁体中文互转</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="cn-input" class="tool-textarea" rows="10" placeholder="输入简体或繁体中文..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="cn-to-t">简体 → 繁体</button>
            <button class="btn btn-primary" id="cn-to-s">繁体 → 简体</button>
            <button class="btn btn-secondary" id="cn-swap">交换</button>
            <button class="btn btn-secondary" id="cn-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">转换结果</label>
            <textarea id="cn-output" class="tool-textarea" rows="10" readonly placeholder="结果将显示在这里..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="cn-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;

    const toTraditional = Converter({ from: 'cn', to: 't' });
    const toSimplified = Converter({ from: 't', to: 'cn' });

    const input = container.querySelector('#cn-input') as HTMLTextAreaElement;
    const output = container.querySelector('#cn-output') as HTMLTextAreaElement;

    container.querySelector('#cn-to-t')!.addEventListener('click', () => {
      output.value = toTraditional(input.value);
    });
    container.querySelector('#cn-to-s')!.addEventListener('click', () => {
      output.value = toSimplified(input.value);
    });
    container.querySelector('#cn-swap')!.addEventListener('click', () => {
      const tmp = input.value;
      input.value = output.value;
      output.value = tmp;
    });
    container.querySelector('#cn-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });
    container.querySelector('#cn-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
