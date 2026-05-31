import { icon } from '../../core/icons';

export default {
  id: 'unicode',
  name: 'Unicode 编解码器',
  icon: 'text_fields',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/encoding" class="tool-page-back">${icon('binary')} 编码解码</a>
          <h1 style="font: var(--text-headline-md);">Unicode 编解码器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">文本与 Unicode 转义序列互转</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="uc-input" class="tool-textarea" rows="8" placeholder="输入文本或 Unicode 转义序列（如 \\u4f60\\u597d）..."></textarea>
          </div>
          <div class="tool-field">
            <label class="tool-label">编码格式</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <label style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer;">
                <input type="radio" name="uc-format" value="unicode" checked style="accent-color: var(--color-primary);" />
                <span>\\uXXXX</span>
              </label>
              <label style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer;">
                <input type="radio" name="uc-format" value="hex" style="accent-color: var(--color-primary);" />
                <span>&amp;#xXXXX;</span>
              </label>
              <label style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer;">
                <input type="radio" name="uc-format" value="decimal" style="accent-color: var(--color-primary);" />
                <span>&amp;#DDDD;</span>
              </label>
            </div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="uc-encode">编码</button>
            <button class="btn btn-primary" id="uc-decode">解码</button>
            <button class="btn btn-secondary" id="uc-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">结果</label>
            <textarea id="uc-output" class="tool-textarea" rows="8" readonly placeholder="结果将显示在这里..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="uc-copy">${icon('content_copy')} 复制结果</button>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#uc-input') as HTMLTextAreaElement;
    const output = container.querySelector('#uc-output') as HTMLTextAreaElement;

    function getFormat(): string {
      return (container.querySelector('input[name="uc-format"]:checked') as HTMLInputElement).value;
    }

    container.querySelector('#uc-encode')!.addEventListener('click', () => {
      const text = input.value;
      const format = getFormat();
      let result = '';
      for (const char of text) {
        const code = char.codePointAt(0)!;
        if (format === 'unicode') {
          if (code > 0xFFFF) {
            result += `\\u{${code.toString(16).toUpperCase()}}`;
          } else {
            result += `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
          }
        } else if (format === 'hex') {
          result += `&#x${code.toString(16).toUpperCase()};`;
        } else {
          result += `&#${code};`;
        }
      }
      output.value = result;
    });

    container.querySelector('#uc-decode')!.addEventListener('click', () => {
      const text = input.value;
      let result = '';
      // Match \uXXXX, \u{XXXXX}, &#xXXXX;, &#DDDD;
      const regex = /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})|&#x([0-9a-fA-F]+);|&#(\d+);/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        // Add literal text between matches
        result += text.slice(lastIndex, match.index);
        lastIndex = regex.lastIndex;
        const hex1 = match[1];
        const hex2 = match[2];
        const hex3 = match[3];
        const dec = match[4];
        let code: number;
        if (hex1 !== undefined) {
          code = parseInt(hex1, 16);
        } else if (hex2 !== undefined) {
          code = parseInt(hex2, 16);
        } else if (hex3 !== undefined) {
          code = parseInt(hex3, 16);
        } else {
          code = parseInt(dec, 10);
        }
        result += String.fromCodePoint(code);
      }
      result += text.slice(lastIndex);
      output.value = result;
    });

    container.querySelector('#uc-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });

    container.querySelector('#uc-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
