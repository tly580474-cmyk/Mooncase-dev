import { icon } from '../../core/icons';
import { getFFmpeg, terminateFFmpeg, formatSize, validateFileSize, downloadBlob } from '../../core/ffmpeg-utils';

export default {
  id: 'video-to-gif',
  name: '视频转GIF',
  icon: 'film',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/conversion" class="tool-page-back">${icon('convert')} 格式转换</a>
          <h1 style="font: var(--text-headline-md);">视频转GIF</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将视频片段转换为 GIF 动图</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">上传视频</label>
            <div id="vg-dropzone" style="border:2px dashed var(--color-outline-variant);border-radius:var(--radius-lg);padding:36px;text-align:center;cursor:pointer;transition:border-color 0.2s;">
              <div style="color:var(--color-on-surface-variant);margin-bottom:8px;">${icon('upload',32)}</div>
              <p style="font:var(--text-body-md);color:var(--color-on-surface-variant);">拖拽视频到这里，或点击选择</p>
              <input type="file" id="vg-file" accept="video/*" style="display:none;" />
            </div>
          </div>
          <div id="vg-file-info" style="display:none;font:var(--text-body-sm);color:var(--color-on-surface-variant);padding:8px 12px;background:var(--color-surface-container);border-radius:var(--radius-md);"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div class="tool-field">
              <label class="tool-label">帧率 (FPS): <span id="vg-fps-val">10</span></label>
              <input type="range" id="vg-fps" min="5" max="30" value="10" style="width:100%;" />
            </div>
            <div class="tool-field">
              <label class="tool-label">宽度 (px): <span id="vg-w-val">480</span></label>
              <input type="range" id="vg-width" min="160" max="640" step="20" value="480" style="width:100%;" />
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div class="tool-field">
              <label class="tool-label">开始时间 (秒)</label>
              <input type="number" id="vg-start" class="tool-input" value="0" min="0" step="0.1" />
            </div>
            <div class="tool-field">
              <label class="tool-label">持续时长 (秒，0=全部)</label>
              <input type="number" id="vg-duration" class="tool-input" value="0" min="0" step="0.1" />
            </div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="vg-convert">${icon('convert')} 生成 GIF</button>
          </div>
          <div id="vg-progress-wrap" style="display:none;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span id="vg-status" style="font:var(--text-body-sm);color:var(--color-on-surface-variant);">准备中...</span>
              <span id="vg-pct" style="font:var(--text-body-sm);color:var(--color-primary);">0%</span>
            </div>
            <div style="background:var(--color-surface-container);border-radius:999px;height:6px;overflow:hidden;">
              <div id="vg-bar" style="height:100%;width:0%;background:var(--color-primary);border-radius:999px;transition:width 0.3s;"></div>
            </div>
            <div id="vg-log" style="margin-top:8px;max-height:120px;overflow:auto;font:var(--text-body-sm);font-family:var(--font-mono);color:var(--color-on-surface-variant);white-space:pre-wrap;"></div>
          </div>
          <div id="vg-result" style="display:none;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--color-success-container);border-radius:var(--radius-md);">
              <span style="color:var(--color-success);">${icon('download')}</span>
              <div style="flex:1;">
                <div style="font:var(--text-body-md);font-weight:600;">GIF 生成完成</div>
                <div id="vg-result-info" style="font:var(--text-body-sm);color:var(--color-on-surface-variant);"></div>
              </div>
              <button class="btn btn-primary" id="vg-download">${icon('download')} 下载 GIF</button>
            </div>
            <div style="display:flex;justify-content:center;padding:16px 0;">
              <img id="vg-preview" style="max-width:100%;max-height:400px;border-radius:var(--radius-md);border:1px solid var(--color-outline-variant);" />
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#vg-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#vg-file') as HTMLInputElement;
    const fileInfo = container.querySelector('#vg-file-info') as HTMLElement;
    const convertBtn = container.querySelector('#vg-convert') as HTMLButtonElement;
    const fpsSlider = container.querySelector('#vg-fps') as HTMLInputElement;
    const fpsVal = container.querySelector('#vg-fps-val') as HTMLElement;
    const widthSlider = container.querySelector('#vg-width') as HTMLInputElement;
    const widthVal = container.querySelector('#vg-w-val') as HTMLElement;
    const progressWrap = container.querySelector('#vg-progress-wrap') as HTMLElement;
    const statusEl = container.querySelector('#vg-status') as HTMLElement;
    const pctEl = container.querySelector('#vg-pct') as HTMLElement;
    const bar = container.querySelector('#vg-bar') as HTMLElement;
    const logEl = container.querySelector('#vg-log') as HTMLElement;
    const resultDiv = container.querySelector('#vg-result') as HTMLElement;
    const resultInfo = container.querySelector('#vg-result-info') as HTMLElement;
    const previewImg = container.querySelector('#vg-preview') as HTMLImageElement;

    let inputFile: File | null = null;
    let outputBlob: Blob | null = null;
    let previewUrl: string | null = null;

    fpsSlider.addEventListener('input', () => { fpsVal.textContent = fpsSlider.value; });
    widthSlider.addEventListener('input', () => { widthVal.textContent = widthSlider.value; });

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

      const fps = fpsSlider.value;
      const width = widthSlider.value;
      const startTime = (container.querySelector('#vg-start') as HTMLInputElement).value || '0';
      const duration = (container.querySelector('#vg-duration') as HTMLInputElement).value || '0';

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

        statusEl.textContent = '生成 GIF...';
        const args = ['-ss', startTime];
        if (duration !== '0') args.push('-t', duration);
        args.push('-i', inputName, '-vf', `fps=${fps},scale=${width}:-2:flags=lanczos`, '-loop', '0', '-y', 'output.gif');
        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile('output.gif');
        outputBlob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: 'image/gif' });

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(outputBlob);
        previewImg.src = previewUrl;
        resultInfo.textContent = `output.gif (${formatSize(outputBlob.size)})`;
        resultDiv.style.display = '';
        bar.style.width = '100%';
        pctEl.textContent = '100%';
        statusEl.textContent = '完成';

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile('output.gif');
      } catch (e: any) {
        statusEl.textContent = '生成失败: ' + (e.message || e);
        statusEl.style.color = 'var(--color-error)';
      } finally {
        convertBtn.disabled = false;
      }
    });

    container.querySelector('#vg-download')!.addEventListener('click', () => {
      if (!outputBlob) return;
      const baseName = inputFile!.name.replace(/\.[^.]+$/, '');
      downloadBlob(outputBlob, `${baseName}.gif`);
    });
  },
  destroy() { terminateFFmpeg(); },
};
