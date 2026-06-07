import { icon } from '../../core/icons';
import { PDFDocument } from 'pdf-lib';

export default {
  id: 'pdf-compress',
  name: 'PDF 压缩',
  icon: 'compress',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/document" class="tool-page-back">${icon('file_type')} 文档 PDF</a>
          <h1 style="font: var(--text-headline-md);">PDF 压缩</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">压缩 PDF 文件大小，移除冗余数据</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="compress-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽 PDF 文件到这里，或点击选择</p>
              <input type="file" id="compress-file" accept=".pdf" style="display: none;" />
            </div>
          </div>
          <div id="compress-info" style="display: none;">
            <div style="background: var(--color-surface-container-low); border-radius: var(--radius-lg); padding: 20px; margin: 16px 0; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px;">
              <div style="text-align: center;">
                <div style="font: var(--text-label-sm); color: var(--color-outline);">原始大小</div>
                <div id="compress-original" style="font: var(--text-headline-md); color: var(--color-on-surface); margin-top: 4px;">-</div>
              </div>
              <div style="font-size: 24px; color: var(--color-outline);">→</div>
              <div style="text-align: center;">
                <div style="font: var(--text-label-sm); color: var(--color-outline);">压缩后</div>
                <div id="compress-result-size" style="font: var(--text-headline-md); color: var(--color-primary); margin-top: 4px;">-</div>
              </div>
            </div>
            <div class="tool-actions">
              <button class="btn btn-primary" id="compress-btn">${icon('compress')} 压缩</button>
            </div>
            <div id="compress-progress" style="display: none; margin-top: 16px;">
              <div style="background: var(--color-surface-container-high); border-radius: var(--radius-full); height: 6px; overflow: hidden;">
                <div id="compress-bar" style="background: var(--color-primary); height: 100%; width: 0%; transition: width 0.3s;"></div>
              </div>
              <div id="compress-status" style="font: var(--text-label-sm); color: var(--color-outline); margin-top: 8px; text-align: center;">处理中...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    let sourceBytes: ArrayBuffer | null = null;

    const dropzone = container.querySelector('#compress-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#compress-file') as HTMLInputElement;
    const info = container.querySelector('#compress-info') as HTMLElement;

    function formatSize(bytes: number): string {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    async function loadFile(file: File) {
      sourceBytes = await file.arrayBuffer();
      (container.querySelector('#compress-original')!).textContent = formatSize(sourceBytes.byteLength);
      (container.querySelector('#compress-result-size')!).textContent = '-';
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

    container.querySelector('#compress-btn')!.addEventListener('click', async () => {
      if (!sourceBytes) return;
      const btn = container.querySelector('#compress-btn') as HTMLButtonElement;
      const progress = container.querySelector('#compress-progress') as HTMLElement;
      const bar = container.querySelector('#compress-bar') as HTMLElement;
      const status = container.querySelector('#compress-status') as HTMLElement;

      btn.disabled = true;
      progress.style.display = 'block';
      bar.style.width = '20%';
      status.textContent = '加载 PDF...';

      try {
        await new Promise(r => setTimeout(r, 100));
        bar.style.width = '40%';
        status.textContent = '解析页面结构...';

        const doc = await PDFDocument.load(sourceBytes, { updateMetadata: false });
        await new Promise(r => setTimeout(r, 100));
        bar.style.width = '60%';
        status.textContent = '压缩中...';

        // Remove metadata
        doc.setTitle('');
        doc.setAuthor('');
        doc.setSubject('');
        doc.setKeywords([]);
        doc.setProducer('');
        doc.setCreator('');

        bar.style.width = '80%';
        status.textContent = '生成文件...';

        const compressed = await doc.save({ useObjectStreams: true });


        bar.style.width = '100%';
        status.textContent = '完成';

        const resultSizeEl = container.querySelector('#compress-result-size')!;
        resultSizeEl.textContent = formatSize(compressed.byteLength);

        const originalSize = sourceBytes.byteLength;
        const compressedSize = compressed.byteLength;
        const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        if (compressedSize < originalSize) {
          resultSizeEl.textContent += ` (减少 ${ratio}%)`;
        } else {
          resultSizeEl.textContent += ' (已是最优)';
        }

        const blob = new Blob([compressed.buffer as ArrayBuffer], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'compressed.pdf';
        a.click();
        URL.revokeObjectURL(a.href);
      } catch (err) {
        status.textContent = '压缩失败: ' + (err instanceof Error ? err.message : String(err));
      } finally {
        btn.disabled = false;
        setTimeout(() => { progress.style.display = 'none'; bar.style.width = '0%'; }, 2000);
      }
    });
  },
};
