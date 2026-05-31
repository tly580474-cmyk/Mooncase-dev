import { icon } from '../../core/icons';

export default {
  id: 'base64',
  name: 'Base64 编码',
  icon: 'code',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/encoding" class="tool-page-back">${icon('binary')} 编码解码</a>
          <h1 style="font: var(--text-headline-md);">Base64 编码</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">文本与 Base64 互转</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="b64-input" class="tool-textarea" rows="10" placeholder="输入需要编码的文本..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="b64-encode">编码</button>
            <button class="btn btn-primary" id="b64-decode">解码</button>
            <button class="btn btn-secondary" id="b64-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">结果</label>
            <textarea id="b64-output" class="tool-textarea" rows="10" readonly placeholder="结果将显示在这里..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="b64-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;
    const input = container.querySelector('#b64-input') as HTMLTextAreaElement;
    const output = container.querySelector('#b64-output') as HTMLTextAreaElement;

    container.querySelector('#b64-encode')!.addEventListener('click', () => {
      try {
        output.value = btoa(unescape(encodeURIComponent(input.value)));
      } catch (e: any) {
        output.value = '编码失败: ' + e.message;
      }
    });

    container.querySelector('#b64-decode')!.addEventListener('click', () => {
      try {
        output.value = decodeURIComponent(escape(atob(input.value.trim())));
      } catch (e: any) {
        output.value = '解码失败: 请输入有效的 Base64 字符串';
      }
    });

    container.querySelector('#b64-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });

    container.querySelector('#b64-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
