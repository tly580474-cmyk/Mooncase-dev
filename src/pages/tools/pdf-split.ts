import { icon } from '../../core/icons';
import { PDFDocument } from 'pdf-lib';

export default {
  id: 'pdf-split',
  name: 'PDF 拆分',
  icon: 'description',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/conversion" class="tool-page-back">${icon('swap_horiz')} 格式转换</a>
          <h1 style="font: var(--text-headline-md);">PDF 拆分</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将 PDF 拆分为单页或按页码范围提取</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="split-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽 PDF 文件到这里，或点击选择</p>
              <input type="file" id="split-file" accept=".pdf" style="display: none;" />
            </div>
          </div>
          <div id="split-info" style="display: none;">
            <div style="background: var(--color-surface-container-low); border-radius: var(--radius-lg); padding: 16px; margin: 16px 0;">
              <span id="split-filename" style="font: var(--text-body-md);"></span>
              <span id="split-pagecount" style="font: var(--text-label-sm); color: var(--color-outline); margin-left: 8px;"></span>
            </div>
            <div class="tool-field">
              <label class="tool-label">拆分模式</label>
              <select id="split-mode" class="tool-input" style="max-width: 300px;">
                <option value="all">逐页拆分（每页一个文件）</option>
                <option value="range">按页码范围提取</option>
              </select>
            </div>
            <div id="split-range-field" class="tool-field" style="display: none;">
              <label class="tool-label">页码范围</label>
              <input id="split-range" class="tool-input" placeholder="如: 1-3, 5, 7-10" style="max-width: 300px;" />
              <div style="font: var(--text-label-sm); color: var(--color-outline); margin-top: 4px;">用逗号分隔多个范围，页码从 1 开始</div>
            </div>
            <div class="tool-actions">
              <button class="btn btn-primary" id="split-btn">${icon('download')} 拆分</button>
            </div>
          </div>
        </div>
      </div>
    `;

    let sourceDoc: PDFDocument | null = null;
    let sourceName = '';

    const dropzone = container.querySelector('#split-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#split-file') as HTMLInputElement;
    const info = container.querySelector('#split-info') as HTMLElement;

    async function loadFile(file: File) {
      const bytes = await file.arrayBuffer();
      sourceDoc = await PDFDocument.load(bytes);
      sourceName = file.name.replace(/\.pdf$/i, '');
      (container.querySelector('#split-filename')!).textContent = file.name;
      (container.querySelector('#split-pagecount')!).textContent = `共 ${sourceDoc.getPageCount()} 页`;
      info.style.display = 'block';
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

    // Toggle range field
    container.querySelector('#split-mode')!.addEventListener('change', () => {
      const mode = (container.querySelector('#split-mode') as HTMLSelectElement).value;
      (container.querySelector('#split-range-field') as HTMLElement).style.display = mode === 'range' ? 'block' : 'none';
    });

    function parseRanges(input: string, max: number): number[][] {
      const result: number[][] = [];
      for (const part of input.split(',')) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [a, b] = trimmed.split('-').map(s => parseInt(s.trim(), 10));
          if (!isNaN(a) && !isNaN(b) && a >= 1 && b >= a && b <= max) {
            result.push([a - 1, b - 1]); // 0-indexed
          }
        } else {
          const n = parseInt(trimmed, 10);
          if (!isNaN(n) && n >= 1 && n <= max) {
            result.push([n - 1, n - 1]);
          }
        }
      }
      return result;
    }

    async function downloadPdf(doc: PDFDocument, name: string) {
      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    }

    container.querySelector('#split-btn')!.addEventListener('click', async () => {
      if (!sourceDoc) return;
      const btn = container.querySelector('#split-btn') as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = '拆分中...';

      try {
        const mode = (container.querySelector('#split-mode') as HTMLSelectElement).value;
        const pageCount = sourceDoc.getPageCount();

        if (mode === 'all') {
          for (let i = 0; i < pageCount; i++) {
            const newDoc = await PDFDocument.create();
            const [page] = await newDoc.copyPages(sourceDoc, [i]);
            newDoc.addPage(page);
            await downloadPdf(newDoc, `${sourceName}_p${i + 1}.pdf`);
          }
        } else {
          const rangeInput = (container.querySelector('#split-range') as HTMLInputElement).value;
          const ranges = parseRanges(rangeInput, pageCount);
          if (ranges.length === 0) return;

          const newDoc = await PDFDocument.create();
          const indices: number[] = [];
          for (const [start, end] of ranges) {
            for (let i = start; i <= end; i++) indices.push(i);
          }
          const pages = await newDoc.copyPages(sourceDoc, indices);
          pages.forEach(p => newDoc.addPage(p));
          await downloadPdf(newDoc, `${sourceName}_extracted.pdf`);
        }
      } catch (err) {
        console.error('PDF split failed:', err);
      } finally {
        btn.disabled = false;
        btn.textContent = `${icon('download')} 拆分`;
      }
    });
  },
};
