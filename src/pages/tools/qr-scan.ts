import { icon } from '../../core/icons';
import jsQR from 'jsqr';

let videoStream: MediaStream | null = null;
let animFrame = 0;

function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    videoStream = null;
  }
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = 0;
  }
}

export default {
  id: 'qr-scan',
  name: '二维码扫描',
  icon: 'qr_code_scanner',
  destroy() {
    stopCamera();
  },
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/qr" class="tool-page-back">${icon('qr_code_2')} 二维码</a>
          <h1 style="font: var(--text-headline-md);">二维码扫描</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">通过摄像头实时扫描或上传图片识别二维码</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">选择方式</label>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary" id="qr-scan-camera">${icon('videocam')} 摄像头扫描</button>
              <label class="btn btn-ghost" style="cursor: pointer;">
                ${icon('upload')} 上传图片
                <input type="file" id="qr-scan-file" accept="image/*" style="display: none;" />
              </label>
            </div>
          </div>

          <div id="qr-scan-camera-box" style="display: none; margin-top: 16px;">
            <div style="position: relative; display: inline-block; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--color-outline-variant);">
              <video id="qr-scan-video" autoplay playsinline style="display: block; max-width: 100%; max-height: 400px;"></video>
              <canvas id="qr-scan-overlay" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>
            </div>
            <div style="margin-top: 8px; display: flex; gap: 8px;">
              <button class="btn btn-ghost" id="qr-scan-stop">${icon('stop')} 停止</button>
            </div>
          </div>

          <div id="qr-scan-image-box" style="display: none; margin-top: 16px;">
            <canvas id="qr-scan-img-canvas" style="max-width: 100%; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant);"></canvas>
          </div>

          <div id="qr-scan-result-box" style="display: none; margin-top: 24px;">
            <div class="tool-field">
              <label class="tool-label">识别结果</label>
              <div id="qr-scan-result" style="
                padding: 12px 16px;
                background: var(--color-surface-container);
                border-radius: var(--radius-md);
                font: var(--text-body-md);
                word-break: break-all;
                white-space: pre-wrap;
                min-height: 40px;
                position: relative;
              ">
                <span id="qr-scan-result-text"></span>
                <button class="btn btn-ghost" id="qr-scan-copy" title="复制"
                  style="position: absolute; top: 4px; right: 4px; padding: 4px 8px; font-size: 12px;">
                  ${icon('content_copy')} 复制
                </button>
              </div>
            </div>
            <div id="qr-scan-link-box" style="margin-top: 8px; display: none;">
              <a id="qr-scan-link" class="btn btn-ghost" href="#" target="_blank" rel="noopener"
                style="font-size: 13px; text-decoration: underline;">
                ${icon('open_in_new')} 在新标签页打开
              </a>
            </div>
          </div>

          <div id="qr-scan-status" style="text-align: center; margin-top: 16px; font: var(--text-body-sm); color: var(--color-on-surface-variant);"></div>
        </div>
      </div>
    `;

    const statusEl = container.querySelector('#qr-scan-status') as HTMLElement;
    const resultBox = container.querySelector('#qr-scan-result-box') as HTMLElement;
    const resultText = container.querySelector('#qr-scan-result-text') as HTMLElement;
    const linkBox = container.querySelector('#qr-scan-link-box') as HTMLElement;
    const linkEl = container.querySelector('#qr-scan-link') as HTMLAnchorElement;

    function showResult(text: string) {
      resultText.textContent = text;
      resultBox.style.display = '';
      // Check if it's a URL
      try {
        const url = new URL(text);
        linkBox.style.display = '';
        linkEl.href = url.href;
        linkEl.textContent = `${icon('open_in_new')} ${url.href}`;
      } catch {
        linkBox.style.display = 'none';
      }
    }

    // --- Copy ---
    container.querySelector('#qr-scan-copy')!.addEventListener('click', () => {
      const text = resultText.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        const btn = container.querySelector('#qr-scan-copy') as HTMLElement;
        btn.textContent = '已复制';
        setTimeout(() => { btn.innerHTML = `${icon('content_copy')} 复制`; }, 1500);
      });
    });

    // --- Camera scan ---
    container.querySelector('#qr-scan-camera')!.addEventListener('click', async () => {
      stopCamera();
      const cameraBox = container.querySelector('#qr-scan-camera-box') as HTMLElement;
      const video = container.querySelector('#qr-scan-video') as HTMLVideoElement;
      const overlay = container.querySelector('#qr-scan-overlay') as HTMLCanvasElement;
      const octx = overlay.getContext('2d')!;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        videoStream = stream;
        video.srcObject = stream;
        cameraBox.style.display = '';
        statusEl.textContent = '请将摄像头对准二维码...';
        resultBox.style.display = 'none';

        await video.play();
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;

        const scanFrame = () => {
          if (!videoStream) return;
          if (video.readyState < video.HAVE_ENOUGH_DATA) {
            animFrame = requestAnimationFrame(scanFrame);
            return;
          }

          octx.drawImage(video, 0, 0, overlay.width, overlay.height);
          const imageData = octx.getImageData(0, 0, overlay.width, overlay.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            // Draw highlight
            octx.strokeStyle = '#00ff00';
            octx.lineWidth = 3;
            octx.beginPath();
            octx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
            octx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
            octx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
            octx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
            octx.closePath();
            octx.stroke();
            showResult(code.data);
            statusEl.textContent = '识别成功！';
            stopCamera();
            return;
          }

          animFrame = requestAnimationFrame(scanFrame);
        };
        animFrame = requestAnimationFrame(scanFrame);
      } catch {
        statusEl.textContent = '无法访问摄像头，请检查浏览器权限或使用图片上传方式。';
      }
    });

    // --- Stop ---
    container.querySelector('#qr-scan-stop')!.addEventListener('click', () => {
      stopCamera();
      (container.querySelector('#qr-scan-camera-box') as HTMLElement).style.display = 'none';
      statusEl.textContent = '已停止扫描。';
    });

    // --- File upload ---
    container.querySelector('#qr-scan-file')!.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      stopCamera();

      const img = new Image();
      img.onload = () => {
        const canvas = container.querySelector('#qr-scan-img-canvas') as HTMLCanvasElement;
        const ictx = canvas.getContext('2d')!;
        // Limit display size
        const maxW = 600;
        const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
        canvas.width = Math.floor(img.naturalWidth * scale);
        canvas.height = Math.floor(img.naturalHeight * scale);
        ictx.drawImage(img, 0, 0, canvas.width, canvas.height);
        (container.querySelector('#qr-scan-image-box') as HTMLElement).style.display = '';

        const imageData = ictx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code) {
          // Draw highlight on image
          ictx.strokeStyle = '#00ff00';
          ictx.lineWidth = 3 * (1 / scale);
          ictx.beginPath();
          ictx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          ictx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
          ictx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
          ictx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
          ictx.closePath();
          ictx.stroke();
          showResult(code.data);
          statusEl.textContent = '识别成功！';
        } else {
          statusEl.textContent = '未能识别到二维码，请尝试其他图片。';
          resultBox.style.display = 'none';
        }
      };
      img.src = URL.createObjectURL(file);
    });
  },
};
