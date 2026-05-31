import { icon } from '../../core/icons';
import { getFFmpeg, terminateFFmpeg, formatSize, validateFileSize, downloadBlob, execWithTimeout, getLargeFileWarning } from '../../core/ffmpeg-utils';

const PRESETS = [
  { value: '32', label: '极小体积', desc: 'CRF 32 — 文件最小，画质较低' },
  { value: '28', label: '推荐', desc: 'CRF 28 — 均衡体积与画质' },
  { value: '23', label: '高质量', desc: 'CRF 23 — 默认质量，文件适中' },
  { value: '18', label: '接近原画', desc: 'CRF 18 — 高质量，文件较大' },
];

const RESOLUTIONS = [
  { value: '0', label: '保持原始分辨率' },
  { value: '1080', label: '1080p (1920×1080)' },
  { value: '720', label: '720p (1280×720)' },
  { value: '480', label: '480p (854×480)' },
];

function compressionRatio(original: number, compressed: number): string {
  const ratio = Number(((1 - compressed / original) * 100).toFixed(1));
  return ratio > 0 ? `-${ratio}%` : `+${Math.abs(ratio)}%`;
}

export default {
  id: 'video-compress',
  name: '视频压缩',
  icon: 'zap',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/conversion" class="tool-page-back">${icon('convert')} 格式转换</a>
          <h1 style="font: var(--text-headline-md);">视频压缩</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">压缩视频文件大小，支持 4K / 高清视频</p>
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
            <label class="tool-label">压缩质量</label>
            <select id="vc-preset" class="tool-select">
              ${PRESETS.map(p => `<option value="${p.value}">${p.label} — ${p.desc}</option>`).join('')}
            </select>
          </div>
          <div class="tool-field">
            <label class="tool-label">分辨率</label>
            <select id="vc-resolution" class="tool-select">
              ${RESOLUTIONS.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
            </select>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="vc-compress">${icon('zap')} 开始压缩</button>
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
            <div style="padding:16px;background:var(--color-surface-container);border-radius:var(--radius-md);margin-bottom:12px;">
              <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;text-align:center;">
                <div>
                  <div style="font:var(--text-label-md);color:var(--color-on-surface-variant);margin-bottom:4px;">原始大小</div>
                  <div id="vc-orig-size" style="font:var(--text-headline-sm);color:var(--color-on-surface);"></div>
                </div>
                <div style="font:var(--text-headline-md);color:var(--color-primary);">→</div>
                <div>
                  <div style="font:var(--text-label-md);color:var(--color-on-surface-variant);margin-bottom:4px;">压缩后</div>
                  <div id="vc-new-size" style="font:var(--text-headline-sm);color:var(--color-success);"></div>
                </div>
              </div>
              <div id="vc-ratio" style="text-align:center;margin-top:8px;font:var(--text-body-md);font-weight:600;color:var(--color-primary);"></div>
            </div>
            <div class="tool-actions" style="justify-content:center;">
              <button class="btn btn-primary" id="vc-download">${icon('download')} 下载压缩视频</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#vc-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#vc-file') as HTMLInputElement;
    const fileInfo = container.querySelector('#vc-file-info') as HTMLElement;
    const compressBtn = container.querySelector('#vc-compress') as HTMLButtonElement;
    const progressWrap = container.querySelector('#vc-progress-wrap') as HTMLElement;
    const statusEl = container.querySelector('#vc-status') as HTMLElement;
    const pctEl = container.querySelector('#vc-pct') as HTMLElement;
    const bar = container.querySelector('#vc-bar') as HTMLElement;
    const logEl = container.querySelector('#vc-log') as HTMLElement;
    const resultDiv = container.querySelector('#vc-result') as HTMLElement;
    const origSizeEl = container.querySelector('#vc-orig-size') as HTMLElement;
    const newSizeEl = container.querySelector('#vc-new-size') as HTMLElement;
    const ratioEl = container.querySelector('#vc-ratio') as HTMLElement;

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

    compressBtn.addEventListener('click', async () => {
      if (!inputFile) return;

      const crf = (container.querySelector('#vc-preset') as HTMLSelectElement).value;
      const resolution = (container.querySelector('#vc-resolution') as HTMLSelectElement).value;

      compressBtn.disabled = true;
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

        statusEl.textContent = '压缩中...';
        const args = ['-i', inputName, '-c:v', 'libx264', '-crf', crf, '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-threads', '0'];
        if (resolution !== '0') {
          args.push('-vf', `scale=-2:${resolution}`);
        }
        args.push('-y', 'output.mp4');
        await execWithTimeout(ffmpeg, args);

        const data = await ffmpeg.readFile('output.mp4');
        outputBlob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: 'video/mp4' });

        origSizeEl.textContent = formatSize(inputFile.size);
        newSizeEl.textContent = formatSize(outputBlob.size);
        ratioEl.textContent = compressionRatio(inputFile.size, outputBlob.size);
        resultDiv.style.display = '';
        bar.style.width = '100%';
        pctEl.textContent = '100%';
        statusEl.textContent = '完成';

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile('output.mp4');
      } catch (e: any) {
        statusEl.textContent = '压缩失败: ' + (e.message || e);
        statusEl.style.color = 'var(--color-error)';
      } finally {
        compressBtn.disabled = false;
      }
    });

    container.querySelector('#vc-download')!.addEventListener('click', () => {
      if (!outputBlob) return;
      const baseName = inputFile!.name.replace(/\.[^.]+$/, '');
      downloadBlob(outputBlob, `${baseName}_compressed.mp4`);
    });
  },
  destroy() { terminateFFmpeg(); },
};
