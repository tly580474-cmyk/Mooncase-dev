import { icon } from '../../core/icons';
import { renderAsync } from 'docx-preview';

export default {
  id: 'file-preview',
  name: 'Word/PDF 预览',
  icon: 'preview',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('abc')} 文本工具</a>
          <h1 style="font: var(--text-headline-md);">Word/PDF 预览</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">在线预览 Word (.docx) 和 PDF 文件，本地处理不上传</p>
        </div>
        <div class="tool-page-body">
          <div id="preview-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
            <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
            <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽文件到这里，或点击选择</p>
            <p style="font: var(--text-label-md); color: var(--color-outline); margin-top: 8px;">支持 .docx / .pdf 文件</p>
            <input type="file" id="preview-file" accept=".docx,.pdf" style="display: none;" />
          </div>
          <div id="preview-toolbar" style="display: none; margin: 16px 0; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span id="preview-filename" style="font: var(--text-body-md); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
            <button class="btn btn-ghost btn-icon" id="preview-zoom-out" title="缩小">${icon('compress')}</button>
            <span id="preview-zoom-level" style="font: var(--text-label-md); color: var(--color-outline); min-width: 40px; text-align: center;">100%</span>
            <button class="btn btn-ghost btn-icon" id="preview-zoom-in" title="放大">${icon('wand')}</button>
            <button class="btn btn-secondary" id="preview-clear">重新选择</button>
          </div>
          <div id="preview-styles"></div>
          <div id="preview-area" style="display: none; background: var(--color-surface-container-low); border-radius: var(--radius-lg); overflow: auto; max-height: 70vh; min-height: 300px;"></div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#preview-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#preview-file') as HTMLInputElement;
    const toolbar = container.querySelector('#preview-toolbar') as HTMLElement;
    const previewArea = container.querySelector('#preview-area') as HTMLElement;
    const previewStyles = container.querySelector('#preview-styles') as HTMLElement;
    const filenameEl = container.querySelector('#preview-filename') as HTMLElement;
    const zoomLevelEl = container.querySelector('#preview-zoom-level') as HTMLElement;

    let zoomLevel = 100;
    let pdfUrl: string | null = null;

    function setZoom(level: number) {
      zoomLevel = Math.max(50, Math.min(200, level));
      zoomLevelEl.textContent = zoomLevel + '%';
      previewArea.style.transform = `scale(${zoomLevel / 100})`;
      previewArea.style.transformOrigin = 'top left';
      previewArea.style.width = zoomLevel === 100 ? '' : `${10000 / zoomLevel}%`;
    }

    function showToolbar(name: string) {
      filenameEl.textContent = name;
      toolbar.style.display = 'flex';
      previewArea.style.display = 'block';
    }

    async function loadFile(file: File) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx') {
        await loadDocx(file);
      } else if (ext === 'pdf') {
        loadPdf(file);
      }
    }

    async function loadDocx(file: File) {
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });

      // Clear previous content
      previewArea.innerHTML = '';
      previewStyles.innerHTML = '';

      await renderAsync(blob, previewArea, previewStyles, {
        breakPages: false,
        ignoreWidth: false,
        ignoreHeight: false,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true,
        useBase64URL: false,
        trimXmlDeclaration: true,
        inWrapper: true,
        ignoreLastRenderedPageBreak: false,
      });

      showToolbar(file.name);
      zoomLevel = 100;
      zoomLevelEl.textContent = '100%';
      previewArea.style.transform = '';
      previewArea.style.width = '';
    }

    function loadPdf(file: File) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      pdfUrl = URL.createObjectURL(file);

      previewArea.innerHTML = '';
      previewStyles.innerHTML = '';

      const embed = document.createElement('embed');
      embed.src = pdfUrl;
      embed.type = 'application/pdf';
      embed.style.cssText = 'width: 100%; height: 70vh; border: none;';
      previewArea.appendChild(embed);

      showToolbar(file.name);
      zoomLevel = 100;
      zoomLevelEl.textContent = '100%';
      previewArea.style.transform = '';
      previewArea.style.width = '';
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      const file = e.dataTransfer?.files[0];
      if (file) loadFile(file);
    });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) loadFile(file);
    });

    container.querySelector('#preview-zoom-in')!.addEventListener('click', () => setZoom(zoomLevel + 10));
    container.querySelector('#preview-zoom-out')!.addEventListener('click', () => setZoom(zoomLevel - 10));

    container.querySelector('#preview-clear')!.addEventListener('click', () => {
      previewArea.innerHTML = '';
      previewArea.style.display = 'none';
      previewArea.style.transform = '';
      previewArea.style.width = '';
      previewStyles.innerHTML = '';
      toolbar.style.display = 'none';
      dropzone.style.display = 'block';
      fileInput.value = '';
      zoomLevel = 100;
      if (pdfUrl) { URL.revokeObjectURL(pdfUrl); pdfUrl = null; }
    });
  },
  destroy() {
    // cleanup handled by container clearing
  },
};
