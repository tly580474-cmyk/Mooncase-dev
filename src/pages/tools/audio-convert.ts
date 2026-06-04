import { icon } from '../../core/icons';
import { getFFmpeg, terminateFFmpeg, formatSize, validateFileSize, downloadBlob, execWithTimeout, getLargeFileWarning } from '../../core/ffmpeg-utils';

type AudioFormat = 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg' | 'm4a' | 'wma';

const AUDIO_FORMATS: { value: AudioFormat; label: string; mime: string }[] = [
  { value: 'mp3', label: 'MP3', mime: 'audio/mpeg' },
  { value: 'wav', label: 'WAV', mime: 'audio/wav' },
  { value: 'flac', label: 'FLAC', mime: 'audio/flac' },
  { value: 'aac', label: 'AAC', mime: 'audio/aac' },
  { value: 'ogg', label: 'OGG', mime: 'audio/ogg' },
  { value: 'm4a', label: 'M4A', mime: 'audio/mp4' },
  { value: 'wma', label: 'WMA', mime: 'audio/x-ms-wma' },
];

const SUPPORTED_EXTENSIONS = new Set<string>(AUDIO_FORMATS.map(format => format.value));

function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function isSupportedAudio(file: File): boolean {
  return file.type.startsWith('audio/') || SUPPORTED_EXTENSIONS.has(getExtension(file.name));
}

function getMime(format: AudioFormat): string {
  return AUDIO_FORMATS.find(item => item.value === format)?.mime || 'application/octet-stream';
}

function getCodecArgs(format: AudioFormat, bitrate: string, oggQuality: string): string[] {
  switch (format) {
    case 'mp3':
      return ['-vn', '-codec:a', 'libmp3lame', '-b:a', bitrate];
    case 'wav':
      return ['-vn', '-codec:a', 'pcm_s16le'];
    case 'flac':
      return ['-vn', '-codec:a', 'flac', '-compression_level', '5'];
    case 'aac':
      return ['-vn', '-codec:a', 'aac', '-b:a', bitrate];
    case 'ogg':
      return ['-vn', '-codec:a', 'libvorbis', '-q:a', oggQuality];
    case 'm4a':
      return ['-vn', '-codec:a', 'aac', '-b:a', bitrate, '-movflags', '+faststart'];
    case 'wma':
      return ['-vn', '-codec:a', 'wmav2', '-b:a', bitrate];
  }
}

function getBaseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '') || 'audio';
}

