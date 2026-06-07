import { icon } from '../../core/icons';

export default {
  id: 'image-compress',
  name: '图片压缩',
  icon: 'compress',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片处理</a>
          <h1 style="font: var(--text-headline-md);">图片压缩</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">在线压缩图片文件大小</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="img-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer; transition: border-color var(--transition-fast);">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽图片到这里，或点击选择</p>
              <p style="font: var(--text-label-md); color: var(--color-outline); margin-top: 8px;">支持 JPG / PNG / WebP</p>
              <input type="file" id="img-file" accept="image/*" style="display: none;" />
            </div>
          </div>
          <div class="tool-field">
            <label class="tool-label">压缩质量: <span id="img-quality-val">80</span>%</label>
            <input type="range" id="img-quality" min="10" max="100" value="80" style="width: 100%; accent-color: var(--color-primary);" />
          </div>
          <div id="img-preview" style="display: none;">
            <div class="tool-split">
              <div class="stat-card">
                <div class="stat-label">原始大小</div>
                <div class="stat-value" id="img-original-size" style="font-size: 16px;">-</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">压缩后大小</div>
                <div class="stat-value" id="img-compressed-size" style="font-size: 16px;">-</div>
              </div>
            </div>
            <div style="display: flex; justify-content: center; padding: 16px;">
              <img id="img-result" style="max-width: 100%; max-height: 400px; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant);" />
            </div>
            <div class="tool-actions" style="justify-content: center;">
              <button class="btn btn-primary" id="img-download">${icon('download')} 下载压缩图片</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#img-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#img-file') as HTMLInputElement;
    const qualityEl = container.querySelector('#img-quality') as HTMLInputElement;
    const qualityVal = container.querySelector('#img-quality-val') as HTMLElement;
    const preview = container.querySelector('#img-preview') as HTMLElement;
    const resultImg = container.querySelector('#img-result') as HTMLImageElement;

    let originalBlob: Blob | null = null;

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      const file = e.dataTransfer?.files[0];
      if (file) processFile(file);
    });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) processFile(file);
    });

    function processFile(file: File) {
      originalBlob = file;
      (container.querySelector('#img-original-size') as HTMLElement).textContent = formatSize(file.size);
      compress();
    }

    function compress() {
      if (!originalBlob) return;
      const quality = Number(qualityEl.value) / 100;
      qualityVal.textContent = qualityEl.value;

      const img = new Image();
      const url = URL.createObjectURL(originalBlob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;
          resultImg.src = URL.createObjectURL(blob);
          (container.querySelector('#img-compressed-size') as HTMLElement).textContent = formatSize(blob.size);
          preview.style.display = 'block';
          // download handler
          (container.querySelector('#img-download') as HTMLElement).onclick = () => {
            const a = document.createElement('a');
            a.href = resultImg.src;
            a.download = 'compressed-image.jpg';
            a.click();
          };
        }, 'image/jpeg', quality);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    qualityEl.addEventListener('input', compress);

    function formatSize(bytes: number): string {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(2) + ' MB';
    }
  },
};
