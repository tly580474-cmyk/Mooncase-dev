import { icon } from '../../core/icons';

export default {
  id: 'ocr-extract',
  name: 'OCR文字识别',
  icon: 'scan_text',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片处理</a>
          <h1 style="font: var(--text-headline-md);">OCR文字识别</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">识别图片中的中英文文字，支持粘贴和拖拽上传</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="ocr-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽图片到这里、点击选择，或粘贴图片</p>
              <p style="font: var(--text-label-md); color: var(--color-outline); margin-top: 8px;">建议使用清晰、高分辨率的图片以获得最佳识别效果</p>
              <input type="file" id="ocr-file" accept="image/*" style="display: none;" />
            </div>
          </div>
          <div id="ocr-preview-area" style="display: none; text-align: center; padding: 16px;">
            <img id="ocr-preview" style="max-width: 100%; max-height: 300px; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant);" />
          </div>
          <div id="ocr-controls" style="display: none;">
            <div class="tool-field">
              <label class="tool-label">识别语言</label>
              <select id="ocr-lang" class="tool-input" style="max-width: 200px;">
                <option value="chi_sim+eng">中文 + 英文</option>
                <option value="chi_sim">中文</option>
                <option value="eng">英文</option>
              </select>
            </div>
            <div class="tool-actions">
              <button class="btn btn-primary" id="ocr-recognize">${icon('scan_text')} 开始识别</button>
            </div>
          </div>
          <div id="ocr-progress-area" style="display: none; margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span id="ocr-status" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);">准备中...</span>
              <span id="ocr-percent" style="font: var(--text-label-md); color: var(--color-primary);">0%</span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--color-surface-variant); border-radius: 3px; overflow: hidden;">
              <div id="ocr-progress-bar" style="width: 0%; height: 100%; background: var(--color-primary); transition: width 0.3s; border-radius: 3px;"></div>
            </div>
          </div>
          <div id="ocr-result-area" style="display: none;">
            <div class="tool-field">
              <label class="tool-label">识别结果</label>
              <textarea id="ocr-output" class="tool-textarea" rows="10" placeholder="识别结果将显示在这里..."></textarea>
            </div>
            <div class="tool-actions">
              <button class="btn btn-ghost" id="ocr-copy">${icon('clipboard')} 复制文字</button>
              <button class="btn btn-ghost" id="ocr-clear">${icon('close')} 清空</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#ocr-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#ocr-file') as HTMLInputElement;
    const previewArea = container.querySelector('#ocr-preview-area') as HTMLElement;
    const previewImg = container.querySelector('#ocr-preview') as HTMLImageElement;
    const controls = container.querySelector('#ocr-controls') as HTMLElement;
    const progressArea = container.querySelector('#ocr-progress-area') as HTMLElement;
    const statusBar = container.querySelector('#ocr-status') as HTMLElement;
    const percentEl = container.querySelector('#ocr-percent') as HTMLElement;
    const progressBar = container.querySelector('#ocr-progress-bar') as HTMLElement;
    const resultArea = container.querySelector('#ocr-result-area') as HTMLElement;
    const output = container.querySelector('#ocr-output') as HTMLTextAreaElement;

    let currentFile: File | null = null;

    function showFile(file: File) {
      currentFile = file;
      previewImg.src = URL.createObjectURL(file);
      previewArea.style.display = 'block';
      controls.style.display = 'block';
      resultArea.style.display = 'none';
      progressArea.style.display = 'none';
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) showFile(file);
    });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) showFile(file);
    });

    document.addEventListener('paste', onPaste);
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) showFile(blob);
          break;
        }
      }
    }

    container.querySelector('#ocr-recognize')!.addEventListener('click', async () => {
      if (!currentFile) return;

      progressArea.style.display = 'block';
      resultArea.style.display = 'none';
      statusBar.textContent = '正在加载识别引擎...';
      percentEl.textContent = '0%';
      progressBar.style.width = '0%';

      const langSelect = container.querySelector('#ocr-lang') as HTMLSelectElement;

      try {
        const Tesseract = await import('tesseract.js');
        const result = await Tesseract.recognize(currentFile, langSelect.value, {
          logger: (m: { status: string; progress: number }) => {
            const statusMap: Record<string, string> = {
              'loading tesseract core': '正在加载识别核心...',
              'initializing tesseract': '正在初始化...',
              'loading language traineddata': '正在加载语言数据（首次可能较慢）...',
              'initializing api': '正在初始化识别接口...',
              'recognizing text': '正在识别文字...',
            };
            statusBar.textContent = statusMap[m.status] || m.status;
            const pct = Math.round(m.progress * 100);
            percentEl.textContent = pct + '%';
            progressBar.style.width = pct + '%';
          },
        });

        output.value = result.data.text;
        resultArea.style.display = 'block';
        statusBar.textContent = '识别完成';
        percentEl.textContent = '100%';
        progressBar.style.width = '100%';
      } catch (err) {
        statusBar.textContent = '识别失败: ' + String(err);
      }
    });

    container.querySelector('#ocr-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
    container.querySelector('#ocr-clear')!.addEventListener('click', () => {
      output.value = '';
      resultArea.style.display = 'none';
    });
  },
  destroy() {
    document.removeEventListener('paste', () => {});
  },
};
