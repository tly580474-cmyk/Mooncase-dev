import { icon } from '../../core/icons';

type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp' | 'image/gif';

const FORMAT_OPTIONS: { value: ImageFormat; label: string; ext: string }[] = [
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
  { value: 'image/bmp', label: 'BMP', ext: 'bmp' },
  { value: 'image/gif', label: 'GIF', ext: 'gif' },
];

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/bmp': 'bmp', 'image/gif': 'gif',
};

interface FileEntry {
  file: File;
  name: string;
  img: HTMLImageElement;
  converted?: Blob;
}

function convertImage(img: HTMLImageElement, format: ImageFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('转换失败'));
    }, format, quality);
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('无法加载图片'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

let icDebounceTimer: ReturnType<typeof setTimeout> | undefined;

export default {
  id: 'image-convert',
  name: '图片格式转换',
  icon: 'convert',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片处理</a>
          <h1 style="font: var(--text-headline-md);">图片格式转换</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">JPG / PNG / WebP / BMP / GIF 图片格式互转</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">上传图片</label>
            <div id="ic-dropzone" style="border:2px dashed var(--color-outline-variant);border-radius:var(--radius-lg);padding:36px;text-align:center;cursor:pointer;transition:border-color 0.2s;">
              <div style="color:var(--color-on-surface-variant);margin-bottom:8px;">${icon('upload',32)}</div>
              <p style="font:var(--text-body-md);color:var(--color-on-surface-variant);">拖拽图片到这里，或点击选择（支持多文件）</p>
              <input type="file" id="ic-file" accept="image/*" multiple style="display:none;" />
            </div>
          </div>
          <div class="tool-field">
            <label class="tool-label">目标格式</label>
            <select id="ic-format" class="tool-select">
              ${FORMAT_OPTIONS.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
            </select>
          </div>
          <div class="tool-field" id="ic-quality-field">
            <label class="tool-label">质量: <span id="ic-q-val">92</span>%</label>
            <input type="range" id="ic-quality" min="10" max="100" value="92" style="width:100%;" />
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="ic-convert">${icon('convert')} 全部转换</button>
            <button class="btn btn-secondary" id="ic-clear">清空</button>
          </div>
          <div id="ic-results" style="display:none;">
            <div class="tool-field">
              <label class="tool-label">转换结果</label>
              <div id="ic-result-list"></div>
            </div>
            <div class="tool-actions">
              <button class="btn btn-primary" id="ic-download-all">${icon('download')} 全部下载</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#ic-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#ic-file') as HTMLInputElement;
    const formatSelect = container.querySelector('#ic-format') as HTMLSelectElement;
    const qualitySlider = container.querySelector('#ic-quality') as HTMLInputElement;
    const qualityVal = container.querySelector('#ic-q-val') as HTMLElement;
    const qualityField = container.querySelector('#ic-quality-field') as HTMLElement;
    const resultList = container.querySelector('#ic-result-list') as HTMLElement;
    const resultsDiv = container.querySelector('#ic-results') as HTMLElement;

    let entries: FileEntry[] = [];

    // Show/hide quality slider for lossy formats
    function updateQualityVisibility() {
      const fmt = formatSelect.value;
      qualityField.style.display = (fmt === 'image/jpeg' || fmt === 'image/webp') ? '' : 'none';
    }
    formatSelect.addEventListener('change', updateQualityVisibility);
    updateQualityVisibility();

    qualitySlider.addEventListener('input', () => { qualityVal.textContent = qualitySlider.value; });

    // File handling
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      if (e.dataTransfer?.files.length) addFiles(Array.from(e.dataTransfer.files));
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.length) addFiles(Array.from(fileInput.files));
      fileInput.value = '';
    });

    async function addFiles(files: File[]) {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        try {
          const img = await loadImage(file);
          entries.push({ file, name: file.name, img });
        } catch { /* skip invalid files */ }
      }
      renderPreviews();
    }

    function renderPreviews() {
      if (entries.length === 0) { resultsDiv.style.display = 'none'; return; }
      resultsDiv.style.display = '';
      resultList.innerHTML = entries.map((e, i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px;border:1px solid var(--color-outline-variant);border-radius:var(--radius-md);margin-bottom:8px;">
          <img src="${URL.createObjectURL(e.file)}" style="width:48px;height:48px;object-fit:cover;border-radius:var(--radius-sm);" />
          <div style="flex:1;min-width:0;">
            <div style="font:var(--text-body-md);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.name}</div>
            <div style="font:var(--text-body-sm);color:var(--color-on-surface-variant);">${e.img.naturalWidth}×${e.img.naturalHeight}</div>
          </div>
          <div id="ic-status-${i}" style="font:var(--text-body-sm);color:var(--color-on-surface-variant);">待转换</div>
        </div>
      `).join('');
    }

    // Convert
    container.querySelector('#ic-convert')!.addEventListener('click', async () => {
      const format = formatSelect.value as ImageFormat;
      const quality = parseInt(qualitySlider.value) / 100;

      for (let i = 0; i < entries.length; i++) {
        const statusEl = container.querySelector(`#ic-status-${i}`) as HTMLElement;
        statusEl.textContent = '转换中...';
        statusEl.style.color = 'var(--color-primary)';
        try {
          entries[i].converted = await convertImage(entries[i].img, format, quality);
          const sizeKB = (entries[i].converted!.size / 1024).toFixed(1);
          statusEl.textContent = `完成 (${sizeKB} KB)`;
          statusEl.style.color = 'var(--color-success)';
        } catch {
          statusEl.textContent = '失败';
          statusEl.style.color = 'var(--color-error)';
        }
      }
    });

    // Download all
    container.querySelector('#ic-download-all')!.addEventListener('click', () => {
      const format = formatSelect.value as ImageFormat;
      const ext = MIME_TO_EXT[format] || 'png';
      for (const e of entries) {
        if (!e.converted) continue;
        const baseName = e.name.replace(/\.[^.]+$/, '');
        const url = URL.createObjectURL(e.converted);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });

    // Clear
    container.querySelector('#ic-clear')!.addEventListener('click', () => {
      entries = [];
      resultsDiv.style.display = 'none';
      resultList.innerHTML = '';
    });
  },
  destroy() { if (icDebounceTimer) clearTimeout(icDebounceTimer); },
};
