import { icon } from '../../core/icons';

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default {
  id: 'jwt-decode',
  name: 'JWT 解码器',
  icon: 'key',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/encoding" class="tool-page-back">${icon('binary')} 编码解码</a>
          <h1 style="font: var(--text-headline-md);">JWT 解码器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">解码 JWT Token，查看 Header、Payload 和签名</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">粘贴 JWT Token</label>
            <textarea id="jwt-input" class="tool-textarea" rows="4" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"></textarea>
          </div>

          <div id="jwt-error" style="display: none; padding: 12px 16px; background: var(--color-error-container); border: 1px solid var(--color-error); border-radius: var(--radius-md); margin-bottom: 16px;">
            <span id="jwt-error-text" style="color: var(--color-error); font: var(--text-body-sm);"></span>
          </div>

          <div id="jwt-result" style="display: none;">
            <div class="tool-field">
              <label class="tool-label" style="color: var(--color-primary);">Header</label>
              <pre id="jwt-header" class="tool-textarea" style="overflow: auto; white-space: pre-wrap; min-height: 60px; font-family: var(--font-mono); font-size: 13px;"></pre>
            </div>
            <div class="tool-field">
              <label class="tool-label" style="color: var(--color-primary);">Payload</label>
              <pre id="jwt-payload" class="tool-textarea" style="overflow: auto; white-space: pre-wrap; min-height: 120px; font-family: var(--font-mono); font-size: 13px;"></pre>
            </div>
            <div class="tool-field">
              <label class="tool-label" style="color: var(--color-primary);">Signature</label>
              <pre id="jwt-signature" class="tool-textarea" style="overflow: auto; white-space: pre-wrap; min-height: 40px; font-family: var(--font-mono); font-size: 13px; word-break: break-all;"></pre>
            </div>
            <div id="jwt-meta" style="display: none; padding: 12px 16px; background: var(--color-surface-variant); border-radius: var(--radius-md); margin-bottom: 16px;">
              <div id="jwt-meta-content" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#jwt-input') as HTMLTextAreaElement;
    const errorArea = container.querySelector('#jwt-error') as HTMLElement;
    const errorText = container.querySelector('#jwt-error-text') as HTMLElement;
    const resultArea = container.querySelector('#jwt-result') as HTMLElement;
    const headerEl = container.querySelector('#jwt-header') as HTMLElement;
    const payloadEl = container.querySelector('#jwt-payload') as HTMLElement;
    const signatureEl = container.querySelector('#jwt-signature') as HTMLElement;
    const metaArea = container.querySelector('#jwt-meta') as HTMLElement;
    const metaContent = container.querySelector('#jwt-meta-content') as HTMLElement;

    function decode() {
      const token = input.value.trim();
      if (!token) {
        errorArea.style.display = 'none';
        resultArea.style.display = 'none';
        return;
      }

      const parts = token.split('.');
      if (parts.length < 2 || parts.length > 3) {
        errorArea.style.display = 'block';
        errorText.textContent = '无效的 JWT 格式：Token 应由 2 或 3 个部分组成（以 . 分隔）';
        resultArea.style.display = 'none';
        return;
      }

      try {
        const headerJson = JSON.parse(base64UrlDecode(parts[0]));
        headerEl.textContent = formatJson(headerJson);

        const payloadJson = JSON.parse(base64UrlDecode(parts[1]));
        payloadEl.textContent = formatJson(payloadJson);

        signatureEl.textContent = parts[2] || '(无签名)';

        // Show metadata
        const meta: string[] = [];
        if (headerJson.alg) meta.push(`算法: ${headerJson.alg}`);
        if (headerJson.typ) meta.push(`类型: ${headerJson.typ}`);
        if (payloadJson.exp) {
          const expDate = new Date(payloadJson.exp * 1000);
          const isExpired = expDate < new Date();
          meta.push(`过期时间: ${formatDate(payloadJson.exp)} ${isExpired ? '(已过期)' : '(有效)'}`);
        }
        if (payloadJson.iat) meta.push(`签发时间: ${formatDate(payloadJson.iat)}`);
        if (payloadJson.nbf) meta.push(`生效时间: ${formatDate(payloadJson.nbf)}`);
        if (payloadJson.iss) meta.push(`签发者: ${payloadJson.iss}`);
        if (payloadJson.sub) meta.push(`主题: ${payloadJson.sub}`);
        if (payloadJson.aud) meta.push(`受众: ${Array.isArray(payloadJson.aud) ? payloadJson.aud.join(', ') : payloadJson.aud}`);

        if (meta.length > 0) {
          metaArea.style.display = 'block';
          metaContent.innerHTML = meta.map(m => `<div style="margin-bottom: 4px;">${m}</div>`).join('');
        } else {
          metaArea.style.display = 'none';
        }

        errorArea.style.display = 'none';
        resultArea.style.display = 'block';
      } catch (e: any) {
        errorArea.style.display = 'block';
        errorText.textContent = `解码失败: ${e.message || '请输入有效的 Base64URL 编码内容'}`;
        resultArea.style.display = 'none';
      }
    }

    input.addEventListener('input', decode);
  },
};
