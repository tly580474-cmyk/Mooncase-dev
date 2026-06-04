import { icon } from '../core/icons';
import { getRegistry, type ToolCategory } from '../core/registry';
import { getRecentTools } from '../core/storage';
import { navigate } from '../core/router';

const categoryNames: Record<ToolCategory, string> = {
  text: '文本工具',
  image: '图片工具',
  code: '代码工具',
  conversion: '格式转换',
  encoding: '编码解码',
  generator: '生成器',
  security: '安全工具',
  network: '网络工具',
};

const categoryIcons: Record<ToolCategory, string> = {
  text: 'description',
  image: 'image',
  code: 'code',
  conversion: 'swap_horiz',
  encoding: 'binary',
  generator: 'settings_suggest',
  security: 'security',
  network: 'language',
};

const categoryDescriptions: Record<ToolCategory, string> = {
  text: '文本统计、提取、替换与语言处理',
  image: '图片编辑、识别、取色与动图处理',
  code: '代码格式化、运行、预览与图表绘制',
  conversion: '文档、数据、图片、音频与视频格式互转',
  encoding: '文本、链接、令牌与媒体编码解码',
  generator: 'UUID、二维码、占位文与字符艺术生成',
  security: '密码、哈希、签名与加密解密工具',
  network: 'IP、DNS、连通性与 HTTP 请求测试',
};

function renderHero(): string {
  return `
    <section class="hero mb-12">
      <div style="position: relative; z-index: 1; max-width: 640px;">
        <h1 style="font: var(--text-headline-lg); margin-bottom: 16px;">欢迎使用月光宝盒在线工具</h1>
        <p style="font: var(--text-body-lg); opacity: 0.9; margin-bottom: 32px;">
          高效、安全、免安装的专业在线工具箱。涵盖文本处理、代码格式化、图像编辑等实用工具，助您轻松提升工作效率。
        </p>
        <div class="search-box">
          <span class="search-icon">${icon('search')}</span>
          <input id="global-search" type="text" placeholder="搜索您需要的工具..." />
          <div id="search-results" class="search-results-dropdown"></div>
        </div>
      </div>
    </section>
  `;
}

function renderRecent(): string {
  const recent = getRecentTools();
  if (recent.length === 0) return '';

  const registry = getRegistry();

  return `
    <section class="mb-12">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <h3 style="font: var(--text-headline-md); display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--color-primary);">${icon('history')}</span>
          最近使用
        </h3>
      </div>
      <div class="tool-grid tool-grid--5">
        ${recent.slice(0, 5).map(r => {
          const tool = registry.find(t => t.id === r.id);
          return `
            <a class="card" href="#/${r.id}" style="cursor: pointer; display: block;">
              <div style="width: 40px; height: 40px; background: var(--color-primary-container); color: var(--color-on-primary-container); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                ${icon(tool?.icon || 'build')}
              </div>
              <p style="font: var(--text-label-md); font-weight: 600; margin-bottom: 4px;">${r.name}</p>
              <p style="font-size: 11px; color: var(--color-on-surface-variant); opacity: 0.6;">
                ${timeAgo(r.timestamp)}
              </p>
            </a>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderBentoGrid(): string {
  const registry = getRegistry();
  const categories: ToolCategory[] = ['text', 'image', 'code', 'encoding', 'generator', 'network', 'conversion', 'security'];

  return `
    <section class="mb-16">
      <h3 style="font: var(--text-headline-md); margin-bottom: 32px;">全部工具分类</h3>
      <div class="bento-grid">
        ${categories.map(cat => {
          const tools = registry.filter(t => t.category === cat);
          const isWide = cat === 'text' || cat === 'image';
          return `
            <div class="bento-item ${isWide ? 'bento-item--wide' : 'bento-item--narrow'}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div>
                  <h4 style="font: var(--text-headline-sm); margin-bottom: 8px;">${categoryNames[cat]}</h4>
                  <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">${categoryDescriptions[cat]}</p>
                </div>
                <span style="color: var(--color-primary); opacity: 0.2;">${icon(categoryIcons[cat], 36)}</span>
              </div>
              <ul style="display: grid; gap: 12px; ${isWide ? 'grid-template-columns: 1fr 1fr;' : ''}">
                ${tools.map(tool => `
                  <li>
                    <a href="#/${tool.id}" style="display: flex; align-items: center; gap: 8px; font: var(--text-body-md); color: var(--color-on-surface); transition: color var(--transition-fast);" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-on-surface)'">
                      <span style="width: 4px; height: 4px; background: var(--color-primary); border-radius: 50%;"></span>
                      ${tool.name}
                    </a>
                  </li>
                `).join('')}
                ${tools.length === 0 ? '<li style="font: var(--text-body-md); color: var(--color-on-surface-variant); opacity: 0.5;">即将推出</li>' : ''}
              </ul>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return '刚刚';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`;
  return `${Math.floor(seconds / 86400)} 天前`;
}

export default {
  id: 'home',
  name: '首页',
  icon: 'history',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        ${renderHero()}
        ${renderRecent()}
        ${renderBentoGrid()}
      </div>
    `;

    // 绑定搜索
    const searchInput = container.querySelector('#global-search') as HTMLInputElement;
    if (searchInput) {
      import('../core/search').then(({ initSearch }) => {
        initSearch(searchInput, (toolId) => {
          navigate(toolId);
        });
      });
    }
  },
};
