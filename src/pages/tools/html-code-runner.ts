import { icon } from '../../core/icons';
import { showToast } from '../../core/toast';

const DEFAULT_HTML = `<main class="demo-card">
  <p class="eyebrow">Mooncase Playground</p>
  <h1>快速验证页面想法</h1>
  <p>在这里粘贴 HTML、CSS 和 JavaScript，点击运行即可查看渲染效果。</p>
  <button id="countBtn">点击测试逻辑</button>
  <output id="countOutput">点击次数：0</output>
</main>`;

const DEFAULT_CSS = `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f4f7fb;
  color: #162033;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.demo-card {
  width: min(420px, calc(100vw - 40px));
  padding: 32px;
  border: 1px solid #d8e1f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 18px 48px rgba(22, 32, 51, 0.12);
}

.eyebrow {
  margin: 0 0 8px;
  color: #1b57bd;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 12px;
  font-size: 28px;
  line-height: 1.2;
}

p {
  line-height: 1.7;
}

button {
  margin-top: 16px;
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  background: #1b57bd;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

output {
  display: block;
  margin-top: 14px;
  color: #4a5668;
}`;

const DEFAULT_JS = `let count = 0;
const button = document.querySelector('#countBtn');
const output = document.querySelector('#countOutput');

button.addEventListener('click', () => {
  count += 1;
  output.textContent = \`点击次数：\${count}\`;
});`;

let runDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let messageHandler: ((event: MessageEvent) => void) | null = null;
const openedPreviewUrls: string[] = [];

