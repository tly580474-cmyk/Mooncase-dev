import { icon } from '../../core/icons';

export default {
  id: 'image-base64',
  name: '图片转 Base64',
  icon: 'image',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片工具</a>
          <h1 style="font: var(--text-headline-md);">图片转 Base64</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将图片转换为 Base64 编码字符串</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="b64img-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽图片到这里，或点击选择</p>
              <input type="file" id="b64img-file" accept="image/*" style="display: none;" />
            </div>
          </div>
          <div id="b64img-result" style="display: none;">
            <div style="display: flex; justify-content: center; padding: 16px;">
              <img id="b64img-preview" style="max-width: 100%; max-height: 300px; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant);" />
            </div>
            <div class="tool-field">
              <label class="tool-label">Base64 输出 <span id="b64img-size" style="font-weight: 400; color: var(--color-on-surface-variant);"></span></label>
              <textarea id="b64img-output" class="tool-textarea" rows="6" readonly placeholder="Base64 编码将显示在这里..." style="font-family: var(--font-mono); font-size: 12px;"></textarea>
            </div>
            <div class="tool-actions">
              <button class="btn btn-ghost" id="b64img-copy">${icon('clipboard')} 复制</button>
              <button class="btn btn-ghost" id="b64img-datauri">${icon('clipboard')} 复制 Data URI</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#b64img-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#b64img-file') as HTMLInputElement;
    const result = container.querySelector('#b64img-result') as HTMLElement;
    const preview = container.querySelector('#b64img-preview') as HTMLImageElement;
    const output = container.querySelector('#b64img-output') as HTMLTextAreaElement;
    const sizeEl = container.querySelector('#b64img-size') as HTMLElement;

    let dataUrl = '';

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
        dataUrl = reader.result as string;
        preview.src = dataUrl;
        output.value = dataUrl.split(',')[1] || '';
        sizeEl.textContent = `(${(file.size / 1024).toFixed(1)} KB → ${(output.value.length / 1024).toFixed(1)} KB)`;
        result.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }

    container.querySelector('#b64img-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
    container.querySelector('#b64img-datauri')!.addEventListener('click', () => {
      navigator.clipboard.writeText(dataUrl);
    });
  },
};
