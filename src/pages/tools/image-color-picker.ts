import { icon } from '../../core/icons';

export default {
  id: 'image-color-picker',
  name: '图片取色器',
  icon: 'paint_bucket',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片工具</a>
          <h1 style="font: var(--text-headline-md);">图片取色器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">从图片中提取颜色值，支持 HEX / RGB / HSL 格式</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="cp-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽图片到这里、点击选择，或粘贴图片</p>
              <input type="file" id="cp-file" accept="image/*" style="display: none;" />
            </div>
          </div>
          <div id="cp-workspace" style="display: none;">
            <div style="position: relative; display: inline-block; max-width: 100%;">
              <canvas id="cp-canvas" style="max-width: 100%; max-height: 500px; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant); cursor: crosshair; display: block;"></canvas>
              <canvas id="cp-magnifier" width="120" height="120" style="position: absolute; border: 2px solid var(--color-primary); border-radius: 50%; pointer-events: none; display: none; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></canvas>
            </div>
            <div id="cp-color-info" style="margin-top: 16px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
              <div id="cp-preview" style="width: 48px; height: 48px; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant);"></div>
              <div style="flex: 1; display: flex; flex-wrap: wrap; gap: 8px;">
                <div class="tool-field" style="flex: 1; min-width: 120px;">
                  <label class="tool-label">HEX</label>
                  <div style="display: flex; gap: 4px;">
                    <input id="cp-hex" class="tool-input" readonly style="flex: 1; font-family: var(--font-mono);" />
                    <button class="btn btn-ghost" id="cp-copy-hex" style="padding: 4px 8px;">${icon('clipboard', 16)}</button>
                  </div>
                </div>
                <div class="tool-field" style="flex: 1; min-width: 120px;">
                  <label class="tool-label">RGB</label>
                  <div style="display: flex; gap: 4px;">
                    <input id="cp-rgb" class="tool-input" readonly style="flex: 1; font-family: var(--font-mono);" />
                    <button class="btn btn-ghost" id="cp-copy-rgb" style="padding: 4px 8px;">${icon('clipboard', 16)}</button>
                  </div>
                </div>
                <div class="tool-field" style="flex: 1; min-width: 120px;">
                  <label class="tool-label">HSL</label>
                  <div style="display: flex; gap: 4px;">
                    <input id="cp-hsl" class="tool-input" readonly style="flex: 1; font-family: var(--font-mono);" />
                    <button class="btn btn-ghost" id="cp-copy-hsl" style="padding: 4px 8px;">${icon('clipboard', 16)}</button>
                  </div>
                </div>
              </div>
            </div>
            <div style="margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label class="tool-label" style="margin: 0;">取色历史</label>
                <button class="btn btn-ghost" id="cp-clear-palette" style="font-size: 12px;">清空</button>
              </div>
              <div id="cp-palette" style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 40px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#cp-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#cp-file') as HTMLInputElement;
    const workspace = container.querySelector('#cp-workspace') as HTMLElement;
    const canvas = container.querySelector('#cp-canvas') as HTMLCanvasElement;
    const magnifier = container.querySelector('#cp-magnifier') as HTMLCanvasElement;
    const preview = container.querySelector('#cp-preview') as HTMLElement;
    const hexInput = container.querySelector('#cp-hex') as HTMLInputElement;
    const rgbInput = container.querySelector('#cp-rgb') as HTMLInputElement;
    const hslInput = container.querySelector('#cp-hsl') as HTMLInputElement;
    const paletteEl = container.querySelector('#cp-palette') as HTMLElement;

    const ctx = canvas.getContext('2d')!;
    const magCtx = magnifier.getContext('2d')!;
    let imageData: ImageData | null = null;
    let palette: string[] = [];

    function rgbToHex(r: number, g: number, b: number): string {
      return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    }

    function rgbToHsl(r: number, g: number, b: number): string {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const l = (max + min) / 2;
      if (max === min) return `hsl(0, 0%, ${Math.round(l * 100)}%)`;
      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      let h = 0;
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
      return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    function loadFile(file: File) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        imageData = ctx.getImageData(0, 0, img.width, img.height);
        workspace.style.display = 'block';
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) loadFile(file);
    });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) loadFile(file);
    });

    document.addEventListener('paste', onPaste);
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) loadFile(blob);
          break;
        }
      }
    }

    function getPixelColor(x: number, y: number): [number, number, number] {
      if (!imageData) return [0, 0, 0];
      const idx = (y * imageData.width + x) * 4;
      return [imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2]];
    }

    canvas.addEventListener('mousemove', (e) => {
      if (!imageData) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * canvas.width / rect.width);
      const y = Math.floor((e.clientY - rect.top) * canvas.height / rect.height);
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

      const [r, g, b] = getPixelColor(x, y);
      const hex = rgbToHex(r, g, b);
      preview.style.background = hex;
      hexInput.value = hex.toUpperCase();
      rgbInput.value = `rgb(${r}, ${g}, ${b})`;
      hslInput.value = rgbToHsl(r, g, b);

      // Draw magnifier
      const magSize = 120;
      const zoom = 8;
      const halfCells = Math.floor(magSize / zoom / 2);
      magCtx.clearRect(0, 0, magSize, magSize);
      for (let dy = -halfCells; dy <= halfCells; dy++) {
        for (let dx = -halfCells; dx <= halfCells; dx++) {
          const px = Math.min(Math.max(x + dx, 0), canvas.width - 1);
          const py = Math.min(Math.max(y + dy, 0), canvas.height - 1);
          const [pr, pg, pb] = getPixelColor(px, py);
          magCtx.fillStyle = `rgb(${pr},${pg},${pb})`;
          magCtx.fillRect(
            (dx + halfCells) * zoom,
            (dy + halfCells) * zoom,
            zoom, zoom
          );
        }
      }
      // Crosshair
      const centerX = (halfCells * 2 + 1) * zoom / 2;
      magCtx.strokeStyle = 'rgba(255,255,255,0.8)';
      magCtx.lineWidth = 1;
      magCtx.strokeRect(centerX - zoom / 2, centerX - zoom / 2, zoom, zoom);

      magnifier.style.display = 'block';
      const magX = e.clientX - rect.left + 16;
      const magY = e.clientY - rect.top - 80;
      magnifier.style.left = Math.min(magX, rect.width - 130) + 'px';
      magnifier.style.top = Math.max(magY, 0) + 'px';
    });

    canvas.addEventListener('mouseleave', () => {
      magnifier.style.display = 'none';
    });

    canvas.addEventListener('click', (e) => {
      if (!imageData) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * canvas.width / rect.width);
      const y = Math.floor((e.clientY - rect.top) * canvas.height / rect.height);
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

      const [r, g, b] = getPixelColor(x, y);
      const hex = rgbToHex(r, g, b);
      if (!palette.includes(hex)) {
        palette.unshift(hex);
        if (palette.length > 30) palette.pop();
        renderPalette();
      }
    });

    function renderPalette() {
      paletteEl.innerHTML = palette.map(hex => `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: ${hex}; border: 1px solid var(--color-outline-variant); cursor: pointer;" title="${hex}" data-hex="${hex}"></div>
          <span style="font-size: 10px; font-family: var(--font-mono); color: var(--color-on-surface-variant);">${hex}</span>
        </div>
      `).join('');
      paletteEl.querySelectorAll('[data-hex]').forEach(el => {
        el.addEventListener('click', () => {
          navigator.clipboard.writeText(el.getAttribute('data-hex')!);
        });
      });
    }

    function copyText(text: string) {
      navigator.clipboard.writeText(text);
    }

    container.querySelector('#cp-copy-hex')!.addEventListener('click', () => copyText(hexInput.value));
    container.querySelector('#cp-copy-rgb')!.addEventListener('click', () => copyText(rgbInput.value));
    container.querySelector('#cp-copy-hsl')!.addEventListener('click', () => copyText(hslInput.value));
    container.querySelector('#cp-clear-palette')!.addEventListener('click', () => { palette = []; renderPalette(); });
  },
  destroy() {
    document.removeEventListener('paste', () => {});
  },
};
