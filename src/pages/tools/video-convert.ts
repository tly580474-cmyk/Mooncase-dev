import { icon } from '../../core/icons';
import { getFFmpeg, terminateFFmpeg, formatSize, validateFileSize, downloadBlob, execWithTimeout, getLargeFileWarning } from '../../core/ffmpeg-utils';

type VideoFormat = 'mp4' | 'mov' | 'avi' | 'mkv' | 'flv' | 'wmv';

const FORMAT_OPTIONS: { value: VideoFormat; label: string }[] = [
  { value: 'mp4', label: 'MP4' },
  { value: 'mov', label: 'MOV' },
  { value: 'avi', label: 'AVI' },
  { value: 'mkv', label: 'MKV' },
  { value: 'flv', label: 'FLV' },
  { value: 'wmv', label: 'WMV' },
];

const CODEC_MAP: Record<VideoFormat, string[]> = {
  mp4: ['-c:v', 'libx264', '-c:a', 'aac', '-movflags', '+faststart', '-threads', '0'],
  mov: ['-c:v', 'libx264', '-c:a', 'aac', '-threads', '0'],
  avi: ['-c:v', 'libx264', '-c:a', 'mp3', '-threads', '0'],
  mkv: ['-c:v', 'libx264', '-c:a', 'aac', '-threads', '0'],
  flv: ['-c:v', 'libx264', '-c:a', 'aac', '-threads', '0'],
  wmv: ['-c:v', 'wmv2', '-c:a', 'wmav2'],
};

export default {
  id: 'video-convert',
  name: '视频格式转换',
  icon: 'convert',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/media" class="tool-page-back">${icon('film')} 音视频</a>
          <h1 style="font: var(--text-headline-md);">视频格式转换</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">MP4 / MOV / AVI / MKV / FLV / WMV 视频格式互转</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">上传视频</label>
            <div id="vc-dropzone" style="border:2px dashed var(--color-outline-variant);border-radius:var(--radius-lg);padding:36px;text-align:center;cursor:pointer;transition:border-color 0.2s;">
              <div style="color:var(--color-on-surface-variant);margin-bottom:8px;">${icon('upload',32)}</div>
              <p style="font:var(--text-body-md);color:var(--color-on-surface-variant);">拖拽视频到这里，或点击选择</p>
              <input type="file" id="vc-file" accept="video/*" style="display:none;" />
            </div>
          </div>
          <div id="vc-file-info" style="display:none;font:var(--text-body-sm);color:var(--color-on-surface-variant);padding:8px 12px;background:var(--color-surface-container);border-radius:var(--radius-md);"></div>
          <div class="tool-field">
            <label class="tool-label">目标格式</label>
            <select id="vc-format" class="tool-select">
              ${FORMAT_OPTIONS.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
            </select>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="vc-convert">${icon('convert')} 开始转换</button>
          </div>
          <div id="vc-progress-wrap" style="display:none;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span id="vc-status" style="font:var(--text-body-sm);color:var(--color-on-surface-variant);">准备中...</span>
              <span id="vc-pct" style="font:var(--text-body-sm);color:var(--color-primary);">0%</span>
            </div>
            <div style="background:var(--color-surface-container);border-radius:999px;height:6px;overflow:hidden;">
              <div id="vc-bar" style="height:100%;width:0%;background:var(--color-primary);border-radius:999px;transition:width 0.3s;"></div>
            </div>
            <div id="vc-log" style="margin-top:8px;max-height:120px;overflow:auto;font:var(--text-body-sm);font-family:var(--font-mono);color:var(--color-on-surface-variant);white-space:pre-wrap;"></div>
          </div>
          <div id="vc-result" style="display:none;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--color-success-container);border-radius:var(--radius-md);">
              <span style="color:var(--color-success);">${icon('download')}</span>
              <div style="flex:1;">
                <div style="font:var(--text-body-md);font-weight:600;">转换完成</div>
                <div id="vc-result-info" style="font:var(--text-body-sm);color:var(--color-on-surface-variant);"></div>
              </div>
              <button class="btn btn-primary" id="vc-download">${icon('download')} 下载</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#vc-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#vc-file') as HTMLInputElement;
    const fileInfo = container.querySelector('#vc-file-info') as HTMLElement;
    const convertBtn = container.querySelector('#vc-convert') as HTMLButtonElement;
    const progressWrap = container.querySelector('#vc-progress-wrap') as HTMLElement;
    const statusEl = container.querySelector('#vc-status') as HTMLElement;
    const pctEl = container.querySelector('#vc-pct') as HTMLElement;
    const bar = container.querySelector('#vc-bar') as HTMLElement;
    const logEl = container.querySelector('#vc-log') as HTMLElement;
    const resultDiv = container.querySelector('#vc-result') as HTMLElement;
    const resultInfo = container.querySelector('#vc-result-info') as HTMLElement;

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
      const warn = getLargeFileWarning(file);
      fileInfo.style.display = '';
      fileInfo.textContent = warn
        ? `${file.name} (${formatSize(file.size)}) — ${warn}`
        : `${file.name} (${formatSize(file.size)})`;
      fileInfo.style.color = warn ? 'var(--color-warning)' : '';
      resultDiv.style.display = 'none';
    }

    convertBtn.addEventListener('click', async () => {
      if (!inputFile) return;
      const ext = (container.querySelector('#vc-format') as HTMLSelectElement).value as VideoFormat;

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
        const inputName = 'input.' + inputFile.name.split('.').pop();
        await ffmpeg.writeFile(inputName, inputData);

        statusEl.textContent = '转换中...';
        const outputName = 'output.' + ext;
        const args = ['-i', inputName, ...CODEC_MAP[ext], '-y', outputName];
        await execWithTimeout(ffmpeg, args);

        const data = await ffmpeg.readFile(outputName);
        outputBlob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: `video/${ext}` });

        const origSize = formatSize(inputFile.size);
        const newSize = formatSize(outputBlob.size);
        resultInfo.textContent = `${inputFile.name} (${origSize}) → output.${ext} (${newSize})`;
        resultDiv.style.display = '';
        bar.style.width = '100%';
        pctEl.textContent = '100%';
        statusEl.textContent = '完成';

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch (e: any) {
        statusEl.textContent = '转换失败: ' + (e.message || e);
        statusEl.style.color = 'var(--color-error)';
      } finally {
        convertBtn.disabled = false;
      }
    });

    container.querySelector('#vc-download')!.addEventListener('click', () => {
      if (!outputBlob) return;
      const ext = (container.querySelector('#vc-format') as HTMLSelectElement).value;
      const baseName = inputFile!.name.replace(/\.[^.]+$/, '');
      downloadBlob(outputBlob, `${baseName}.${ext}`);
    });
  },
  destroy() { terminateFFmpeg(); },
};
