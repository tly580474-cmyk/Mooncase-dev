import { icon } from '../../core/icons';
import { encodeGif, type GifFrame } from '../../core/gif-encoder';

interface FrameItem {
  file: File;
  url: string;
}

export default {
  id: 'gif-maker',
  name: 'GIF制作',
  icon: 'film',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片工具</a>
          <h1 style="font: var(--text-headline-md);">GIF制作</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将多张图片合成为GIF动图</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="gif-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽图片到这里，或点击选择</p>
              <p style="font: var(--text-label-md); color: var(--color-outline); margin-top: 8px;">每张图片将作为一帧，支持 JPG / PNG / WebP</p>
              <input type="file" id="gif-file" accept="image/*" multiple style="display: none;" />
            </div>
          </div>
          <div id="gif-frames" style="display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0;"></div>
          <div id="gif-settings" style="display: none;">
            <div style="display: flex; flex-wrap: wrap; gap: 16px;">
              <div class="tool-field" style="flex: 1; min-width: 140px;">
                <label class="tool-label">帧延迟 (毫秒)</label>
                <input type="number" id="gif-delay" class="tool-input" value="200" min="20" max="5000" />
              </div>
              <div class="tool-field" style="flex: 1; min-width: 140px;">
                <label class="tool-label">循环次数</label>
                <select id="gif-loop" class="tool-input">
                  <option value="0">无限循环</option>
                  <option value="1">播放一次</option>
                  <option value="3">播放 3 次</option>
                  <option value="5">播放 5 次</option>
                </select>
              </div>
              <div class="tool-field" style="flex: 1; min-width: 140px;">
                <label class="tool-label">输出宽度</label>
                <input type="number" id="gif-width" class="tool-input" value="400" min="50" max="1920" />
              </div>
              <div class="tool-field" style="flex: 1; min-width: 140px;">
                <label class="tool-label">输出高度</label>
                <input type="number" id="gif-height" class="tool-input" value="400" min="50" max="1920" />
              </div>
            </div>
            <div class="tool-actions">
              <button class="btn btn-ghost" id="gif-preview-btn">${icon('film')} 预览动画</button>
              <button class="btn btn-primary" id="gif-generate">${icon('download')} 生成 GIF</button>
            </div>
          </div>
          <div id="gif-preview-area" style="display: none; text-align: center; margin: 16px 0;">
            <canvas id="gif-preview-canvas" style="border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); max-width: 100%;"></canvas>
          </div>
          <div id="gif-status" style="display: none; margin: 16px 0;">
            <span id="gif-status-text" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);"></span>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#gif-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#gif-file') as HTMLInputElement;
    const framesEl = container.querySelector('#gif-frames') as HTMLElement;
    const settings = container.querySelector('#gif-settings') as HTMLElement;
    const previewArea = container.querySelector('#gif-preview-area') as HTMLElement;
    const previewCanvas = container.querySelector('#gif-preview-canvas') as HTMLCanvasElement;
    const statusText = container.querySelector('#gif-status-text') as HTMLElement;
    const statusArea = container.querySelector('#gif-status') as HTMLElement;

    const frames: FrameItem[] = [];
    let dragIdx = -1;
    let previewAnimId = 0;

    function renderFrames() {
      framesEl.innerHTML = '';
      frames.forEach((f, i) => {
        const div = document.createElement('div');
        div.style.cssText = 'position: relative; width: 80px; height: 80px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--color-outline-variant); cursor: grab;';
        div.draggable = true;
        div.innerHTML = `
          <img src="${f.url}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,0.6); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 11px;" data-remove="${i}">&times;</div>
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: #fff; font-size: 9px; text-align: center;">${i + 1}</div>
        `;
        div.addEventListener('dragstart', () => { dragIdx = i; });
        div.addEventListener('dragover', (e) => { e.preventDefault(); div.style.opacity = '0.5'; });
        div.addEventListener('dragleave', () => { div.style.opacity = '1'; });
        div.addEventListener('drop', (e) => {
          e.preventDefault();
          div.style.opacity = '1';
          if (dragIdx >= 0 && dragIdx !== i) {
            const [moved] = frames.splice(dragIdx, 1);
            frames.splice(i, 0, moved);
            renderFrames();
          }
        });
        div.addEventListener('dragend', () => { dragIdx = -1; });
        framesEl.appendChild(div);
      });

      framesEl.querySelectorAll('[data-remove]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(el.getAttribute('data-remove')!);
          URL.revokeObjectURL(frames[idx].url);
          frames.splice(idx, 1);
          renderFrames();
        });
      });

      settings.style.display = frames.length > 1 ? 'block' : 'none';
    }

    function addFiles(files: FileList | File[]) {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        frames.push({ file, url: URL.createObjectURL(file) });
      }
      renderFrames();
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      if (e.dataTransfer?.files.length) addFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.length) addFiles(fileInput.files);
    });

    function loadFrameImages(): Promise<HTMLImageElement[]> {
      return Promise.all(frames.map(f => new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = f.url;
      })));
    }

    function drawFrameToCanvas(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      // Scale to fit
      const scale = Math.min(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }

    // Preview
    container.querySelector('#gif-preview-btn')!.addEventListener('click', async () => {
      if (frames.length < 2) return;
      const w = parseInt((container.querySelector('#gif-width') as HTMLInputElement).value) || 400;
      const h = parseInt((container.querySelector('#gif-height') as HTMLInputElement).value) || 400;
      const delay = parseInt((container.querySelector('#gif-delay') as HTMLInputElement).value) || 200;

      previewCanvas.width = w;
      previewCanvas.height = h;
      previewArea.style.display = 'block';
      const ctx = previewCanvas.getContext('2d')!;
      const imgs = await loadFrameImages();

      let frameIdx = 0;
      previewAnimId++;
      const myId = previewAnimId;

      function animate() {
        if (myId !== previewAnimId) return;
        drawFrameToCanvas(ctx, imgs[frameIdx], w, h);
        frameIdx = (frameIdx + 1) % imgs.length;
        setTimeout(() => requestAnimationFrame(animate), delay);
      }
      animate();
    });

    // Generate GIF
    container.querySelector('#gif-generate')!.addEventListener('click', async () => {
      if (frames.length < 2) return;
      const w = parseInt((container.querySelector('#gif-width') as HTMLInputElement).value) || 400;
      const h = parseInt((container.querySelector('#gif-height') as HTMLInputElement).value) || 400;
      const delay = parseInt((container.querySelector('#gif-delay') as HTMLInputElement).value) || 200;
      const loop = parseInt((container.querySelector('#gif-loop') as HTMLSelectElement).value);

      statusArea.style.display = 'block';
      statusText.textContent = '正在加载图片...';

      const imgs = await loadFrameImages();
      const gifFrames: GifFrame[] = [];

      for (let i = 0; i < imgs.length; i++) {
        statusText.textContent = `正在处理第 ${i + 1}/${imgs.length} 帧...`;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        drawFrameToCanvas(ctx, imgs[i], w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        gifFrames.push({ data: imageData.data, width: w, height: h, delay: Math.round(delay / 10) });

        // Yield to UI
        await new Promise(r => setTimeout(r, 0));
      }

      statusText.textContent = '正在编码GIF...';
      await new Promise(r => setTimeout(r, 0));

      const gifBytes = encodeGif(gifFrames, { width: w, height: h, loop });

      statusText.textContent = '完成！正在下载...';
      const blob = new Blob([gifBytes.buffer.slice(0) as ArrayBuffer], { type: 'image/gif' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'animation.gif';
      a.click();
      URL.revokeObjectURL(a.href);

      setTimeout(() => { statusArea.style.display = 'none'; }, 2000);
    });
  },
};
