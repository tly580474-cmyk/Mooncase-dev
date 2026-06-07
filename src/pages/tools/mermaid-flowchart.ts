import { icon } from '../../core/icons';
import { getItem, setItem } from '../../core/storage';
import mermaid from 'mermaid';

const STORAGE_KEY = 'mermaid_code';

function getMermaidTheme(): 'default' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'default';
}

function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: getMermaidTheme(),
    securityLevel: 'loose',
    flowchart: { useMaxWidth: false, htmlLabels: true },
    themeVariables: {
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
  });
}

initMermaid();

let _themeObserver: MutationObserver | null = null;

const SAMPLE = `flowchart TD
  A[用户登录] --> B{验证密码}
  B -->|正确| C[进入主页]
  B -->|错误| D[提示重试]
  D --> B
  C --> E[加载数据]
  E --> F{权限检查}
  F -->|管理员| G[管理面板]
  F -->|普通用户| H[用户面板]
  G --> I[结束]
  H --> I`;

export default {
  id: 'mermaid-flowchart',
  name: 'Mermaid 流程图',
  icon: 'flowchart',

  render(container: HTMLElement) {
    const savedCode = getItem<string>(STORAGE_KEY, '');
    const initialCode = savedCode || SAMPLE;

    container.innerHTML = `
      <style>
        .mf-page { max-width: 100%; }
        .mf-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
          padding: 12px 14px;
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--radius-md);
          background: var(--color-surface-container-lowest);
        }
        .mf-toolbar-left,
        .mf-toolbar-actions,
        .mf-control-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .mf-toolbar-title {
          color: var(--color-on-surface);
          font: var(--text-label-md);
          font-weight: 700;
        }
        .mf-status {
          color: var(--color-on-surface-variant);
          font: var(--text-body-sm);
        }
        .mf-workspace {
          display: grid;
          grid-template-columns: minmax(360px, 0.82fr) minmax(460px, 1.18fr);
          gap: 16px;
          height: calc(100vh - 260px);
          min-height: 560px;
        }
        .mf-panel {
          display: flex;
          min-width: 0;
          min-height: 0;
          flex-direction: column;
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--radius-md);
          background: var(--color-surface-container-lowest);
          overflow: hidden;
        }
        .mf-panel-head {
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-bottom: 1px solid var(--color-outline-variant);
          background: var(--color-surface-container-low);
        }
        .mf-panel-title {
          margin: 0;
          color: var(--color-on-surface);
          font: var(--text-headline-sm);
        }
        .mf-textarea {
          flex: 1;
          min-height: 0;
          border: 0;
          border-radius: 0;
          resize: none;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.65;
        }
        .mf-textarea:focus {
          box-shadow: inset 0 0 0 3px var(--color-primary-fixed-dim);
        }
        .mf-editor-footer {
          border-top: 1px solid var(--color-outline-variant);
          padding: 10px 14px;
          background: var(--color-surface-container-low);
        }
        .mf-canvas {
          flex: 1;
          min-height: 0;
          overflow: auto;
          position: relative;
          background:
            linear-gradient(var(--color-outline-variant) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-outline-variant) 1px, transparent 1px),
            var(--color-surface);
          background-size: 28px 28px;
          background-position: -1px -1px;
        }
        .mf-empty-hint {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-on-surface-variant);
          pointer-events: none;
          text-align: center;
        }
        .mf-render-wrap {
          min-width: 100%;
          min-height: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 32px;
        }
        .mf-render-surface {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 160px;
          min-height: 120px;
          padding: 20px;
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--radius-md);
          background: var(--color-surface-container-lowest);
          box-shadow: var(--shadow-sm);
        }
        .mf-error {
          display: none;
          margin-top: 8px;
          color: var(--color-error);
          font: var(--text-label-md);
          overflow-wrap: anywhere;
        }
        .mf-cheatsheet { font-size: 12px; }
        .mf-cheatsheet summary { cursor:pointer; color:var(--color-primary); font-weight:600; }
        .mf-cheatsheet-content { display:grid; gap:4px; margin-top:8px; color:var(--color-on-surface-variant); }
        .mf-cheatsheet-content p { margin:0; }
        .mf-cheatsheet-content p:last-child { margin-bottom:0; }
        .mf-cheatsheet-content code { background:var(--color-surface-container-lowest); padding:1px 4px; border-radius:3px; font-family:var(--font-mono); font-size:11px; }
        .mf-btn-icon {
          width: 40px;
          height: 40px;
          padding: 0;
        }
        @media (max-width: 1180px) {
          .mf-workspace {
            grid-template-columns: 1fr;
            height: auto;
          }
          .mf-panel {
            min-height: 460px;
          }
          .mf-textarea {
            min-height: 320px;
          }
          .mf-canvas {
            min-height: 440px;
          }
        }
        @media (max-width: 720px) {
          .mf-toolbar {
            grid-template-columns: 1fr;
          }
          .mf-panel-head {
            align-items: flex-start;
            flex-direction: column;
          }
          .mf-control-group,
          .mf-toolbar-actions {
            width: 100%;
          }
          .mf-toolbar-actions .btn,
          .mf-panel-head .btn {
            flex: 1 1 auto;
          }
          .mf-render-wrap {
            padding: 20px;
          }
        }
      </style>
      <div class="content mf-page">
        <div class="tool-page-header">
          <a href="#/dev" class="tool-page-back">${icon('code')} 开发调试</a>
          <h1 style="font: var(--text-headline-md);">Mermaid 流程图</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">使用 Mermaid 语法绘制、预览和导出流程图</p>
        </div>

        <div class="mf-toolbar">
          <div class="mf-toolbar-left">
            <span class="mf-toolbar-title">流程图工作台</span>
            <span id="mf-status" class="mf-status">准备渲染</span>
          </div>
          <div class="mf-toolbar-actions">
            <button class="btn btn-secondary" id="mf-sample" type="button">${icon('history', 16)} 示例</button>
            <button class="btn btn-secondary" id="mf-clear" type="button">${icon('close', 16)} 清空</button>
            <button class="btn btn-ghost" id="mf-copy-svg" type="button">${icon('content_copy', 16)} 复制 SVG</button>
            <button class="btn btn-ghost" id="mf-download-svg" type="button">${icon('download', 16)} SVG</button>
            <button class="btn btn-primary" id="mf-export-png" type="button">${icon('image', 16)} PNG</button>
          </div>
        </div>

        <div class="mf-workspace">
          <section class="mf-panel">
            <div class="mf-panel-head">
              <h2 class="mf-panel-title">语法编辑</h2>
              <div class="mf-status" id="mf-code-stat">0 行</div>
            </div>
            <textarea id="mf-input" class="tool-textarea mf-textarea" spellcheck="false" placeholder="flowchart TD&#10;  A[开始] --> B{判断}"></textarea>
            <div class="mf-editor-footer">
              <details class="mf-cheatsheet">
                <summary>语法参考</summary>
                <div class="mf-cheatsheet-content">
                  <p><code>flowchart TD</code> 从上到下，<code>flowchart LR</code> 从左到右</p>
                  <p><code>A[矩形]</code> <code>B(圆角)</code> <code>C{菱形}</code> <code>D((圆形))</code></p>
                  <p><code>A --&gt; B</code> <code>A --&gt;|标签| B</code> <code>A -.&gt; B</code> <code>A ==&gt; B</code></p>
                  <p><code>subgraph 标题</code> 定义子图，<code>end</code> 结束</p>
                </div>
              </details>
              <div id="mf-error" class="mf-error"></div>
            </div>
          </section>

          <section class="mf-panel">
            <div class="mf-panel-head">
              <h2 class="mf-panel-title">预览</h2>
              <div class="mf-control-group">
                <button class="btn btn-ghost mf-btn-icon" id="mf-zoom-out" type="button" title="缩小" aria-label="缩小">${icon('zoom_out', 18)}</button>
                <span id="mf-zoom-label" class="mf-status" style="min-width:44px; text-align:center;">100%</span>
                <button class="btn btn-ghost mf-btn-icon" id="mf-zoom-in" type="button" title="放大" aria-label="放大">${icon('zoom_in', 18)}</button>
                <button class="btn btn-ghost mf-btn-icon" id="mf-fit" type="button" title="适应画布" aria-label="适应画布">${icon('maximize', 18)}</button>
                <button class="btn btn-ghost mf-btn-icon" id="mf-zoom-reset" type="button" title="重置缩放" aria-label="重置缩放">${icon('refresh', 18)}</button>
              </div>
            </div>
            <div id="mf-canvas" class="mf-canvas">
              <div id="mf-empty-hint" class="mf-empty-hint">
                <span style="opacity:0.35;">${icon('flowchart', 44)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    // ---- State ----
    let zoom = 1;

    // ---- Elements ----
    const input = container.querySelector('#mf-input') as HTMLTextAreaElement;
    const canvas = container.querySelector('#mf-canvas') as HTMLElement;
    const emptyHint = container.querySelector('#mf-empty-hint') as HTMLElement;
    const errorEl = container.querySelector('#mf-error') as HTMLElement;
    const zoomLabel = container.querySelector('#mf-zoom-label') as HTMLElement;
    const statusEl = container.querySelector('#mf-status') as HTMLElement;
    const codeStat = container.querySelector('#mf-code-stat') as HTMLElement;

    input.value = initialCode;

    // ---- Theme observer ----
    _themeObserver = new MutationObserver(() => {
      initMermaid();
      doRender();
    });
    _themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // ---- Render ----
    let renderId = 0;
    let renderedSvgSize = { width: 0, height: 0 };

    function updateCodeStat() {
      const lines = input.value ? input.value.split('\n').length : 0;
      codeStat.textContent = `${lines} 行`;
    }

    async function doRender() {
      const code = input.value.trim();
      updateCodeStat();
      if (!code) {
        canvas.querySelectorAll('.mf-render-wrap').forEach(el => el.remove());
        emptyHint.style.display = '';
        errorEl.style.display = 'none';
        statusEl.textContent = '空白';
        return;
      }

      emptyHint.style.display = 'none';
      statusEl.textContent = '渲染中';
      const id = ++renderId;
      const mermaidId = `mf-svg-${id}`;

      try {
        const { svg } = await mermaid.render(mermaidId, code);
        if (id !== renderId) return;

        let wrap = canvas.querySelector('.mf-render-wrap') as HTMLElement | null;
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'mf-render-wrap';
          canvas.appendChild(wrap);
        }
        wrap.innerHTML = `<div class="mf-render-surface">${svg}</div>`;
        const svgEl = wrap.querySelector('.mf-render-surface svg') as SVGSVGElement;
        if (svgEl) {
          svgEl.style.maxWidth = 'none';
          svgEl.style.height = 'auto';
          const viewBox = svgEl.getAttribute('viewBox')?.split(/\s+/).map(Number);
          renderedSvgSize = {
            width: viewBox && viewBox.length === 4 ? viewBox[2] : (svgEl.width.baseVal.value || 640),
            height: viewBox && viewBox.length === 4 ? viewBox[3] : (svgEl.height.baseVal.value || 360),
          };
          applyZoom(svgEl);
        }
        errorEl.style.display = 'none';
        statusEl.textContent = '已渲染';
      } catch (e: any) {
        if (id !== renderId) return;
        errorEl.style.display = '';
        errorEl.textContent = '解析错误: ' + (e.message || String(e));
        statusEl.textContent = '解析错误';
        const w = canvas.querySelector('.mf-render-wrap');
        if (w) (w as HTMLElement).innerHTML = '';
      }
    }

    function applyZoom(svgEl?: SVGSVGElement) {
      const wrap = canvas.querySelector('.mf-render-wrap') as HTMLElement;
      if (!wrap) return;
      const surface = wrap.querySelector('.mf-render-surface') as HTMLElement;
      const el = svgEl || wrap.querySelector('svg') as SVGSVGElement;
      if (el) {
        const width = Math.max(1, renderedSvgSize.width);
        const height = Math.max(1, renderedSvgSize.height);
        el.style.width = `${width * zoom}px`;
        el.style.height = `${height * zoom}px`;
        if (surface) {
          surface.style.width = `${width * zoom + 40}px`;
          surface.style.minHeight = `${height * zoom + 40}px`;
        }
      }
      zoomLabel.textContent = Math.round(zoom * 100) + '%';
    }

    function fitToCanvas() {
      if (!renderedSvgSize.width || !renderedSvgSize.height) return;
      const rect = canvas.getBoundingClientRect();
      const availableW = Math.max(1, rect.width - 96);
      const availableH = Math.max(1, rect.height - 96);
      zoom = Math.max(0.2, Math.min(3, availableW / renderedSvgSize.width, availableH / renderedSvgSize.height));
      applyZoom();
    }

    // ---- Debounced input ----
    let timer: ReturnType<typeof setTimeout>;
    function scheduleRender() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setItem(STORAGE_KEY, input.value);
        doRender();
      }, 300);
    }

    input.addEventListener('input', scheduleRender);

    // ---- Zoom ----
    container.querySelector('#mf-zoom-in')!.addEventListener('click', () => {
      zoom = Math.min(3, zoom + 0.2);
      applyZoom();
    });
    container.querySelector('#mf-zoom-out')!.addEventListener('click', () => {
      zoom = Math.max(0.2, zoom - 0.2);
      applyZoom();
    });
    container.querySelector('#mf-zoom-reset')!.addEventListener('click', () => {
      zoom = 1;
      applyZoom();
    });
    container.querySelector('#mf-fit')!.addEventListener('click', fitToCanvas);

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoom = Math.max(0.2, Math.min(3, zoom - Math.sign(e.deltaY) * 0.1));
      applyZoom();
    }, { passive: false });

    // ---- Sample / Clear ----
    container.querySelector('#mf-sample')!.addEventListener('click', () => {
      input.value = SAMPLE;
      setItem(STORAGE_KEY, SAMPLE);
      doRender();
    });
    container.querySelector('#mf-clear')!.addEventListener('click', () => {
      input.value = '';
      setItem(STORAGE_KEY, '');
      doRender();
    });

    // ---- Export ----
    function getSVGClone(): SVGSVGElement | null {
      const svgEl = canvas.querySelector('.mf-render-surface svg') as SVGSVGElement;
      if (!svgEl) return null;
      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      clone.removeAttribute('style');
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      return clone;
    }

    container.querySelector('#mf-copy-svg')!.addEventListener('click', async () => {
      const clone = getSVGClone();
      if (!clone) return;
      const xml = new XMLSerializer().serializeToString(clone);
      await navigator.clipboard.writeText(xml);
    });

    container.querySelector('#mf-download-svg')!.addEventListener('click', () => {
      const clone = getSVGClone();
      if (!clone) return;
      const xml = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = 'mermaid-flowchart.svg';
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    });

    container.querySelector('#mf-export-png')!.addEventListener('click', () => {
      const clone = getSVGClone();
      if (!clone) return;
      const xml = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width * 2;
        c.height = img.height * 2;
        const ctx = c.getContext('2d')!;
        ctx.scale(2, 2);
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        c.toBlob(b => {
          if (!b) return;
          const a = document.createElement('a');
          a.download = 'mermaid-flowchart.png';
          a.href = URL.createObjectURL(b);
          a.click();
        }, 'image/png');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

    // ---- Initial render ----
    doRender();
  },

  destroy() {
    _themeObserver?.disconnect();
    _themeObserver = null;
  },
};
