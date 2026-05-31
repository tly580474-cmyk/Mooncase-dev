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
  icon: 'share',

  render(container: HTMLElement) {
    const savedCode = getItem<string>(STORAGE_KEY, '');
    const initialCode = savedCode || SAMPLE;

    container.innerHTML = `
      <style>
        .mf-layout { display:flex; gap:12px; height:100%; }
        .mf-editor { display:flex; flex-direction:column; width:400px; min-width:300px; }
        .mf-preview { display:flex; flex-direction:column; flex:1; min-width:0; }
        .mf-textarea { flex:1; resize:none; font-family:var(--font-mono); font-size:12px; min-height:300px; }
        .mf-canvas { flex:1; border:1px solid var(--color-outline-variant); border-radius:8px; overflow:auto; background:var(--color-surface); position:relative; }
        .mf-empty-hint { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:var(--color-on-surface-variant); pointer-events:none; }
        .mf-render-wrap { display:flex; align-items:center; justify-content:center; min-width:100%; min-height:100%; padding:24px; }
        .mf-editor-header, .mf-preview-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .mf-export-bar { display:flex; align-items:center; gap:4px; margin-top:6px; }
        .mf-export-bar .btn-sm { font-size:12px; padding:6px 10px; }
        .mf-cheatsheet { margin-top:6px; font-size:12px; }
        .mf-cheatsheet summary { cursor:pointer; color:var(--color-primary); font-weight:600; padding:4px 0; }
        .mf-cheatsheet-content { background:var(--color-surface-container); border-radius:6px; padding:10px 12px; margin-top:4px; }
        .mf-cheatsheet-content p { margin-bottom:4px; color:var(--color-on-surface-variant); }
        .mf-cheatsheet-content p:last-child { margin-bottom:0; }
        .mf-cheatsheet-content code { background:var(--color-surface-container-lowest); padding:1px 4px; border-radius:3px; font-family:var(--font-mono); font-size:11px; }
        .mf-cheatsheet-content hr { border:none; border-top:1px solid var(--color-outline-variant); margin:8px 0; }
        .btn-sm { font-size:12px; padding:6px 10px; }
        @media (max-width: 860px) {
          .mf-layout { flex-direction:column; height:auto; }
          .mf-editor { width:100%; min-width:0; }
          .mf-textarea { min-height:200px; }
          .mf-canvas { min-height:360px; }
        }
      </style>
      <div class="mf-layout">
        <!-- Left: Editor -->
        <div class="mf-editor">
          <div class="mf-editor-header">
            <label class="tool-label" style="margin:0;">Mermaid 语法</label>
            <div style="display:flex; gap:4px;">
              <button class="btn btn-ghost" id="mf-sample" style="font-size:12px;">${icon('history', 14)} 示例</button>
              <button class="btn btn-ghost" id="mf-clear" style="font-size:12px;">清空</button>
            </div>
          </div>
          <textarea id="mf-input" class="tool-textarea mf-textarea" placeholder="输入 Mermaid 流程图语法..."></textarea>
          <details class="mf-cheatsheet">
            <summary>语法参考</summary>
            <div class="mf-cheatsheet-content">
              <p><code>flowchart TD</code> — 从上到下（TB/TD）</p>
              <p><code>flowchart LR</code> — 从左到右</p>
              <p><code>flowchart RL</code> — 从右到左</p>
              <p><code>flowchart BT</code> — 从下到上</p>
              <hr>
              <p><code>A[矩形]</code> <code>B(圆角)</code> <code>C{菱形}</code></p>
              <p><code>D((圆形))</code> <code>E[[子程序]]</code> <code>F[(数据库)]</code></p>
              <hr>
              <p><code>A --&gt; B</code> 实线箭头</p>
              <p><code>A --&gt;|标签| B</code> 带标签</p>
              <p><code>A -.&gt; B</code> 虚线箭头</p>
              <p><code>A ==&gt; B</code> 粗线箭头</p>
              <hr>
              <p><code>subgraph 标题</code> 定义子图，<code>end</code> 结束</p>
              <p><code>style A fill:#f9f,stroke:#333</code> 自定义样式</p>
            </div>
          </details>
          <div id="mf-error" style="color:var(--color-error); font:var(--text-label-md); margin-top:4px; display:none;"></div>
        </div>

        <!-- Right: Preview -->
        <div class="mf-preview">
          <div class="mf-preview-header">
            <div>
              <label class="tool-label" style="margin:0;">流程图预览</label>
            </div>
            <div style="display:flex; align-items:center; gap:4px;">
              <button class="btn btn-ghost" id="mf-zoom-out" title="缩小">${icon('zoom_out', 16)}</button>
              <span id="mf-zoom-label" style="font:var(--text-label-md); min-width:40px; text-align:center;">100%</span>
              <button class="btn btn-ghost" id="mf-zoom-in" title="放大">${icon('zoom_in', 16)}</button>
              <button class="btn btn-ghost" id="mf-zoom-reset" title="重置缩放">${icon('maximize', 16)}</button>
            </div>
          </div>
          <div id="mf-canvas" class="mf-canvas">
            <div id="mf-empty-hint" class="mf-empty-hint">
              <span style="font-size:40px; line-height:1; opacity:0.3;">${icon('share', 40)}</span>
              <p style="margin-top:8px; font:var(--text-body-md);">在左侧输入 Mermaid 语法即可预览</p>
            </div>
          </div>
          <div class="mf-export-bar">
            <button class="btn btn-ghost btn-sm" id="mf-copy-svg">${icon('content_copy', 14)} 复制 SVG</button>
            <button class="btn btn-ghost btn-sm" id="mf-download-svg">${icon('download', 14)} 下载 SVG</button>
            <button class="btn btn-ghost btn-sm" id="mf-export-png">${icon('image', 14)} 导出 PNG</button>
          </div>
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

    input.value = initialCode;

    // ---- Theme observer ----
    _themeObserver = new MutationObserver(() => {
      initMermaid();
      doRender();
    });
    _themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // ---- Render ----
    let renderId = 0;

    async function doRender() {
      const code = input.value.trim();
      if (!code) {
        canvas.querySelectorAll('.mf-render-wrap').forEach(el => el.remove());
        emptyHint.style.display = '';
        errorEl.style.display = 'none';
        return;
      }

      emptyHint.style.display = 'none';
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
        wrap.innerHTML = svg;
        const svgEl = wrap.querySelector('svg') as SVGSVGElement;
        if (svgEl) {
          svgEl.style.maxWidth = 'none';
          svgEl.style.height = 'auto';
          applyZoom(svgEl);
        }
        errorEl.style.display = 'none';
      } catch (e: any) {
        if (id !== renderId) return;
        errorEl.style.display = '';
        errorEl.textContent = '解析错误: ' + (e.message || String(e));
        const w = canvas.querySelector('.mf-render-wrap');
        if (w) (w as HTMLElement).innerHTML = '';
      }
    }

    function applyZoom(svgEl?: SVGSVGElement) {
      const wrap = canvas.querySelector('.mf-render-wrap') as HTMLElement;
      if (!wrap) return;
      const el = svgEl || wrap.querySelector('svg') as SVGSVGElement;
      if (el) {
        el.style.transform = `scale(${zoom})`;
        el.style.transformOrigin = 'top left';
      }
      wrap.style.minWidth = `${100 * zoom}%`;
      wrap.style.minHeight = `${100 * zoom}%`;
      zoomLabel.textContent = Math.round(zoom * 100) + '%';
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
      const svgEl = canvas.querySelector('.mf-render-wrap svg') as SVGSVGElement;
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
