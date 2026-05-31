import { icon } from '../../core/icons';

function beautifyHTML(html: string): string {
  let result = '';
  let indent = 0;
  const tab = '  ';
  html = html.replace(/>\s*</g, '>\n<').replace(/\n\s*\n/g, '\n');
  const lines = html.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('</')) indent = Math.max(0, indent - 1);
    result += tab.repeat(indent) + trimmed + '\n';
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !/<[^/][^>]*\/>/.test(trimmed)) {
      indent++;
    }
  }
  return result.trim();
}

function beautifyCSS(css: string): string {
  let result = '';
  let indent = 0;
  const tab = '  ';
  css = css.replace(/\{/g, ' {\n').replace(/\}/g, '\n}\n').replace(/;/g, ';\n');
  const lines = css.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === '}') indent = Math.max(0, indent - 1);
    result += tab.repeat(indent) + trimmed + '\n';
    if (trimmed.endsWith('{')) indent++;
  }
  return result.trim();
}

function beautifyJS(js: string): string {
  let result = '';
  let indent = 0;
  const tab = '  ';
  const lines = js.replace(/\{/g, ' {\n').replace(/\}/g, '\n}\n').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === '}') indent = Math.max(0, indent - 1);
    result += tab.repeat(indent) + trimmed + '\n';
    if (trimmed.endsWith('{')) indent++;
  }
  return result.trim();
}

export default {
  id: 'code-beautify',
  name: '代码美化',
  icon: 'code',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/code" class="tool-page-back">${icon('code')} 代码工具</a>
          <h1 style="font: var(--text-headline-md);">代码美化</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">HTML / CSS / JS 代码格式化</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入代码</label>
            <textarea id="beauty-input" class="tool-textarea" rows="14" placeholder="粘贴 HTML / CSS / JS 代码..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="beauty-html">格式化 HTML</button>
            <button class="btn btn-primary" id="beauty-css">格式化 CSS</button>
            <button class="btn btn-primary" id="beauty-js">格式化 JS</button>
            <button class="btn btn-secondary" id="beauty-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">格式化结果</label>
            <textarea id="beauty-output" class="tool-textarea" rows="14" readonly placeholder="结果将显示在这里..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="beauty-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;
    const input = container.querySelector('#beauty-input') as HTMLTextAreaElement;
    const output = container.querySelector('#beauty-output') as HTMLTextAreaElement;

    container.querySelector('#beauty-html')!.addEventListener('click', () => {
      output.value = beautifyHTML(input.value);
    });
    container.querySelector('#beauty-css')!.addEventListener('click', () => {
      output.value = beautifyCSS(input.value);
    });
    container.querySelector('#beauty-js')!.addEventListener('click', () => {
      output.value = beautifyJS(input.value);
    });
    container.querySelector('#beauty-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });
    container.querySelector('#beauty-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