const TAILWIND_FALLBACK_CSS = `/* Tailwind CDN fallback for offline / COEP preview */
*, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: #e5e7eb; }
html { line-height: 1.5; -webkit-text-size-adjust: 100%; tab-size: 4; }
body { margin: 0; line-height: inherit; }
button, input, textarea { font: inherit; }
button { cursor: pointer; background: transparent; }
table { text-indent: 0; border-color: inherit; border-collapse: collapse; }
a { color: inherit; text-decoration: inherit; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
.hidden { display: none !important; }
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { inset: 0; }
.left-3 { left: .75rem; }
.top-3 { top: .75rem; }
.z-10 { z-index: 10; }
.flex { display: flex; }
.grid { display: grid; }
.block { display: block; }
.w-5 { width: 1.25rem; }
.w-6 { width: 1.5rem; }
.w-8 { width: 2rem; }
.w-64 { width: 16rem; }
.w-96 { width: 24rem; }
.w-full { width: 100%; }
.h-6 { height: 1.5rem; }
.h-8 { height: 2rem; }
.h-16 { height: 4rem; }
.h-24 { height: 6rem; }
.h-32 { height: 8rem; }
.h-40 { height: 10rem; }
.h-48 { height: 12rem; }
.h-56 { height: 14rem; }
.h-64 { height: 16rem; }
.h-screen { height: 100vh; }
.flex-1 { flex: 1 1 0%; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.gap-6 { gap: 1.5rem; }
.space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: .5rem; }
.space-x-3 > :not([hidden]) ~ :not([hidden]) { margin-left: .75rem; }
.space-x-4 > :not([hidden]) ~ :not([hidden]) { margin-left: 1rem; }
.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: .25rem; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: .5rem; }
.space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: .75rem; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
.space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
.divide-y > :not([hidden]) ~ :not([hidden]) { border-top-width: 1px; }
.divide-gray-100 > :not([hidden]) ~ :not([hidden]) { border-color: #f3f4f6; }
.overflow-hidden { overflow: hidden; }
.overflow-y-auto { overflow-y: auto; }
.overflow-hidden { overflow: hidden; }
.rounded { border-radius: .25rem; }
.rounded-lg { border-radius: .5rem; }
.rounded-xl { border-radius: .75rem; }
.rounded-full { border-radius: 9999px; }
.rounded-t { border-top-left-radius: .25rem; border-top-right-radius: .25rem; }
.border { border-width: 1px; }
.border-2 { border-width: 2px; }
.border-b { border-bottom-width: 1px; }
.border-r { border-right-width: 1px; }
.border-t { border-top-width: 1px; }
.border-dashed { border-style: dashed; }
.border-blue-200 { border-color: #bfdbfe; }
.border-blue-300 { border-color: #93c5fd; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.border-white { border-color: #fff; }
.bg-white { background-color: #fff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-blue-600 { background-color: #2563eb; }
.bg-emerald-400 { background-color: #34d399; }
.bg-emerald-500 { background-color: #10b981; }
.bg-emerald-600 { background-color: #059669; }
.bg-green-50 { background-color: #f0fdf4; }
.bg-green-100 { background-color: #dcfce7; }
.bg-indigo-600 { background-color: #4f46e5; }
.bg-orange-400 { background-color: #fb923c; }
.bg-purple-200 { background-color: #e9d5ff; }
.bg-red-100 { background-color: #fee2e2; }
.bg-red-500 { background-color: #ef4444; }
.bg-red-600 { background-color: #dc2626; }
.bg-yellow-100 { background-color: #fef3c7; }
.bg-amber-500 { background-color: #f59e0b; }
.bg-gray-900\\/5 { background-color: rgb(17 24 39 / .05); }
.p-2 { padding: .5rem; }
.p-3 { padding: .75rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.px-1\\.5 { padding-left: .375rem; padding-right: .375rem; }
.px-2 { padding-left: .5rem; padding-right: .5rem; }
.px-3 { padding-left: .75rem; padding-right: .75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-8 { padding-left: 2rem; padding-right: 2rem; }
.py-0\\.5 { padding-top: .125rem; padding-bottom: .125rem; }
.py-1 { padding-top: .25rem; padding-bottom: .25rem; }
.py-2 { padding-top: .5rem; padding-bottom: .5rem; }
.py-2\\.5 { padding-top: .625rem; padding-bottom: .625rem; }
.py-3 { padding-top: .75rem; padding-bottom: .75rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.pl-10 { padding-left: 2.5rem; }
.pr-4 { padding-right: 1rem; }
.pb-4 { padding-bottom: 1rem; }
.mr-1 { margin-right: .25rem; }
.mb-2 { margin-bottom: .5rem; }
.mb-4 { margin-bottom: 1rem; }
.mt-1 { margin-top: .25rem; }
.mt-2 { margin-top: .5rem; }
.text-left { text-align: left; }
.text-center { text-align: center; }
.font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.text-xs { font-size: .75rem; line-height: 1rem; }
.text-sm { font-size: .875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; }
.tracking-wider { letter-spacing: .05em; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-800 { color: #1f2937; }
.text-gray-900 { color: #111827; }
.text-blue-600 { color: #2563eb; }
.text-blue-700 { color: #1d4ed8; }
.text-emerald-500 { color: #10b981; }
.text-emerald-600 { color: #059669; }
.text-green-700 { color: #15803d; }
.text-green-800 { color: #166534; }
.text-indigo-600 { color: #4f46e5; }
.text-orange-500 { color: #f97316; }
.text-purple-700 { color: #7e22ce; }
.text-red-500 { color: #ef4444; }
.text-red-600 { color: #dc2626; }
.text-red-800 { color: #991b1b; }
.text-yellow-800 { color: #854d0e; }
.text-amber-500 { color: #f59e0b; }
.text-white { color: #fff; }
.shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1); }
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / .05); }
.antialiased { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-duration: 150ms; }
.cursor-pointer { cursor: pointer; }
.border-collapse { border-collapse: collapse; }
.backdrop-blur-\\[1px\\] { backdrop-filter: blur(1px); }
.focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
.focus\\:border-blue-500:focus { border-color: #3b82f6; }
.hover\\:bg-gray-50:hover { background-color: #f9fafb; }
.hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
.hover\\:bg-emerald-700:hover { background-color: #047857; }
.hover\\:border-blue-400:hover { border-color: #60a5fa; }
.hover\\:text-gray-800:hover { color: #1f2937; }
.hover\\:text-blue-600:hover { color: #2563eb; }
.hover\\:underline:hover { text-decoration-line: underline; }`;

interface ParsedCode {
  html: string;
  css: string;
  js: string;
  extracted: boolean;
}

