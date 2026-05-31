import { icon } from '../../core/icons';

export default {
  id: 'image-base64-code',
  name: '图片Base64互换',
  icon: 'swap_horiz',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/code" class="tool-page-back">${icon('code')} 代码工具</a>
          <h1 style="font: var(--text-headline-md);">图片Base64互换</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">图片文件与 Base64 编码字符串双向转换</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">图片 → Base64</label>
            <div id="ibc-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 36px; text-align: center; cursor: pointer; transition: border-color 0.2s;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 8px;">${icon('upload', 32)}</div>
              <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">拖拽图片到这里，或点击选择</p>
              <input type="file" id="ibc-file" accept="image/*" style="display: none;" />
            </div>
          </div>
          <div id="ibc-to-result" style="display: none;">
            <div style="display: flex; justify-content: center; padding: 12px;">
              <img id="ibc-preview" style="max-width: 100%; max-height: 240px; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant);" />
            </div>
            <div class="tool-field">
              <label class="tool-label">Base64 输出 <span id="ibc-size" style="font-weight: 400; color: var(--color-on-surface-variant);"></span></label>
              <textarea id="ibc-to-output" class="tool-textarea" rows="5" readonly placeholder="Base64 编码将显示在这里..." style="font-family: var(--font-mono); font-size: 12px;"></textarea>
            </div>
            <div class="tool-actions">
              <button class="btn btn-ghost" id="ibc-copy-b64">${icon('clipboard')} 复制 Base64</button>
              <button class="btn btn-ghost" id="ibc-copy-uri">${icon('clipboard')} 复制 Data URI</button>
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid var(--color-outline-variant); margin: 24px 0;" />
          <div class="tool-field">
            <label class="tool-label">Base64 → 图片</label>
            <textarea id="ibc-from-input" class="tool-textarea" rows="5" placeholder="粘贴 Base64 字符串或 Data URI..." style="font-family: var(--font-mono); font-size: 12px;"></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="ibc-decode">${icon('image')} 解码显示</button>
            <button class="btn btn-secondary" id="ibc-from-clear">清空</button>
          </div>
          <div id="ibc-from-result" style="display: none; padding: 12px; text-align: center;">
            <img id="ibc-decoded-img" style="max-width: 100%; max-height: 300px; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant);" />
          </div>
          <div id="ibc-from-error" style="display: none; padding: 12px; color: var(--color-error); font: var(--text-body-md);"></div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#ibc-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#ibc-file') as HTMLInputElement;
    const toResult = container.querySelector('#ibc-to-result') as HTMLElement;
    const preview = container.querySelector('#ibc-preview') as HTMLImageElement;
    const toOutput = container.querySelector('#ibc-to-output') as HTMLTextAreaElement;
    const sizeEl = container.querySelector('#ibc-size') as HTMLElement;
    const fromInput = container.querySelector('#ibc-from-input') as HTMLTextAreaElement;
    const fromResult = container.querySelector('#ibc-from-result') as HTMLElement;
    const decodedImg = container.querySelector('#ibc-decoded-img') as HTMLImageElement;
    const fromError = container.querySelector('#ibc-from-error') as HTMLElement;

    let currentDataUrl = '';

    // Image → Base64
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      if (e.dataTransfer?.files[0]) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.[0]) processFile(fileInput.files[0]);
    });

    function processFile(file: File) {
      const reader = new FileReader();
      reader.onload = () => {
        currentDataUrl = reader.result as string;
        preview.src = currentDataUrl;
        toOutput.value = currentDataUrl.split(',')[1] || '';
        sizeEl.textContent = `(${(file.size / 1024).toFixed(1)} KB → ${(toOutput.value.length / 1024).toFixed(1)} KB)`;
        toResult.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }

    container.querySelector('#ibc-copy-b64')!.addEventListener('click', () => {
      navigator.clipboard.writeText(toOutput.value);
    });
    container.querySelector('#ibc-copy-uri')!.addEventListener('click', () => {
      navigator.clipboard.writeText(currentDataUrl);
    });

    // Base64 → Image
    container.querySelector('#ibc-decode')!.addEventListener('click', () => {
      const val = fromInput.value.trim();
      if (!val) { fromError.textContent = '请输入 Base64 字符串'; fromError.style.display = 'block'; fromResult.style.display = 'none'; return; }
      let dataUri = val;
      if (!val.startsWith('data:')) {
        dataUri = 'data:image/png;base64,' + val;
      }
      fromError.style.display = 'none';
      decodedImg.onload = () => { fromResult.style.display = 'block'; };
      decodedImg.onerror = () => { fromError.textContent = '解码失败：无效的 Base64 图片数据'; fromError.style.display = 'block'; fromResult.style.display = 'none'; };
      decodedImg.src = dataUri;
    });

    container.querySelector('#ibc-from-clear')!.addEventListener('click', () => {
      fromInput.value = '';
      fromResult.style.display = 'none';
      fromError.style.display = 'none';
    });
  },
};
