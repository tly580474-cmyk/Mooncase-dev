import { icon } from '../../core/icons';

interface SavedRequest {
  name: string;
  method: string;
  url: string;
  headers: string;
  body: string;
}

const STORAGE_KEY = 'moonbox-http-requests';

function loadSaved(): SavedRequest[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveToStorage(list: SavedRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default {
  id: 'http-tester',
  name: 'HTTP 请求测试器',
  icon: 'http',
  render(container: HTMLElement) {
    const saved = loadSaved();
    let showSaved = false;

    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/network" class="tool-page-back">${icon('language')} 网络工具</a>
          <h1 style="font: var(--text-headline-md);">HTTP 请求测试器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">发送 HTTP 请求并查看响应</p>
        </div>
        <div class="tool-page-body">
          <div style="display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap;">
            <div class="tool-field" style="flex: 0 0 110px;">
              <label class="tool-label">方法</label>
              <select id="ht-method" class="tool-select">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
            </div>
            <div class="tool-field" style="flex: 1; min-width: 200px;">
              <label class="tool-label">URL</label>
              <input id="ht-url" class="tool-input" placeholder="https://example.com/api/data" />
            </div>
          </div>

          <div class="tool-field">
            <label class="tool-label">请求头 (JSON)</label>
            <textarea id="ht-headers" class="tool-textarea" rows="3" placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'></textarea>
          </div>

          <div class="tool-field" id="ht-body-field">
            <label class="tool-label">请求体</label>
            <textarea id="ht-body" class="tool-textarea" rows="4" placeholder='{"key": "value"}'></textarea>
          </div>

          <div class="tool-actions">
            <button class="btn btn-primary" id="ht-send">${icon('send')} 发送请求</button>
            <button class="btn btn-ghost" id="ht-save">${icon('save')} 保存请求</button>
            <button class="btn btn-ghost" id="ht-toggle-saved">${icon('history')} 已保存 (${saved.length})</button>
          </div>

          <div id="ht-saved-list" style="display: none; margin-bottom: 20px;">
            <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md);">
              ${saved.map((s, i) => `
                <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--color-outline-variant); cursor: pointer; transition: background var(--transition-fast);" class="ht-saved-item" data-idx="${i}"
                  onmouseover="this.style.background='var(--color-surface-container-highest)'" onmouseout="this.style.background=''">
                  <span style="font-size: 11px; font-weight: 600; color: var(--color-primary); min-width: 50px;">${s.method}</span>
                  <span style="font: var(--text-body-sm); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.url || s.name || '(无 URL)'}</span>
                  <button class="btn btn-ghost ht-del-saved" data-idx="${i}" style="padding: 2px 6px; font-size: 11px; color: var(--color-error);">${icon('delete')}</button>
                </div>
              `).join('')}
              ${saved.length === 0 ? '<div style="padding: 16px; text-align: center; color: var(--color-on-surface-variant); opacity: 0.5;">暂无保存的请求</div>' : ''}
            </div>
          </div>

          <div id="ht-loading" style="display: none; text-align: center; padding: 20px;">
            <div style="color: var(--color-primary);">请求中...</div>
          </div>

          <div id="ht-response" style="display: none;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
              <span class="ht-status" id="ht-status" style="font-weight: 600; padding: 4px 12px; border-radius: var(--radius-sm);"></span>
              <span id="ht-time" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);"></span>
              <span id="ht-size" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);"></span>
            </div>

            <div class="tool-field">
              <label class="tool-label">响应头</label>
              <pre id="ht-resp-headers" style="
                padding: 12px; background: var(--color-surface-container);
                border-radius: var(--radius-md); overflow-x: auto;
                font: var(--text-body-sm); max-height: 200px; overflow-y: auto;
              "></pre>
            </div>
            <div class="tool-field">
              <label class="tool-label">响应体</label>
              <pre id="ht-resp-body" style="
                padding: 12px; background: var(--color-surface-container);
                border-radius: var(--radius-md); overflow-x: auto;
                font: var(--text-body-sm); max-height: 400px; overflow-y: auto;
                white-space: pre-wrap; word-break: break-all;
              "></pre>
            </div>
          </div>

          <div id="ht-error" style="display: none; padding: 12px; background: var(--color-error-container); color: var(--color-on-error-container); border-radius: var(--radius-md); font: var(--text-body-sm); margin-top: 12px;"></div>
        </div>
      </div>
    `;

    const methodEl = container.querySelector('#ht-method') as HTMLSelectElement;
    const urlEl = container.querySelector('#ht-url') as HTMLInputElement;
    const headersEl = container.querySelector('#ht-headers') as HTMLTextAreaElement;
    const bodyEl = container.querySelector('#ht-body') as HTMLTextAreaElement;
    const bodyField = container.querySelector('#ht-body-field') as HTMLElement;

    // Show/hide body based on method
    methodEl.addEventListener('change', () => {
      const noBody = ['GET', 'HEAD', 'OPTIONS'].includes(methodEl.value);
      bodyField.style.display = noBody ? 'none' : '';
    });

    // Send request
    container.querySelector('#ht-send')!.addEventListener('click', async () => {
      const url = urlEl.value.trim();
      const errorEl = container.querySelector('#ht-error') as HTMLElement;
      const loadingEl = container.querySelector('#ht-loading') as HTMLElement;
      const responseEl = container.querySelector('#ht-response') as HTMLElement;

      if (!url) { errorEl.textContent = '请输入 URL'; errorEl.style.display = ''; return; }
      errorEl.style.display = 'none';
      responseEl.style.display = 'none';
      loadingEl.style.display = '';

      const startTime = performance.now();

      try {
        let headers: Record<string, string> = {};
        if (headersEl.value.trim()) {
          headers = JSON.parse(headersEl.value);
        }

        const init: RequestInit = { method: methodEl.value, headers };
        if (!['GET', 'HEAD'].includes(methodEl.value) && bodyEl.value.trim()) {
          init.body = bodyEl.value;
        }

        const resp = await fetch(url, init);
        const elapsed = performance.now() - startTime;

        // Response headers
        const respHeaders: string[] = [];
        resp.headers.forEach((v, k) => respHeaders.push(`${k}: ${v}`));

        // Response body
        const text = await resp.text();
        const bytes = new TextEncoder().encode(text).length;

        // Status
        const statusEl = container.querySelector('#ht-status') as HTMLElement;
        statusEl.textContent = `${resp.status} ${resp.statusText}`;
        const ok = resp.ok;
        statusEl.style.background = ok ? 'var(--color-primary-container)' : 'var(--color-error-container)';
        statusEl.style.color = ok ? 'var(--color-on-primary-container)' : 'var(--color-on-error-container)';

        (container.querySelector('#ht-time') as HTMLElement).textContent = `耗时 ${Math.round(elapsed)}ms`;
        (container.querySelector('#ht-size') as HTMLElement).textContent = `大小 ${bytes > 1024 ? (bytes / 1024).toFixed(1) + ' KB' : bytes + ' B'}`;
        (container.querySelector('#ht-resp-headers') as HTMLElement).textContent = respHeaders.join('\n');
        (container.querySelector('#ht-resp-body') as HTMLElement).textContent = text;

        responseEl.style.display = '';
      } catch (err: any) {
        errorEl.textContent = `请求失败: ${err.message || err}`;
        errorEl.style.display = '';
      } finally {
        loadingEl.style.display = 'none';
      }
    });

    // Save request
    container.querySelector('#ht-save')!.addEventListener('click', () => {
      const req: SavedRequest = {
        name: '',
        method: methodEl.value,
        url: urlEl.value,
        headers: headersEl.value,
        body: bodyEl.value,
      };
      const list = loadSaved();
      list.push(req);
      saveToStorage(list);
      const btn = container.querySelector('#ht-save') as HTMLElement;
      btn.textContent = '已保存';
      setTimeout(() => { btn.innerHTML = `${icon('save')} 保存请求`; }, 1500);
    });

    // Toggle saved list
    container.querySelector('#ht-toggle-saved')!.addEventListener('click', () => {
      showSaved = !showSaved;
      (container.querySelector('#ht-saved-list') as HTMLElement).style.display = showSaved ? '' : 'none';
    });

    // Load saved item
    container.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.ht-saved-item') as HTMLElement;
      if (!item || (e.target as HTMLElement).closest('.ht-del-saved')) return;
      const idx = Number(item.dataset.idx);
      const list = loadSaved();
      const req = list[idx];
      if (!req) return;
      methodEl.value = req.method;
      urlEl.value = req.url;
      headersEl.value = req.headers;
      bodyEl.value = req.body;
      bodyEl.dispatchEvent(new Event('change'));
    });

    // Delete saved item
    container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.ht-del-saved') as HTMLElement;
      if (!btn) return;
      e.stopPropagation();
      const idx = Number(btn.dataset.idx);
      const list = loadSaved();
      list.splice(idx, 1);
      saveToStorage(list);
      showSaved = false;
      container.querySelector('#ht-toggle-saved')!.dispatchEvent(new Event('click'));
    });
  },
};
