import { icon } from '../../core/icons';
import { getFFmpeg, terminateFFmpeg, formatSize, validateFileSize, downloadBlob } from '../../core/ffmpeg-utils';

export default {
  id: 'video-to-mp3',
  name: '视频转MP3',
  icon: 'music',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/media" class="tool-page-back">${icon('film')} 音视频</a>
          <h1 style="font: var(--text-headline-md);">视频转MP3</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">从视频中提取音频为 MP3 文件</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">上传视频</label>
            <div id="va-dropzone" style="border:2px dashed var(--color-outline-variant);border-radius:var(--radius-lg);padding:36px;text-align:center;cursor:pointer;transition:border-color 0.2s;">
              <div style="color:var(--color-on-surface-variant);margin-bottom:8px;">${icon('upload',32)}</div>
              <p style="font:var(--text-body-md);color:var(--color-on-surface-variant);">拖拽视频到这里，或点击选择</p>
              <input type="file" id="va-file" accept="video/*" style="display:none;" />
            </div>
          </div>
          <div id="va-file-info" style="display:none;font:var(--text-body-sm);color:var(--color-on-surface-variant);padding:8px 12px;background:var(--color-surface-container);border-radius:var(--radius-md);"></div>
          <div class="tool-field">
            <label class="tool-label">音频比特率</label>
            <select id="va-bitrate" class="tool-select">
              <option value="128k">128 kbps（标准）</option>
              <option value="192k" selected>192 kbps（推荐）</option>
              <option value="256k">256 kbps（高质量）</option>
              <option value="320k">320 kbps（最佳）</option>
            </select>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="va-convert">${icon('convert')} 提取音频</button>
          </div>
          <div id="va-progress-wrap" style="display:none;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span id="va-status" style="font:var(--text-body-sm);color:var(--color-on-surface-variant);">准备中...</span>
              <span id="va-pct" style="font:var(--text-body-sm);color:var(--color-primary);">0%</span>
            </div>
            <div style="background:var(--color-surface-container);border-radius:999px;height:6px;overflow:hidden;">
              <div id="va-bar" style="height:100%;width:0%;background:var(--color-primary);border-radius:999px;transition:width 0.3s;"></div>
            </div>
            <div id="va-log" style="margin-top:8px;max-height:120px;overflow:auto;font:var(--text-body-sm);font-family:var(--font-mono);color:var(--color-on-surface-variant);white-space:pre-wrap;"></div>
          </div>
          <div id="va-result" style="display:none;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--color-success-container);border-radius:var(--radius-md);">
              <span style="color:var(--color-success);">${icon('download')}</span>
              <div style="flex:1;">
                <div style="font:var(--text-body-md);font-weight:600;">音频提取完成</div>
                <div id="va-result-info" style="font:var(--text-body-sm);color:var(--color-on-surface-variant);"></div>
              </div>
              <button class="btn btn-primary" id="va-download">${icon('download')} 下载 MP3</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#va-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#va-file') as HTMLInputElement;
    const fileInfo = container.querySelector('#va-file-info') as HTMLElement;
    const convertBtn = container.querySelector('#va-convert') as HTMLButtonElement;
    const progressWrap = container.querySelector('#va-progress-wrap') as HTMLElement;
    const statusEl = container.querySelector('#va-status') as HTMLElement;
    const pctEl = container.querySelector('#va-pct') as HTMLElement;
    const bar = container.querySelector('#va-bar') as HTMLElement;
    const logEl = container.querySelector('#va-log') as HTMLElement;
    const resultDiv = container.querySelector('#va-result') as HTMLElement;
    const resultInfo = container.querySelector('#va-result-info') as HTMLElement;

    let inputFile: File | null = null;
    let outputBlob: Blob | null = null;

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('video/')) setFile(file);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.[0]) setFile(fileInput.files[0]);
      fileInput.value = '';
    });

    function setFile(file: File) {
      const err = validateFileSize(file);
      if (err) { fileInfo.style.display = ''; fileInfo.textContent = err; fileInfo.style.color = 'var(--color-error)'; return; }
      inputFile = file;
      fileInfo.style.display = '';
      fileInfo.textContent = `${file.name} (${formatSize(file.size)})`;
      fileInfo.style.color = '';
      resultDiv.style.display = 'none';
    }

    convertBtn.addEventListener('click', async () => {
      if (!inputFile) return;

      const bitrate = (container.querySelector('#va-bitrate') as HTMLSelectElement).value;

      convertBtn.disabled = true;
      progressWrap.style.display = '';
      resultDiv.style.display = 'none';
      logEl.textContent = '';
      bar.style.width = '0%';
      pctEl.textContent = '0%';
      statusEl.textContent = '加载 FFmpeg...';
      statusEl.style.color = '';

      try {
        const ffmpeg = await getFFmpeg(
          (msg) => { logEl.textContent += msg + '\n'; logEl.scrollTop = logEl.scrollHeight; },
          (p) => { const pct = Math.round(p * 100); bar.style.width = pct + '%'; pctEl.textContent = pct + '%'; }
        );

        statusEl.textContent = '写入文件...';
        const inputData = new Uint8Array(await inputFile.arrayBuffer());
        const ext = inputFile.name.split('.').pop() || 'mp4';
        const inputName = 'input.' + ext;
        await ffmpeg.writeFile(inputName, inputData);

        statusEl.textContent = '提取音频...';
        await ffmpeg.exec(['-i', inputName, '-vn', '-b:a', bitrate, '-f', 'mp3', '-y', 'output.mp3']);

        const data = await ffmpeg.readFile('output.mp3');
        outputBlob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: 'audio/mpeg' });

        resultInfo.textContent = `output.mp3 (${formatSize(outputBlob.size)}) — 比特率 ${bitrate}`;
        resultDiv.style.display = '';
        bar.style.width = '100%';
        pctEl.textContent = '100%';
        statusEl.textContent = '完成';

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile('output.mp3');
      } catch (e: any) {
        statusEl.textContent = '提取失败: ' + (e.message || e);
        statusEl.style.color = 'var(--color-error)';
      } finally {
        convertBtn.disabled = false;
      }
    });

    container.querySelector('#va-download')!.addEventListener('click', () => {
      if (!outputBlob) return;
      const baseName = inputFile!.name.replace(/\.[^.]+$/, '');
      downloadBlob(outputBlob, `${baseName}.mp3`);
    });
  },
  destroy() { terminateFFmpeg(); },
};