function escapeScriptContent(code: string): string {
  return code.replace(/<\/script/gi, '<\\/script');
}

function escapeStyleContent(code: string): string {
  return code.replace(/<\/style/gi, '<\\/style');
}

function createBridgeScript(): string {
  return `<script>
(() => {
  const send = (type, payload) => parent.postMessage({ source: 'mooncase-html-runner', type, payload }, '*');
  const stringify = (value) => {
    try {
      if (typeof value === 'string') return value;
      if (value instanceof Error) return value.stack || value.message;
      return JSON.stringify(value);
    } catch (_err) {
      return String(value);
    }
  };
  ['log', 'info', 'warn', 'error'].forEach((level) => {
    const original = console[level];
    console[level] = (...args) => {
      send('console', { level, message: args.map(stringify).join(' ') });
      original.apply(console, args);
    };
  });
  window.addEventListener('error', (event) => {
    send('console', { level: 'error', message: event.message + ' (' + event.filename + ':' + event.lineno + ')' });
  });
  window.addEventListener('unhandledrejection', (event) => {
    send('console', { level: 'error', message: stringify(event.reason) });
  });
  window.addEventListener('DOMContentLoaded', () => send('ready', {}));
})();
<\/script>`;
}

function injectIntoFullDocument(html: string, styleBlock: string, bridgeScript: string, userScript: string): string {
  let doc = html;
  const headPayload = `${styleBlock}\n${bridgeScript}`;
  if (/<\/head>/i.test(doc)) {
    doc = doc.replace(/<\/head>/i, `${headPayload}\n</head>`);
  } else {
    doc = doc.replace(/<html[^>]*>/i, match => `${match}\n<head>${headPayload}</head>`);
  }

  if (/<\/body>/i.test(doc)) {
    return doc.replace(/<\/body>/i, `${userScript}\n</body>`);
  }

  return `${doc}\n${userScript}`;
}

