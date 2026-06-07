import { icon } from '../../core/icons';
import { PDFDocument } from 'pdf-lib';

export default {
  id: 'pdf-merge',
  name: 'PDF 合并',
  icon: 'description',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/conversion" class="tool-page-back">${icon('swap_horiz')} 格式转换</a>
          <h1 style="font: var(--text-headline-md);">PDF 合并</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将多个 PDF 文件合并为一个，支持拖拽排序</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="merge-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽 PDF 文件到这里，或点击选择</p>
              <p style="font: var(--text-label-md); color: var(--color-outline); margin-top: 8px;">支持多个 PDF 文件</p>
              <input type="file" id="merge-file" accept=".pdf" multiple style="display: none;" />
            </div>
          </div>
          <div id="merge-file-list" style="margin: 16px 0;"></div>
          <div id="merge-actions" style="display: none;">
            <div class="tool-actions">
              <button class="btn btn-primary" id="merge-btn">${icon('download')} 合并 PDF</button>
              <button class="btn btn-secondary" id="merge-clear">清空</button>
            </div>
          </div>
        </div>
      </div>
    `;

    interface PdfItem {
      file: File;
      name: string;
      pageCount: number;
      doc: PDFDocument;
    }

    const items: PdfItem[] = [];
    let dragIdx = -1;

    const dropzone = container.querySelector('#merge-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#merge-file') as HTMLInputElement;
    const fileList = container.querySelector('#merge-file-list') as HTMLElement;
    const actions = container.querySelector('#merge-actions') as HTMLElement;

    function renderList() {
      fileList.innerHTML = '';
      items.forEach((item, i) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--color-surface-container-low); border-radius: var(--radius-md); margin-bottom: 8px; cursor: grab;';
        div.draggable = true;
        div.innerHTML = `
          <span style="color: var(--color-outline); font: var(--text-label-md); width: 24px; text-align: center;">${i + 1}</span>
          <span style="flex: 1; font: var(--text-body-md); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</span>
          <span style="font: var(--text-label-sm); color: var(--color-outline);">${item.pageCount} 页</span>
          <button class="btn btn-ghost btn-icon" data-remove="${i}" title="移除">${icon('close')}</button>
        `;
        div.addEventListener('dragstart', () => { dragIdx = i; });
        div.addEventListener('dragover', (e) => { e.preventDefault(); div.style.opacity = '0.5'; });
        div.addEventListener('dragleave', () => { div.style.opacity = '1'; });
        div.addEventListener('drop', (e) => {
          e.preventDefault();
          div.style.opacity = '1';
          if (dragIdx >= 0 && dragIdx !== i) {
            const [moved] = items.splice(dragIdx, 1);
            items.splice(i, 0, moved);
            renderList();
          }
        });
        div.addEventListener('dragend', () => { dragIdx = -1; });
        fileList.appendChild(div);
      });

      fileList.querySelectorAll('[data-remove]').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-remove')!);
          items.splice(idx, 1);
          renderList();
        });
      });

      actions.style.display = items.length > 1 ? 'block' : 'none';
    }

    async function addFiles(files: FileList | File[]) {
      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) continue;
        try {
          const bytes = await file.arrayBuffer();
          const doc = await PDFDocument.load(bytes);
          items.push({ file, name: file.name, pageCount: doc.getPageCount(), doc });
        } catch {
          // skip invalid PDFs
        }
      }
      renderList();
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

    container.querySelector('#merge-btn')!.addEventListener('click', async () => {
      if (items.length < 2) return;
      const btn = container.querySelector('#merge-btn') as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = '合并中...';

      try {
        const merged = await PDFDocument.create();
        for (const item of items) {
          const copiedPages = await merged.copyPages(item.doc, item.doc.getPageIndices());
          copiedPages.forEach(page => merged.addPage(page));
        }

        const pdfBytes = await merged.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'merged.pdf';
        a.click();
        URL.revokeObjectURL(a.href);
      } catch (err) {
        console.error('PDF merge failed:', err);
      } finally {
        btn.disabled = false;
        btn.textContent = `${icon('download')} 合并 PDF`;
      }
    });

    container.querySelector('#merge-clear')!.addEventListener('click', () => {
      items.length = 0;
      renderList();
    });
  },
};
