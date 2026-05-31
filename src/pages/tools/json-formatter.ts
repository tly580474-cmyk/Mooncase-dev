import { icon } from '../../core/icons';

export default {
  id: 'json-formatter',
  name: 'JSON 格式化',
  icon: 'data_object',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/code" class="tool-page-back">${icon('code')} 代码工具</a>
          <h1 style="font: var(--text-headline-md);">JSON 格式化</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">格式化、压缩、验证 JSON 数据</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入 JSON</label>
            <textarea id="json-input" class="tool-textarea" rows="14" placeholder='粘贴 JSON 数据...\n例如: {"name":"hello","items":[1,2,3]}'></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="json-format">格式化</button>
            <button class="btn btn-primary" id="json-minify">压缩</button>
            <button class="btn btn-secondary" id="json-validate">验证</button>
            <button class="btn btn-secondary" id="json-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">结果 <span id="json-status" style="font-weight: 400;"></span></label>
            <textarea id="json-output" class="tool-textarea" rows="14" readonly placeholder="结果将显示在这里..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="json-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;
    const input = container.querySelector('#json-input') as HTMLTextAreaElement;
    const output = container.querySelector('#json-output') as HTMLTextAreaElement;
    const status = container.querySelector('#json-status') as HTMLElement;

    container.querySelector('#json-format')!.addEventListener('click', () => {
      try {
        const obj = JSON.parse(input.value);
        output.value = JSON.stringify(obj, null, 2);
        status.textContent = '✓ 有效 JSON';
        status.style.color = 'var(--color-success)';
      } catch (e: any) {
        status.textContent = `✗ ${e.message}`;
        status.style.color = 'var(--color-error)';
      }
    });

    container.querySelector('#json-minify')!.addEventListener('click', () => {
      try {
        const obj = JSON.parse(input.value);
        output.value = JSON.stringify(obj);
        status.textContent = '✓ 已压缩';
        status.style.color = 'var(--color-success)';
      } catch (e: any) {
        status.textContent = `✗ ${e.message}`;
        status.style.color = 'var(--color-error)';
      }
    });

    container.querySelector('#json-validate')!.addEventListener('click', () => {
      try {
        JSON.parse(input.value);
        status.textContent = '✓ JSON 格式正确';
        status.style.color = 'var(--color-success)';
      } catch (e: any) {
        status.textContent = `✗ ${e.message}`;
        status.style.color = 'var(--color-error)';
      }
    });

    container.querySelector('#json-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
      status.textContent = '';
    });

    container.querySelector('#json-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
