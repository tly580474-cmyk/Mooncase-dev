import { icon } from '../../core/icons';
import qrcode from 'qrcode-generator';

type QRType = 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'sms';

const utf8Encoder = new TextEncoder();
qrcode.stringToBytes = (text: string) => Array.from(utf8Encoder.encode(text));

function escapeWifiField(value: string): string {
  return value.replace(/([\\;,":])/g, '\\$1');
}

function buildPayload(type: QRType, inputs: Record<string, string>): string {
  switch (type) {
    case 'text':
      return inputs.text || '';
    case 'url':
      return inputs.url || '';
    case 'wifi': {
      const ssid = escapeWifiField(inputs.ssid || '');
      const password = escapeWifiField(inputs.password || '');
      const enc = inputs.encryption || 'WPA';
      return `WIFI:T:${enc};S:${ssid};P:${password};;`;
    }
    case 'email': {
      const addr = inputs.email || '';
      const subject = inputs.subject || '';
      const body = inputs.body || '';
      let uri = `mailto:${addr}`;
      const params: string[] = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length) uri += '?' + params.join('&');
      return uri;
    }
    case 'phone':
      return `tel:${inputs.phone || ''}`;
    case 'sms': {
      const num = inputs.smsPhone || '';
      const body = inputs.smsBody || '';
      let uri = `smsto:${num}`;
      if (body) uri += `?body=${encodeURIComponent(body)}`;
      return uri;
    }
  }
}

function renderTypeFields(type: QRType): string {
  switch (type) {
    case 'text':
      return `
        <div class="tool-field">
          <label class="tool-label">文本内容</label>
          <textarea id="qr-text" class="tool-textarea" rows="3" placeholder="输入任意文本..."></textarea>
        </div>`;
    case 'url':
      return `
        <div class="tool-field">
          <label class="tool-label">网址</label>
          <input id="qr-url" class="tool-input" placeholder="https://example.com" />
        </div>`;
    case 'wifi':
      return `
        <div class="tool-field">
          <label class="tool-label">网络名称 (SSID)</label>
          <input id="qr-ssid" class="tool-input" placeholder="WiFi 名称" />
        </div>
        <div class="tool-field">
          <label class="tool-label">密码</label>
          <input id="qr-password" class="tool-input" type="password" placeholder="WiFi 密码" />
        </div>
        <div class="tool-field">
          <label class="tool-label">加密方式</label>
          <select id="qr-encryption" class="tool-select">
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">无密码</option>
          </select>
        </div>`;
    case 'email':
      return `
        <div class="tool-field">
          <label class="tool-label">收件人邮箱</label>
          <input id="qr-email" class="tool-input" type="email" placeholder="example@mail.com" />
        </div>
        <div class="tool-field">
          <label class="tool-label">主题（可选）</label>
          <input id="qr-subject" class="tool-input" placeholder="邮件主题" />
        </div>
        <div class="tool-field">
          <label class="tool-label">正文（可选）</label>
          <textarea id="qr-email-body" class="tool-textarea" rows="2" placeholder="邮件正文..."></textarea>
        </div>`;
    case 'phone':
      return `
        <div class="tool-field">
          <label class="tool-label">电话号码</label>
          <input id="qr-phone" class="tool-input" placeholder="+86 138xxxx8888" />
        </div>`;
    case 'sms':
      return `
        <div class="tool-field">
          <label class="tool-label">手机号码</label>
          <input id="qr-sms-phone" class="tool-input" placeholder="+86 138xxxx8888" />
        </div>
        <div class="tool-field">
          <label class="tool-label">短信内容（可选）</label>
          <textarea id="qr-sms-body" class="tool-textarea" rows="2" placeholder="短信内容..."></textarea>
        </div>`;
  }
}

export default {
  id: 'qr-code',
  name: '二维码生成',
  icon: 'qr_code_2',
  render(container: HTMLElement) {
    let currentType: QRType = 'text';
    let centerImage: HTMLImageElement | null = null;

    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/generator" class="tool-page-back">${icon('settings_suggest')} 生成器</a>
          <h1 style="font: var(--text-headline-md);">二维码生成</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">支持文本、网址、WiFi、邮箱、电话、短信等多种格式</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">内容类型</label>
            <div class="qr-type-tabs" style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${([
                ['text', '文本'], ['url', '网址'], ['wifi', 'WiFi'],
                ['email', '邮箱'], ['phone', '电话'], ['sms', '短信'],
              ] as [QRType, string][]).map(([t, label]) => `
                <button class="btn btn-ghost qr-type-btn ${t === currentType ? 'active' : ''}" data-type="${t}"
                  style="font-size: 12px; padding: 4px 12px; ${t === currentType ? 'background: var(--color-primary-container); color: var(--color-on-primary-container);' : ''}">
                  ${label}
                </button>
              `).join('')}
            </div>
          </div>
          <div id="qr-type-fields">${renderTypeFields(currentType)}</div>

          <div style="border-top: 1px solid var(--color-outline-variant); margin: 20px 0; padding-top: 20px;">
            <div class="tool-field">
              <label class="tool-label">容错率</label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${(['L', 'M', 'Q', 'H'] as const).map((level, i) => `
                  <button class="btn btn-ghost qr-ec-btn" data-ec="${level}"
                    style="font-size: 12px; padding: 4px 14px; ${i === 0 ? 'background: var(--color-primary-container); color: var(--color-on-primary-container);' : ''}">
                    ${level}（${['低 7%', '中 15%', '较高 25%', '高 30%'][i]}）
                  </button>
                `).join('')}
              </div>
            </div>

            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
              <div class="tool-field" style="flex: 1; min-width: 120px;">
                <label class="tool-label">前景色</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="color" id="qr-fg" value="#000000" style="width: 40px; height: 32px; border: none; cursor: pointer; border-radius: var(--radius-sm);" />
                  <span id="qr-fg-hex" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);">#000000</span>
                </div>
              </div>
              <div class="tool-field" style="flex: 1; min-width: 120px;">
                <label class="tool-label">背景色</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="color" id="qr-bg" value="#ffffff" style="width: 40px; height: 32px; border: none; cursor: pointer; border-radius: var(--radius-sm);" />
                  <span id="qr-bg-hex" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);">#ffffff</span>
                </div>
              </div>
              <div class="tool-field" style="flex: 1; min-width: 120px;">
                <label class="tool-label">尺寸</label>
                <select id="qr-size" class="tool-select">
                  <option value="256">256px</option>
                  <option value="512" selected>512px</option>
                  <option value="1024">1024px</option>
                </select>
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid var(--color-outline-variant); margin: 20px 0; padding-top: 20px;">
            <div class="tool-field">
              <label class="tool-label">中心图像（可选）</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <label class="btn btn-ghost" style="font-size: 12px; padding: 4px 14px; cursor: pointer;">
                  ${icon('upload')} 选择图片
                  <input type="file" id="qr-center-img" accept="image/*" style="display: none;" />
                </label>
                <span id="qr-center-name" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);">未选择</span>
                <button class="btn btn-ghost" id="qr-center-clear" style="font-size: 12px; padding: 4px 10px; display: none;">${icon('close')} 清除</button>
              </div>
              <p style="font-size: 11px; color: var(--color-on-surface-variant); opacity: 0.6; margin-top: 4px;">建议使用正方形图片，容错率选 H 以保证可扫描性</p>
            </div>
          </div>

          <div class="tool-actions">
            <button class="btn btn-primary" id="qr-gen">生成二维码</button>
            <button class="btn btn-ghost" id="qr-download">${icon('download')} 下载 PNG</button>
          </div>
          <div style="display: flex; justify-content: center; padding: 32px 0;">
            <canvas id="qr-canvas" style="border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); display: none;"></canvas>
          </div>
          <div id="qr-error" style="text-align: center; color: var(--color-error); font: var(--text-body-sm); display: none;"></div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#qr-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    let selectedEC: 'L' | 'M' | 'Q' | 'H' = 'L';

    // --- Type tabs ---
    container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.qr-type-btn') as HTMLElement;
      if (!btn) return;
      currentType = btn.dataset.type as QRType;
      container.querySelectorAll('.qr-type-btn').forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        (b as HTMLElement).style.background = isActive ? 'var(--color-primary-container)' : '';
        (b as HTMLElement).style.color = isActive ? 'var(--color-on-primary-container)' : '';
      });
      container.querySelector('#qr-type-fields')!.innerHTML = renderTypeFields(currentType);
    });

    // --- EC buttons ---
    container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.qr-ec-btn') as HTMLElement;
      if (!btn) return;
      selectedEC = btn.dataset.ec as 'L' | 'M' | 'Q' | 'H';
      container.querySelectorAll('.qr-ec-btn').forEach(b => {
        const isActive = b === btn;
        (b as HTMLElement).style.background = isActive ? 'var(--color-primary-container)' : '';
        (b as HTMLElement).style.color = isActive ? 'var(--color-on-primary-container)' : '';
      });
    });

    // --- Color hex display ---
    container.querySelector('#qr-fg')!.addEventListener('input', (e) => {
      (container.querySelector('#qr-fg-hex') as HTMLElement).textContent = (e.target as HTMLInputElement).value;
    });
    container.querySelector('#qr-bg')!.addEventListener('input', (e) => {
      (container.querySelector('#qr-bg-hex') as HTMLElement).textContent = (e.target as HTMLInputElement).value;
    });

    // --- Center image ---
    container.querySelector('#qr-center-img')!.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => {
        centerImage = img;
        (container.querySelector('#qr-center-name') as HTMLElement).textContent = file.name;
        (container.querySelector('#qr-center-clear') as HTMLElement).style.display = '';
      };
      img.src = URL.createObjectURL(file);
    });
    container.querySelector('#qr-center-clear')!.addEventListener('click', () => {
      centerImage = null;
      (container.querySelector('#qr-center-name') as HTMLElement).textContent = '未选择';
      (container.querySelector('#qr-center-clear') as HTMLElement).style.display = 'none';
      (container.querySelector('#qr-center-img') as HTMLInputElement).value = '';
    });

    // --- Generate ---
    container.querySelector('#qr-gen')!.addEventListener('click', () => {
      const inputs: Record<string, string> = {};
      container.querySelectorAll('#qr-type-fields input, #qr-type-fields textarea, #qr-type-fields select').forEach(el => {
        const id = (el as HTMLElement).id.replace('qr-', '');
        inputs[id] = (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
      });

      const payload = buildPayload(currentType, inputs);
      const errorEl = container.querySelector('#qr-error') as HTMLElement;

      if (!payload) {
        errorEl.textContent = '请输入内容';
        errorEl.style.display = '';
        canvas.style.display = 'none';
        return;
      }
      errorEl.style.display = 'none';

      const fg = (container.querySelector('#qr-fg') as HTMLInputElement).value;
      const bg = (container.querySelector('#qr-bg') as HTMLInputElement).value;
      const size = Number((container.querySelector('#qr-size') as HTMLSelectElement).value);

      let qr: ReturnType<typeof qrcode>;
      try {
        qr = qrcode(0, selectedEC);
        qr.addData(payload, 'Byte');
        qr.make();
      } catch (e: any) {
        errorEl.textContent = '生成失败: ' + (e.message || String(e));
        errorEl.style.display = '';
        canvas.style.display = 'none';
        return;
      }

      const moduleCount = qr.getModuleCount();
      const margin = 4;
      const cellSize = Math.floor(size / (moduleCount + margin * 2));
      const actualSize = cellSize * (moduleCount + margin * 2);
      canvas.width = actualSize;
      canvas.height = actualSize;
      canvas.style.display = '';

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, actualSize, actualSize);

      // Modules
      ctx.fillStyle = fg;
      const offset = cellSize * margin;
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
          }
        }
      }

      // Center image
      if (centerImage) {
        const maxSize = cellSize * moduleCount * 0.22;
        const imgW = Math.min(centerImage.naturalWidth, maxSize);
        const imgH = Math.min(centerImage.naturalHeight, maxSize);
        const imgX = (actualSize - imgW) / 2;
        const imgY = (actualSize - imgH) / 2;

        // White background behind image for contrast
        const pad = cellSize * 2;
        ctx.fillStyle = bg;
        ctx.fillRect(imgX - pad, imgY - pad, imgW + pad * 2, imgH + pad * 2);
        ctx.drawImage(centerImage, imgX, imgY, imgW, imgH);
      }
    });

    // --- Download ---
    container.querySelector('#qr-download')!.addEventListener('click', () => {
      if (canvas.style.display === 'none') return;
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  },
};
