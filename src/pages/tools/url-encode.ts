import { icon } from '../../core/icons';

export default {
  id: 'url-encode',
  name: 'URL 编码',
  icon: 'link',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/encoding" class="tool-page-back">${icon('binary')} 编码解码</a>
          <h1 style="font: var(--text-headline-md);">URL 编码</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">URL 编码与解码</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="url-input" class="tool-textarea" rows="8" placeholder="输入需要编码的 URL 或文本..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="url-encode">编码</button>
            <button class="btn btn-primary" id="url-decode">解码</button>
            <button class="btn btn-secondary" id="url-component">组件编码</button>
            <button class="btn btn-secondary" id="url-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">结果</label>
            <textarea id="url-output" class="tool-textarea" rows="8" readonly placeholder="结果将显示在这里..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="url-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;
    const input = container.querySelector('#url-input') as HTMLTextAreaElement;
    const output = container.querySelector('#url-output') as HTMLTextAreaElement;

    container.querySelector('#url-encode')!.addEventListener('click', () => {
      output.value = encodeURI(input.value);
    });

    container.querySelector('#url-decode')!.addEventListener('click', () => {
      try {
        output.value = decodeURIComponent(input.value);
      } catch {
        output.value = '解码失败: 输入不是有效的编码字符串';
      }
    });

    container.querySelector('#url-component')!.addEventListener('click', () => {
      output.value = encodeURIComponent(input.value);
    });

    container.querySelector('#url-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });

    container.querySelector('#url-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
