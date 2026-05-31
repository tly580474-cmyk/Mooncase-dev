import { icon } from '../../core/icons';

function svgToBase64(svgText: string): string {
  return btoa(unescape(encodeURIComponent(svgText)));
}

export default {
  id: 'svg-to-base64',
  name: 'SVG转Base64',
  icon: 'scissors',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/code" class="tool-page-back">${icon('code')} 代码工具</a>
          <h1 style="font: var(--text-headline-md);">SVG转Base64</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将 SVG 代码或文件转换为 Base64 编码</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">粘贴 SVG 代码或上传 .svg 文件</label>
            <div id="svg-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 24px; text-align: center; cursor: pointer; transition: border-color 0.2s; margin-bottom: 12px;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 8px;">${icon('upload', 28)}</div>
              <p style="font: var(--text-body-sm); color: var(--color-on-surface-variant);">拖拽 .svg 文件到这里，或点击选择</p>
              <input type="file" id="svg-file" accept=".svg,image/svg+xml" style="display: none;" />
            </div>
            <textarea id="svg-input" class="tool-textarea" rows="10" placeholder='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>' style="font-family: var(--font-mono); font-size: 13px;"></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="svg-convert">${icon('swap_horiz')} 转换</button>
            <button class="btn btn-secondary" id="svg-clear">清空</button>
          </div>
          <div id="svg-result" style="display: none;">
            <div class="tool-field">
              <label class="tool-label">SVG 预览</label>
              <div id="svg-preview" style="border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); padding: 16px; text-align: center; min-height: 80px; background: var(--color-surface);"></div>
            </div>
            <div class="tool-field">
              <label class="tool-label">Base64 输出</label>
              <textarea id="svg-output" class="tool-textarea" rows="4" readonly placeholder="Base64 编码将显示在这里..." style="font-family: var(--font-mono); font-size: 12px;"></textarea>
            </div>
            <div class="tool-actions">
              <button class="btn btn-ghost" id="svg-copy-b64">${icon('clipboard')} 复制 Base64</button>
              <button class="btn btn-ghost" id="svg-copy-uri">${icon('clipboard')} 复制 Data URI</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#svg-input') as HTMLTextAreaElement;
    const dropzone = container.querySelector('#svg-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#svg-file') as HTMLInputElement;
    const result = container.querySelector('#svg-result') as HTMLElement;
    const preview = container.querySelector('#svg-preview') as HTMLElement;
    const output = container.querySelector('#svg-output') as HTMLTextAreaElement;

    let currentBase64 = '';
    let currentDataUri = '';

    function doConvert() {
      const svgText = input.value.trim();
      if (!svgText) { result.style.display = 'none'; return; }
      currentBase64 = svgToBase64(svgText);
      currentDataUri = 'data:image/svg+xml;base64,' + currentBase64;
      output.value = currentBase64;
      preview.innerHTML = svgText;
      const svgEl = preview.querySelector('svg');
      if (svgEl) { svgEl.style.maxWidth = '100%'; svgEl.style.maxHeight = '300px'; }
      result.style.display = 'block';
    }

    container.querySelector('#svg-convert')!.addEventListener('click', doConvert);

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      if (e.dataTransfer?.files[0]) readFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files?.[0]) readFile(fileInput.files[0]); });

    function readFile(file: File) {
      const reader = new FileReader();
      reader.onload = () => { input.value = reader.result as string; doConvert(); };
      reader.readAsText(file);
    }

    container.querySelector('#svg-copy-b64')!.addEventListener('click', () => {
      navigator.clipboard.writeText(currentBase64);
    });
    container.querySelector('#svg-copy-uri')!.addEventListener('click', () => {
      navigator.clipboard.writeText(currentDataUri);
    });
    container.querySelector('#svg-clear')!.addEventListener('click', () => {
      input.value = '';
      result.style.display = 'none';
    });
  },
};
