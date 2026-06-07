import { icon } from '../../core/icons';

export default {
  id: 'image-crop',
  name: '图片裁剪',
  icon: 'crop',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片处理</a>
          <h1 style="font: var(--text-headline-md);">图片裁剪</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">在线裁剪和调整图片尺寸</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="crop-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽图片到这里，或点击选择</p>
              <input type="file" id="crop-file" accept="image/*" style="display: none;" />
            </div>
          </div>
          <div id="crop-controls" style="display: none;">
            <div class="tool-split">
              <div class="tool-field">
                <label class="tool-label">宽度</label>
                <input type="number" id="crop-w" class="tool-input" value="200" />
              </div>
              <div class="tool-field">
                <label class="tool-label">高度</label>
                <input type="number" id="crop-h" class="tool-input" value="200" />
              </div>
            </div>
            <div class="tool-actions">
              <button class="btn btn-primary" id="crop-btn">裁剪</button>
              <button class="btn btn-ghost" id="crop-download">${icon('download')} 下载</button>
            </div>
          </div>
          <div style="display: flex; justify-content: center; padding: 16px;">
            <canvas id="crop-canvas" style="border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); max-width: 100%;"></canvas>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#crop-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#crop-file') as HTMLInputElement;
    const controls = container.querySelector('#crop-controls') as HTMLElement;
    const canvas = container.querySelector('#crop-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const wEl = container.querySelector('#crop-w') as HTMLInputElement;
    const hEl = container.querySelector('#crop-h') as HTMLInputElement;

    let img: HTMLImageElement | null = null;

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      if (e.dataTransfer?.files[0]) loadImage(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.[0]) loadImage(fileInput.files[0]);
    });

    function loadImage(file: File) {
      const i = new Image();
      i.onload = () => {
        img = i;
        wEl.value = String(Math.min(i.width, 400));
        hEl.value = String(Math.min(i.height, 400));
        controls.style.display = 'block';
        draw();
      };
      i.src = URL.createObjectURL(file);
    }

    function draw() {
      if (!img) return;
      const w = Math.min(Number(wEl.value), img.width);
      const h = Math.min(Number(hEl.value), img.height);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
    }

    wEl.addEventListener('input', draw);
    hEl.addEventListener('input', draw);
    container.querySelector('#crop-btn')!.addEventListener('click', draw);
    container.querySelector('#crop-download')!.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'cropped-image.png';
      a.click();
    });
  },
};
