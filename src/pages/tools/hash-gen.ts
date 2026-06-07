import { icon } from '../../core/icons';

async function hash(algorithm: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest(algorithm, encoder.encode(data));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  id: 'hash-gen',
  name: '哈希生成',
  icon: 'hash',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/security" class="tool-page-back">${icon('security')} 密码安全</a>
          <h1 style="font: var(--text-headline-md);">哈希生成</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">生成文本的 MD5 / SHA-1 / SHA-256 哈希值</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="hash-input" class="tool-textarea" rows="8" placeholder="输入需要计算哈希的文本..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="hash-btn">计算哈希</button>
            <button class="btn btn-secondary" id="hash-clear">清空</button>
          </div>
          <div id="hash-results" style="display: none;">
            <div class="tool-field">
              <label class="tool-label">SHA-256</label>
              <div style="display: flex; gap: 8px;">
                <input id="hash-sha256" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                <button class="btn btn-ghost btn-icon" title="复制">${icon('clipboard')}</button>
              </div>
            </div>
            <div class="tool-field">
              <label class="tool-label">SHA-1</label>
              <div style="display: flex; gap: 8px;">
                <input id="hash-sha1" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                <button class="btn btn-ghost btn-icon" title="复制">${icon('clipboard')}</button>
              </div>
            </div>
            <div class="tool-field">
              <label class="tool-label">SHA-384</label>
              <div style="display: flex; gap: 8px;">
                <input id="hash-sha384" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                <button class="btn btn-ghost btn-icon" title="复制">${icon('clipboard')}</button>
              </div>
            </div>
            <div class="tool-field">
              <label class="tool-label">SHA-512</label>
              <div style="display: flex; gap: 8px;">
                <input id="hash-sha512" class="tool-input" readonly style="font-family: var(--font-mono); font-size: 13px;" />
                <button class="btn btn-ghost btn-icon" title="复制">${icon('clipboard')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#hash-input') as HTMLTextAreaElement;
    const results = container.querySelector('#hash-results') as HTMLElement;

    container.querySelector('#hash-btn')!.addEventListener('click', async () => {
      const text = input.value;
      if (!text) return;
      const [sha256, sha1, sha384, sha512] = await Promise.all([
        hash('SHA-256', text),
        hash('SHA-1', text),
        hash('SHA-384', text),
        hash('SHA-512', text),
      ]);
      (container.querySelector('#hash-sha256') as HTMLInputElement).value = sha256;
      (container.querySelector('#hash-sha1') as HTMLInputElement).value = sha1;
      (container.querySelector('#hash-sha384') as HTMLInputElement).value = sha384;
      (container.querySelector('#hash-sha512') as HTMLInputElement).value = sha512;
      results.style.display = 'block';
    });

    container.querySelector('#hash-clear')!.addEventListener('click', () => {
      input.value = '';
      results.style.display = 'none';
    });

    // Copy buttons
    container.querySelectorAll('[title="复制"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = (btn.closest('.tool-field')?.querySelector('.tool-input') as HTMLInputElement);
        if (input) navigator.clipboard.writeText(input.value);
      });
    });
  },
};
