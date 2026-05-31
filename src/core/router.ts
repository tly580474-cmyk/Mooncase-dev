type ToolModule = {
  default: {
    id: string;
    name: string;
    icon: string;
    render: (container: HTMLElement) => void;
    destroy?: () => void;
  };
};

type RouteHandler = () => void;

let currentToolId: string | null = null;
let currentDestroy: (() => void) | null = null;
let contentArea: HTMLElement | null = null;
const listeners: RouteHandler[] = [];
let suppressHashChange = false;

// 工具路由表 - 懒加载
const toolLoaders: Record<string, () => Promise<ToolModule>> = {
  'home': () => import('../pages/home'),
  // 分类页
  'text': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('text') })),
  'image': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('image') })),
  'code': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('code') })),
  'encoding': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('encoding') })),
  'conversion': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('conversion') })),
  'generator': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('generator') })),
  'security': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('security') })),
  'network': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('network') })),
  // 文本工具
  'text-diff': () => import('../pages/tools/text-diff'),
  'full-half-width': () => import('../pages/tools/full-half-width'),
  'char-count': () => import('../pages/tools/char-count'),
  'text-dedup': () => import('../pages/tools/text-dedup'),
  'word-extract': () => import('../pages/tools/word-extract'),
  'text-replace': () => import('../pages/tools/text-replace'),
  'case-converter': () => import('../pages/tools/case-converter'),
  'cn-traditional': () => import('../pages/tools/cn-traditional'),
  'en-case': () => import('../pages/tools/en-case'),
  'hanzi-pinyin': () => import('../pages/tools/hanzi-pinyin'),
  'md-to-word': () => import('../pages/tools/md-to-word'),
  'char-counter': () => import('../pages/tools/char-counter'),
  // 代码工具
  'json-formatter': () => import('../pages/tools/json-formatter'),
  'code-beautify': () => import('../pages/tools/code-beautify'),
  'regex-test': () => import('../pages/tools/regex-test'),
  'markdown-preview': () => import('../pages/tools/markdown-preview'),
  'code-highlight': () => import('../pages/tools/code-highlight'),
  'image-base64-code': () => import('../pages/tools/image-base64-code'),
  'svg-to-base64': () => import('../pages/tools/svg-to-base64'),
  'ascii-art': () => import('../pages/tools/ascii-art'),
  'sql-er-diagram': () => import('../pages/tools/sql-er-diagram'),
  'mermaid-flowchart': () => import('../pages/tools/mermaid-flowchart'),
  // 编码解码
  'base64': () => import('../pages/tools/base64'),
  'url-encode': () => import('../pages/tools/url-encode'),
  'unicode': () => import('../pages/tools/unicode'),
  'base-x': () => import('../pages/tools/base-x'),
  'morse': () => import('../pages/tools/morse'),
  'jwt-decode': () => import('../pages/tools/jwt-decode'),
  // 格式转换
  'image-convert': () => import('../pages/tools/image-convert'),
  'data-convert': () => import('../pages/tools/data-convert'),
  // 生成器
  'password-gen': () => import('../pages/tools/password-gen'),
  'uuid-gen': () => import('../pages/tools/uuid-gen'),
  'lorem-gen': () => import('../pages/tools/lorem-gen'),
  'qr-code': () => import('../pages/tools/qr-code'),
  'qr-scan': () => import('../pages/tools/qr-scan'),
  // 图片工具
  'image-compress': () => import('../pages/tools/image-compress'),
  'image-crop': () => import('../pages/tools/image-crop'),
  'image-base64': () => import('../pages/tools/image-base64'),
  'image-to-pdf': () => import('../pages/tools/image-to-pdf'),
  'gif-maker': () => import('../pages/tools/gif-maker'),
  'animated-avatar': () => import('../pages/tools/animated-avatar'),
  'image-color-picker': () => import('../pages/tools/image-color-picker'),
  'ocr-extract': () => import('../pages/tools/ocr-extract'),
  'image-upscale': () => import('../pages/tools/image-upscale'),
  // 安全工具
  'hash-gen': () => import('../pages/tools/hash-gen'),
  'hmac-gen': () => import('../pages/tools/hmac-gen'),
  'http-tester': () => import('../pages/tools/http-tester'),
  'symmetric-crypto': () => import('../pages/tools/symmetric-crypto'),
  'caesar-cipher': () => import('../pages/tools/caesar-cipher'),
  'rail-fence': () => import('../pages/tools/rail-fence'),
  // 网络工具
  'ip-query': () => import('../pages/tools/ip-query'),
  'online-ping': () => import('../pages/tools/online-ping'),
  'online-tcping': () => import('../pages/tools/online-tcping'),
  'website-speed': () => import('../pages/tools/website-speed'),
  'traceroute': () => import('../pages/tools/traceroute'),
  'dns-query': () => import('../pages/tools/dns-query'),
  'find-ping': () => import('../pages/tools/find-ping'),
  'localhost-net': () => import('../pages/tools/localhost-net'),
  // 视频工具
  'video-convert': () => import('../pages/tools/video-convert'),
  'video-to-gif': () => import('../pages/tools/video-to-gif'),
  'video-to-mp3': () => import('../pages/tools/video-to-mp3'),
  'video-compress': () => import('../pages/tools/video-compress'),
};

function getToolId(): string {
  const hash = location.hash.slice(2);
  return hash || 'home';
}

function setContentArea(el: HTMLElement) {
  contentArea = el;
}

async function navigate(toolId: string) {
  // 如果是同一个工具，跳过
  if (toolId === currentToolId) return;

  if (!contentArea) return;

  // 销毁上一个工具
  if (currentDestroy) {
    currentDestroy();
    currentDestroy = null;
  }

  currentToolId = toolId;

  // 更新 URL hash（不触发 hashchange 循环）
  const expectedHash = '#/' + toolId;
  if (location.hash !== expectedHash) {
    suppressHashChange = true;
    location.hash = expectedHash;
    // 下一个事件循环解除抑制
    setTimeout(() => { suppressHashChange = false; }, 0);
  }

  // 加载新工具
  const loader = toolLoaders[toolId];
  if (!loader) {
    contentArea.innerHTML = `<div class="content"><h2>404 - 工具未找到</h2></div>`;
    return;
  }

  try {
    const mod = await loader();
    contentArea.innerHTML = '';
    mod.default.render(contentArea);
    currentDestroy = mod.default.destroy ?? null;
  } catch (err) {
    console.error('Failed to load tool:', toolId, err);
    contentArea.innerHTML = `<div class="content"><h2>加载失败</h2><p>${err}</p></div>`;
  }

  listeners.forEach(fn => fn());
}

function onRouteChange(fn: RouteHandler) {
  listeners.push(fn);
}

function registerTool(id: string, loader: () => Promise<ToolModule>) {
  toolLoaders[id] = loader;
}

function getCurrentToolId(): string {
  return getToolId();
}

function initRouter() {
  window.addEventListener('hashchange', () => {
    if (suppressHashChange) return;
    navigate(getToolId());
  });
}

export {
  initRouter,
  setContentArea,
  navigate,
  onRouteChange,
  registerTool,
  getCurrentToolId,
  type ToolModule,
};
