import { icon } from '../../core/icons';

async function hmacSign(algorithm: string, key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', encoder.encode(key), { name: 'HMAC', hash: algorithm }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  id: 'hmac-gen',
  name: 'HMAC 签名',
  icon: 'lock',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/security" class="tool-page-back">${icon('security')} 安全工具</a>
          <h1 style="font: var(--text-headline-md);">HMAC 签名</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">使用密钥生成 HMAC 签名</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">密钥</label>
            <input id="hmac-key" class="tool-input" type="text" placeholder="输入密钥..." />
          </div>
          <div class="tool-field">
            <label class="tool-label">算法</label>
            <select id="hmac-algo" class="tool-select">
              <option value="SHA-256" selected>HMAC-SHA256</option>
              <option value="SHA-1">HMAC-SHA1</option>
              <option value="SHA-384">HMAC-SHA384</option>
              <option value="SHA-512">HMAC-SHA512</option>
            </select>
          </div>
          <div class="tool-field">
            <label class="tool-label">消息内容</label>
            <textarea id="hmac-data" class="tool-textarea" rows="6" placeholder="输入需要签名的消息..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="hmac-btn">生成签名</button>
            <button class="btn btn-secondary" id="hmac-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">签名结果</label>
            <div style="display: flex; gap: 8px;">
              <input id="hmac-output" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" placeholder="点击生成签名..." />
              <button class="btn btn-ghost btn-icon" id="hmac-copy" title="复制">${icon('clipboard')}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const keyEl = container.querySelector('#hmac-key') as HTMLInputElement;
    const algoEl = container.querySelector('#hmac-algo') as HTMLSelectElement;
    const dataEl = container.querySelector('#hmac-data') as HTMLTextAreaElement;
    const output = container.querySelector('#hmac-output') as HTMLInputElement;

    container.querySelector('#hmac-btn')!.addEventListener('click', async () => {
      if (!keyEl.value || !dataEl.value) return;
      output.value = await hmacSign(algoEl.value, keyEl.value, dataEl.value);
    });

    container.querySelector('#hmac-clear')!.addEventListener('click', () => {
      keyEl.value = '';
      dataEl.value = '';
      output.value = '';
    });

    container.querySelector('#hmac-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
