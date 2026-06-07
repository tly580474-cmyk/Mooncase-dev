import { icon } from '../../core/icons';

function buf2hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function buf2base64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base642buf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as unknown as ArrayBuffer, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptAES(plaintext: string, password: string, mode: 'GCM' | 'CBC'): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(mode === 'GCM' ? 12 : 16));
  const key = await deriveKey(password, salt);

  const cipherBuf = await crypto.subtle.encrypt(
    { name: `AES-${mode}`, iv },
    key,
    enc.encode(plaintext)
  );

  // Pack: salt + iv + ciphertext
  const result = new Uint8Array(salt.length + iv.length + cipherBuf.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(cipherBuf), salt.length + iv.length);
  return buf2base64(result.buffer);
}

async function decryptAES(cipherB64: string, password: string, mode: 'GCM' | 'CBC'): Promise<string> {
  const data = new Uint8Array(base642buf(cipherB64));
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 16 + (mode === 'GCM' ? 12 : 16));
  const ciphertext = data.slice(16 + iv.length);
  const key = await deriveKey(password, salt);

  const plainBuf = await crypto.subtle.decrypt(
    { name: `AES-${mode}`, iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plainBuf);
}

export default {
  id: 'symmetric-crypto',
  name: '对称加密',
  icon: 'lock',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/security" class="tool-page-back">${icon('security')} 密码安全</a>
          <h1 style="font: var(--text-headline-md);">对称加密</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">AES-GCM / AES-CBC 加密解密</p>
        </div>
        <div class="tool-page-body">
          <div style="display: flex; gap: 8px; margin-bottom: 20px;">
            <button class="btn btn-primary" data-action="encrypt" style="flex: 1;">${icon('lock')} 加密</button>
            <button class="btn btn-ghost" data-action="decrypt" style="flex: 1;">${icon('unlock')} 解密</button>
          </div>

          <div class="tool-field">
            <label class="tool-label">算法模式</label>
            <select id="sc-mode" class="tool-select">
              <option value="GCM" selected>AES-256-GCM（推荐）</option>
              <option value="CBC">AES-256-CBC</option>
            </select>
          </div>

          <div class="tool-field">
            <label class="tool-label">密钥（密码）</label>
            <div style="display: flex; gap: 8px;">
              <input id="sc-password" class="tool-input" type="password" placeholder="输入加密密码" style="flex: 1;" />
              <button class="btn btn-ghost" id="sc-gen-key">${icon('password')} 生成随机密钥</button>
            </div>
          </div>

          <div class="tool-field">
            <label class="tool-label" id="sc-input-label">输入明文</label>
            <textarea id="sc-input" class="tool-textarea" rows="6" placeholder="输入要加密的内容..."></textarea>
          </div>

          <div class="tool-actions">
            <button class="btn btn-primary" id="sc-run">执行</button>
          </div>

          <div class="tool-field">
            <label class="tool-label">输出结果</label>
            <div style="position: relative;">
              <textarea id="sc-output" class="tool-textarea" rows="4" readonly placeholder="结果将显示在这里..."></textarea>
              <button class="btn btn-ghost" id="sc-copy" style="position: absolute; top: 4px; right: 4px; padding: 4px 8px; font-size: 11px;">${icon('content_copy')}</button>
            </div>
          </div>

          <div id="sc-error" style="display: none; padding: 10px; background: var(--color-error-container); color: var(--color-on-error-container); border-radius: var(--radius-md); font: var(--text-body-sm);"></div>
        </div>
      </div>
    `;

    let currentAction: 'encrypt' | 'decrypt' = 'encrypt';
    const inputLabel = container.querySelector('#sc-input-label')!;
    const inputEl = container.querySelector('#sc-input') as HTMLTextAreaElement;
    const outputEl = container.querySelector('#sc-output') as HTMLTextAreaElement;
    const errorEl = container.querySelector('#sc-error') as HTMLElement;

    // Mode buttons
    container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
      if (!btn) return;
      currentAction = btn.dataset.action as 'encrypt' | 'decrypt';
      container.querySelectorAll('[data-action]').forEach(b => {
        const isActive = (b as HTMLElement).dataset.action === currentAction;
        (b as HTMLElement).className = isActive ? 'btn btn-primary' : 'btn btn-ghost';
        (b as HTMLElement).style.flex = '1';
      });
      inputLabel.textContent = currentAction === 'encrypt' ? '输入明文' : '输入密文';
      inputEl.placeholder = currentAction === 'encrypt' ? '输入要加密的内容...' : '输入 Base64 密文...';
    });

    // Generate random key
    container.querySelector('#sc-gen-key')!.addEventListener('click', () => {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const key = buf2hex(bytes.buffer);
      (container.querySelector('#sc-password') as HTMLInputElement).value = key;
    });

    // Execute
    container.querySelector('#sc-run')!.addEventListener('click', async () => {
      const password = (container.querySelector('#sc-password') as HTMLInputElement).value;
      const input = inputEl.value;
      const mode = (container.querySelector('#sc-mode') as HTMLSelectElement).value as 'GCM' | 'CBC';
      errorEl.style.display = 'none';

      if (!password) { errorEl.textContent = '请输入密码'; errorEl.style.display = ''; return; }
      if (!input) { errorEl.textContent = '请输入内容'; errorEl.style.display = ''; return; }

      try {
        const result = currentAction === 'encrypt'
          ? await encryptAES(input, password, mode)
          : await decryptAES(input, password, mode);
        outputEl.value = result;
      } catch (err: any) {
        errorEl.textContent = `${currentAction === 'encrypt' ? '加密' : '解密'}失败: ${err.message || err}`;
        errorEl.style.display = '';
        outputEl.value = '';
      }
    });

    // Copy
    container.querySelector('#sc-copy')!.addEventListener('click', () => {
      if (!outputEl.value) return;
      navigator.clipboard.writeText(outputEl.value);
    });
  },
};