function buildSrcDoc(html: string, css: string, js: string): string {
  const shouldUseTailwindFallback = /cdn\.tailwindcss\.com/i.test(html);
  const effectiveCss = shouldUseTailwindFallback ? `${TAILWIND_FALLBACK_CSS}\n\n${css}` : css;
  const styleBlock = `<style>\n${escapeStyleContent(effectiveCss)}\n</style>`;
  const bridgeScript = createBridgeScript();
  const userScript = `<script>\n${escapeScriptContent(js)}\n<\/script>`;

  if (/<html[\s>]/i.test(html)) {
    return injectIntoFullDocument(html, styleBlock, bridgeScript, userScript);
  }

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${styleBlock}
  ${bridgeScript}
</head>
<body>
${html}
${userScript}
</body>
</html>`;
}

function parsePastedCode(source: string): ParsedCode {
  let html = source.trim();
  const cssBlocks: string[] = [];
  const jsBlocks: string[] = [];

  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_match, css: string) => {
    cssBlocks.push(css.trim());
    return '';
  });

  html = html.replace(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi, (_match, js: string) => {
    jsBlocks.push(js.trim());
    return '';
  });

  html = html.trim();

  return {
    html,
    css: cssBlocks.join('\n\n'),
    js: jsBlocks.join('\n\n'),
    extracted: cssBlocks.length > 0 || jsBlocks.length > 0,
  };
}

function getLineCount(value: string): number {
  if (!value) return 0;
  return value.split(/\r\n|\r|\n/).length;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default {
  id: 'html-code-runner',
  name: 'HTML/CSS/JS 在线运行',
  icon: 'javascript',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/code" class="tool-page-back">${icon('code')} 代码工具</a>
          <h1 style="font: var(--text-headline-md);">HTML/CSS/JS 在线运行</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">粘贴代码、一键运行，实时预览渲染效果，高效验证代码逻辑与页面样式</p>
        </div>
        <div class="tool-page-body html-runner">
          <div class="html-runner-toolbar">
            <div class="tool-actions">
              <button class="btn btn-primary" id="runner-paste">${icon('clipboard')} 粘贴并预览</button>
              <button class="btn btn-primary" id="runner-run">${icon('refresh')} 运行</button>
              <button class="btn btn-secondary" id="runner-reset">${icon('history')} 重置示例</button>
              <button class="btn btn-ghost" id="runner-clear">${icon('close')} 清空</button>
            </div>
            <label class="tool-checkbox html-runner-toggle">
              <input type="checkbox" id="runner-auto" checked />
              实时预览
            </label>
          </div>

          <div class="html-runner-workspace">
            <section class="html-runner-editors" aria-label="代码编辑区">
              <div class="html-runner-editor">
                <div class="html-runner-editor-head">
                  <label class="tool-label" for="runner-html">HTML</label>
                  <span id="runner-html-count">0 行</span>
                </div>
                <textarea id="runner-html" class="tool-textarea html-runner-code" spellcheck="false" placeholder="粘贴 HTML 片段或完整文档..."></textarea>
              </div>
              <div class="html-runner-editor">
                <div class="html-runner-editor-head">
                  <label class="tool-label" for="runner-css">CSS</label>
                  <span id="runner-css-count">0 行</span>
                </div>
                <textarea id="runner-css" class="tool-textarea html-runner-code" spellcheck="false" placeholder="粘贴 CSS 样式..."></textarea>
              </div>
              <div class="html-runner-editor">
                <div class="html-runner-editor-head">
                  <label class="tool-label" for="runner-js">JavaScript</label>
                  <span id="runner-js-count">0 行</span>
                </div>
                <textarea id="runner-js" class="tool-textarea html-runner-code" spellcheck="false" placeholder="粘贴 JS 逻辑..."></textarea>
              </div>
            </section>

            <section class="html-runner-preview-panel" aria-label="运行预览">
              <div class="html-runner-preview-head">
                <div>
                  <h2>实时预览</h2>
                  <p id="runner-status">等待运行</p>
                </div>
                <div class="tool-actions">
                  <button class="btn btn-secondary" id="runner-open-window">${icon('maximize')} 新窗口打开</button>
                  <button class="btn btn-icon btn-secondary" id="runner-refresh" aria-label="重新运行" title="重新运行">${icon('refresh')}</button>
                </div>
              </div>
              <iframe id="runner-preview" class="html-runner-preview" title="HTML CSS JavaScript 运行预览" sandbox="allow-scripts allow-forms allow-modals"></iframe>
              <div class="html-runner-console">
                <div class="html-runner-console-head">
                  <span>控制台</span>
                  <button class="btn btn-ghost" id="runner-console-clear">清空日志</button>
                </div>
                <div id="runner-console" class="html-runner-console-body">运行后的 console 输出和错误会显示在这里</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;

    const htmlInput = container.querySelector('#runner-html') as HTMLTextAreaElement;
    const cssInput = container.querySelector('#runner-css') as HTMLTextAreaElement;
    const jsInput = container.querySelector('#runner-js') as HTMLTextAreaElement;
    const preview = container.querySelector('#runner-preview') as HTMLIFrameElement;
    const status = container.querySelector('#runner-status') as HTMLElement;
    const autoRun = container.querySelector('#runner-auto') as HTMLInputElement;
    const consoleOutput = container.querySelector('#runner-console') as HTMLElement;
    const htmlCount = container.querySelector('#runner-html-count') as HTMLElement;
    const cssCount = container.querySelector('#runner-css-count') as HTMLElement;
    const jsCount = container.querySelector('#runner-js-count') as HTMLElement;

    function setExample() {
      htmlInput.value = DEFAULT_HTML;
      cssInput.value = DEFAULT_CSS;
      jsInput.value = DEFAULT_JS;
      updateCounts();
      run();
    }

    function updateCounts() {
      htmlCount.textContent = `${getLineCount(htmlInput.value)} 行`;
      cssCount.textContent = `${getLineCount(cssInput.value)} 行`;
      jsCount.textContent = `${getLineCount(jsInput.value)} 行`;
    }

    function appendConsole(level: string, message: string) {
      if (consoleOutput.dataset.empty !== 'false') {
        consoleOutput.innerHTML = '';
        consoleOutput.dataset.empty = 'false';
      }

      const row = document.createElement('div');
      row.className = `html-runner-console-line html-runner-console-line--${level}`;
      row.textContent = `[${level}] ${message}`;
      consoleOutput.appendChild(row);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function clearConsole() {
      consoleOutput.dataset.empty = 'true';
      consoleOutput.textContent = '运行后的 console 输出和错误会显示在这里';
    }

    function run() {
      if (runDebounceTimer) {
        clearTimeout(runDebounceTimer);
        runDebounceTimer = null;
      }
      clearConsole();
      preview.srcdoc = buildSrcDoc(htmlInput.value, cssInput.value, jsInput.value);
      status.textContent = `已运行 ${formatTime(new Date())}`;
    }

    function openInNewWindow() {
      const srcDoc = buildSrcDoc(htmlInput.value, cssInput.value, jsInput.value);
      const blob = new Blob([srcDoc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      openedPreviewUrls.push(url);
      const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');

      if (!openedWindow) {
        URL.revokeObjectURL(url);
        openedPreviewUrls.pop();
        showToast('新窗口被浏览器拦截，请允许弹出窗口后重试');
        return;
      }

      showToast('已在新窗口打开预览');
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        const index = openedPreviewUrls.indexOf(url);
        if (index !== -1) openedPreviewUrls.splice(index, 1);
      }, 60000);
    }

    async function pasteAndRun() {
      if (!navigator.clipboard?.readText) {
        showToast('当前浏览器不支持一键读取剪贴板');
        return;
      }

      try {
        const text = await navigator.clipboard.readText();
        if (!text.trim()) {
          showToast('剪贴板里没有可预览的代码');
          return;
        }

        const parsed = parsePastedCode(text);
        htmlInput.value = parsed.html;
        cssInput.value = parsed.css;
        jsInput.value = parsed.js;
        updateCounts();
        run();
        showToast(parsed.extracted ? '已粘贴并拆分 HTML/CSS/JS' : '已粘贴并预览');
      } catch (_error) {
        showToast('无法读取剪贴板，请允许权限后重试');
      }
    }

    function scheduleRun() {
      updateCounts();
      if (!autoRun.checked) return;
      if (runDebounceTimer) clearTimeout(runDebounceTimer);
      runDebounceTimer = setTimeout(run, 450);
    }

    messageHandler = (event: MessageEvent) => {
      if (event.source !== preview.contentWindow) return;
      const data = event.data as { source?: string; type?: string; payload?: { level?: string; message?: string } };
      if (data?.source !== 'mooncase-html-runner') return;

      if (data.type === 'ready') {
        status.textContent = `预览已更新 ${formatTime(new Date())}`;
        return;
      }

      if (data.type === 'console') {
        appendConsole(data.payload?.level ?? 'log', data.payload?.message ?? '');
      }
    };

    window.addEventListener('message', messageHandler);
    htmlInput.addEventListener('input', scheduleRun);
    cssInput.addEventListener('input', scheduleRun);
    jsInput.addEventListener('input', scheduleRun);
    container.querySelector('#runner-paste')!.addEventListener('click', pasteAndRun);
    container.querySelector('#runner-run')!.addEventListener('click', run);
    container.querySelector('#runner-open-window')!.addEventListener('click', openInNewWindow);
    container.querySelector('#runner-refresh')!.addEventListener('click', run);
    container.querySelector('#runner-reset')!.addEventListener('click', () => {
      setExample();
      showToast('示例代码已重置');
    });
    container.querySelector('#runner-clear')!.addEventListener('click', () => {
      htmlInput.value = '';
      cssInput.value = '';
      jsInput.value = '';
      updateCounts();
      run();
    });
    container.querySelector('#runner-console-clear')!.addEventListener('click', clearConsole);

    setExample();
  },
  destroy() {
    if (runDebounceTimer) {
      clearTimeout(runDebounceTimer);
      runDebounceTimer = null;
    }
    if (messageHandler) {
      window.removeEventListener('message', messageHandler);
      messageHandler = null;
    }
    while (openedPreviewUrls.length > 0) {
      const url = openedPreviewUrls.pop();
      if (url) URL.revokeObjectURL(url);
    }
  },
};