export default {
  id: 'audio-convert',
  name: '音频格式转换',
  icon: 'music',
  render(container: HTMLElement) {
    container.innerHTML = `
      <style>
        .ac-dropzone {
          border: 2px dashed var(--color-outline-variant);
          border-radius: var(--radius-lg);
          padding: 36px;
          text-align: center;
          cursor: pointer;
          transition: border-color var(--transition-fast), background var(--transition-fast);
          background: var(--color-surface-container-lowest);
        }
        .ac-dropzone:hover {
          background: var(--color-surface-container-low);
        }
        .ac-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .ac-file-info,
        .ac-result-card {
          display: none;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: var(--color-surface-container);
        }
        .ac-file-info {
          color: var(--color-on-surface-variant);
          font: var(--text-body-sm);
        }
        .ac-progress-wrap {
          display: none;
        }
        .ac-progress-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
        }
        .ac-progress-track {
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: var(--color-surface-container);
        }
        .ac-progress-bar {
          width: 0%;
          height: 100%;
          border-radius: 999px;
          background: var(--color-primary);
          transition: width var(--transition-normal);
        }
        .ac-log {
          max-height: 132px;
          margin-top: 10px;
          overflow: auto;
          color: var(--color-on-surface-variant);
          font: var(--text-body-sm);
          font-family: var(--font-mono);
          white-space: pre-wrap;
        }
        .ac-result-card {
          background: var(--color-success-container);
        }
        .ac-result-main {
          flex: 1;
          min-width: 0;
        }
        .ac-result-info {
          color: var(--color-on-surface-variant);
          font: var(--text-body-sm);
          overflow-wrap: anywhere;
        }
        .ac-audio {
          width: 100%;
          min-width: 180px;
          max-width: 360px;
        }
        @media (max-width: 760px) {
          .ac-grid {
            grid-template-columns: 1fr;
          }
          .ac-result-card {
            align-items: stretch;
            flex-direction: column;
          }
          .ac-audio {
            max-width: none;
          }
        }
      </style>
      <div class="content">
        <div class="tool-page-header">
          <a href="#/conversion" class="tool-page-back">${icon('convert')} 格式转换</a>
          <h1 style="font: var(--text-headline-md);">音频格式转换</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">MP3 / WAV / FLAC / AAC / OGG / M4A / WMA 常见音频格式互转</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">上传音频</label>
            <div id="ac-dropzone" class="ac-dropzone">
              <div style="color:var(--color-on-surface-variant);margin-bottom:8px;">${icon('upload', 32)}</div>
              <p style="font:var(--text-body-md);color:var(--color-on-surface-variant);">拖拽音频到这里，或点击选择</p>
              <p style="font:var(--text-body-sm);color:var(--color-on-surface-variant);margin-top:6px;">支持 MP3、WAV、FLAC、AAC、OGG、M4A、WMA</p>
              <input type="file" id="ac-file" accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a,.wma" style="display:none;" />
            </div>
          </div>

          <div id="ac-file-info" class="ac-file-info"></div>

          <div class="ac-grid">
            <div class="tool-field">
              <label class="tool-label">目标格式</label>
              <select id="ac-format" class="tool-select">
                ${AUDIO_FORMATS.map(format => `<option value="${format.value}">${format.label}</option>`).join('')}
              </select>
            </div>
            <div class="tool-field" id="ac-bitrate-field">
              <label class="tool-label">音频比特率</label>
              <select id="ac-bitrate" class="tool-select">
                <option value="128k">128 kbps</option>
                <option value="192k" selected>192 kbps（推荐）</option>
                <option value="256k">256 kbps</option>
                <option value="320k">320 kbps</option>
              </select>
            </div>
            <div class="tool-field" id="ac-ogg-quality-field" style="display:none;">
              <label class="tool-label">OGG 质量</label>
              <select id="ac-ogg-quality" class="tool-select">
                <option value="3">标准质量</option>
                <option value="5" selected>高质量（推荐）</option>
                <option value="7">更高质量</option>
                <option value="9">最高质量</option>
              </select>
            </div>
            <div class="tool-field">
              <label class="tool-label">采样率</label>
              <select id="ac-sample-rate" class="tool-select">
                <option value="source" selected>保持原采样率</option>
                <option value="44100">44.1 kHz</option>
                <option value="48000">48 kHz</option>
                <option value="96000">96 kHz</option>
              </select>
            </div>
            <div class="tool-field">
              <label class="tool-label">声道</label>
              <select id="ac-channels" class="tool-select">
                <option value="source" selected>保持原声道</option>
                <option value="1">单声道</option>
                <option value="2">立体声</option>
              </select>
            </div>
          </div>

          <div class="tool-actions">
            <button class="btn btn-primary" id="ac-convert" type="button">${icon('convert')} 开始转换</button>
            <button class="btn btn-secondary" id="ac-clear" type="button">${icon('close')} 清空</button>
          </div>

          <div id="ac-progress-wrap" class="ac-progress-wrap">
            <div class="ac-progress-head">
              <span id="ac-status" style="font:var(--text-body-sm);color:var(--color-on-surface-variant);">准备中...</span>
              <span id="ac-pct" style="font:var(--text-body-sm);color:var(--color-primary);">0%</span>
            </div>
            <div class="ac-progress-track">
              <div id="ac-bar" class="ac-progress-bar"></div>
            </div>
            <div id="ac-log" class="ac-log"></div>
          </div>

          <div id="ac-result" class="ac-result-card">
            <span style="color:var(--color-success);">${icon('download')}</span>
            <div class="ac-result-main">
              <div style="font:var(--text-body-md);font-weight:600;">转换完成</div>
              <div id="ac-result-info" class="ac-result-info"></div>
            </div>
            <audio id="ac-preview" class="ac-audio" controls></audio>
            <button class="btn btn-primary" id="ac-download" type="button">${icon('download')} 下载</button>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#ac-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#ac-file') as HTMLInputElement;
    const fileInfo = container.querySelector('#ac-file-info') as HTMLElement;
    const formatSelect = container.querySelector('#ac-format') as HTMLSelectElement;
    const bitrateSelect = container.querySelector('#ac-bitrate') as HTMLSelectElement;
    const bitrateField = container.querySelector('#ac-bitrate-field') as HTMLElement;
    const oggQualitySelect = container.querySelector('#ac-ogg-quality') as HTMLSelectElement;
    const oggQualityField = container.querySelector('#ac-ogg-quality-field') as HTMLElement;
    const sampleRateSelect = container.querySelector('#ac-sample-rate') as HTMLSelectElement;
    const channelsSelect = container.querySelector('#ac-channels') as HTMLSelectElement;
    const convertBtn = container.querySelector('#ac-convert') as HTMLButtonElement;
    const progressWrap = container.querySelector('#ac-progress-wrap') as HTMLElement;
    const statusEl = container.querySelector('#ac-status') as HTMLElement;
    const pctEl = container.querySelector('#ac-pct') as HTMLElement;
    const bar = container.querySelector('#ac-bar') as HTMLElement;
    const logEl = container.querySelector('#ac-log') as HTMLElement;
    const resultDiv = container.querySelector('#ac-result') as HTMLElement;
    const resultInfo = container.querySelector('#ac-result-info') as HTMLElement;
    const preview = container.querySelector('#ac-preview') as HTMLAudioElement;

    let inputFile: File | null = null;
    let outputBlob: Blob | null = null;
    let previewUrl: string | null = null;

    function setPreview(blob: Blob) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(blob);
      preview.src = previewUrl;
    }

    function resetResult() {
      outputBlob = null;
      resultDiv.style.display = 'none';
      resultInfo.textContent = '';
      preview.removeAttribute('src');
      preview.load();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
      }
    }

    function updateFormatControls() {
      const format = formatSelect.value as AudioFormat;
      bitrateField.style.display = ['mp3', 'aac', 'm4a', 'wma'].includes(format) ? '' : 'none';
      oggQualityField.style.display = format === 'ogg' ? '' : 'none';
    }

    function setFile(file: File) {
      if (!isSupportedAudio(file)) {
        fileInfo.style.display = 'flex';
        fileInfo.textContent = '请选择常见音频文件（MP3、WAV、FLAC、AAC、OGG、M4A、WMA）';
        fileInfo.style.color = 'var(--color-error)';
        return;
      }

      const err = validateFileSize(file);
      if (err) {
        fileInfo.style.display = 'flex';
        fileInfo.textContent = err;
        fileInfo.style.color = 'var(--color-error)';
        return;
      }

      inputFile = file;
      const warn = getLargeFileWarning(file);
      fileInfo.style.display = 'flex';
      fileInfo.textContent = warn
        ? `${file.name} (${formatSize(file.size)}) - ${warn}`
        : `${file.name} (${formatSize(file.size)})`;
      fileInfo.style.color = warn ? 'var(--color-warning)' : '';
      resetResult();
    }

    function resetProgress() {
      logEl.textContent = '';
      bar.style.width = '0%';
      pctEl.textContent = '0%';
      statusEl.textContent = '准备中...';
      statusEl.style.color = '';
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-primary)';
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'var(--color-outline-variant)';
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      const file = e.dataTransfer?.files[0];
      if (file) setFile(file);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.[0]) setFile(fileInput.files[0]);
      fileInput.value = '';
    });
    formatSelect.addEventListener('change', () => {
      updateFormatControls();
      resetResult();
    });

    container.querySelector('#ac-clear')!.addEventListener('click', () => {
      inputFile = null;
      fileInfo.style.display = 'none';
      fileInfo.textContent = '';
      progressWrap.style.display = 'none';
      resetProgress();
      resetResult();
    });

    convertBtn.addEventListener('click', async () => {
      if (!inputFile) {
        fileInfo.style.display = 'flex';
        fileInfo.textContent = '请先上传一个音频文件';
        fileInfo.style.color = 'var(--color-error)';
        return;
      }

      const targetFormat = formatSelect.value as AudioFormat;
      const bitrate = bitrateSelect.value;
      const oggQuality = oggQualitySelect.value;
      const sampleRate = sampleRateSelect.value;
      const channels = channelsSelect.value;
      const inputExt = getExtension(inputFile.name) || 'audio';
      const inputName = `input.${inputExt}`;
      const outputName = `output.${targetFormat}`;

      convertBtn.disabled = true;
      progressWrap.style.display = '';
      resetProgress();
      resetResult();
      statusEl.textContent = '加载 FFmpeg...';

      try {
        const ffmpeg = await getFFmpeg(
          (msg) => {
            logEl.textContent += msg + '\n';
            logEl.scrollTop = logEl.scrollHeight;
          },
          (p) => {
            const pct = Math.max(0, Math.min(100, Math.round(p * 100)));
            bar.style.width = pct + '%';
            pctEl.textContent = pct + '%';
          }
        );

        statusEl.textContent = '写入文件...';
        const inputData = new Uint8Array(await inputFile.arrayBuffer());
        await ffmpeg.writeFile(inputName, inputData);

        const normalizeArgs = [
          ...(sampleRate === 'source' ? [] : ['-ar', sampleRate]),
          ...(channels === 'source' ? [] : ['-ac', channels]),
        ];
        const args = [
          '-i', inputName,
          ...getCodecArgs(targetFormat, bitrate, oggQuality),
          ...normalizeArgs,
          '-y', outputName,
        ];

        statusEl.textContent = '转换中...';
        await execWithTimeout(ffmpeg, args);

        const data = await ffmpeg.readFile(outputName);
        outputBlob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: getMime(targetFormat) });

        const sourceSize = formatSize(inputFile.size);
        const outputSize = formatSize(outputBlob.size);
        resultInfo.textContent = `${inputFile.name} (${sourceSize}) -> ${outputName} (${outputSize})`;
        setPreview(outputBlob);
        resultDiv.style.display = 'flex';
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

    container.querySelector('#ac-download')!.addEventListener('click', () => {
      if (!outputBlob || !inputFile) return;
      const ext = formatSelect.value as AudioFormat;
      downloadBlob(outputBlob, `${getBaseName(inputFile.name)}.${ext}`);
    });

    updateFormatControls();
  },
  destroy() { terminateFFmpeg(); },
};
